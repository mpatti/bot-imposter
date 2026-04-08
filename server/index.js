import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { getBotImposterId, simulatedPlayers, fetchBotResponse, generateBotName } from './botLogic.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Room state: { [roomCode]: { state: 'waiting' | 'chat' | 'voting' | 'result', players: [], botId: string, botName: string, messages: [], apiKey: string, timer: number, votes: {} } }
const rooms = {};

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

io.on('connection', (socket) => {
  
  socket.on('createRoom', ({ name, apiKey }, callback) => {
    const roomCode = generateRoomCode();
    socket.join(roomCode);
    
    // Select a random bot player
    const botIndex = Math.floor(Math.random() * simulatedPlayers.length);
    const botPlayer = simulatedPlayers[botIndex];
    
    rooms[roomCode] = {
      state: 'waiting',
      players: [{ id: socket.id, name, isHost: true }],
      botPlayer: botPlayer,
      messages: [],
      apiKey: apiKey || ANTHROPIC_API_KEY,
      timer: 60,
      votes: {},
      botIntervalArgs: null
    };
    
    callback({ roomCode, players: rooms[roomCode].players });
  });

  socket.on('joinRoom', ({ name, roomCode }, callback) => {
    if (rooms[roomCode] && rooms[roomCode].state === 'waiting') {
      socket.join(roomCode);
      rooms[roomCode].players.push({ id: socket.id, name, isHost: false });
      
      io.to(roomCode).emit('roomUpdate', { players: rooms[roomCode].players });
      callback({ success: true, players: rooms[roomCode].players });
    } else {
      callback({ success: false, error: "Room not found or already in progress." });
    }
  });

  socket.on('startGame', (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;
    
    room.state = 'chat';
    
    // Add the bot to the visible players for the clients
    const allPlayers = [...room.players, { id: room.botPlayer.id, name: room.botPlayer.name, isHost: false }];
    
    io.to(roomCode).emit('gameStarted', { state: 'chat', allPlayers, botId: room.botPlayer.id });

    // Start timer
    let timeLeft = room.timer;
    const interval = setInterval(() => {
      timeLeft--;
      io.to(roomCode).emit('timerUpdate', timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(interval);
        if (room.botIntervalArgs) clearTimeout(room.botIntervalArgs);
        room.state = 'voting';
        io.to(roomCode).emit('gameStateChange', 'voting');

        // Start 30-second voting timer
        let voteTime = 30;
        const voteInterval = setInterval(() => {
          voteTime--;
          io.to(roomCode).emit('voteTimerUpdate', voteTime);
          if (voteTime <= 0) {
            clearInterval(voteInterval);
            if (room.state === 'voting') {
              room.state = 'result';
              io.to(roomCode).emit('gameResult', {
                votes: room.votes,
                botId: room.botPlayer.id,
                botName: room.botPlayer.name
              });
            }
          }
        }, 1000);
        room.voteInterval = voteInterval;
      }
    }, 1000);

    // Start bot chat logic
    scheduleBotMessage(roomCode);
  });

  const scheduleBotMessage = (roomCode) => {
    const room = rooms[roomCode];
    if (!room || room.state !== 'chat') return;

    const delay = 5000 + Math.random() * 10000;
    
    room.botIntervalArgs = setTimeout(async () => {
      if (room.state !== 'chat') return;

      const lastMsg = room.messages[room.messages.length - 1];
      if (lastMsg && lastMsg.sender === room.botPlayer.name) {
        scheduleBotMessage(roomCode); // don't double message
        return;
      }

      let text = '';
      if (room.apiKey && room.messages.length > 0) {
        text = await fetchBotResponse(room.messages, room.apiKey, room.botPlayer.name);
      } else {
        // use fallback if no api key
        const { generateResponse } = await import('./botLogic.js');
        text = generateResponse();
      }

      // Simulate realistic typing delay based on message length
      const typingDelay = Math.min(800 + text.length * 80, 4000);
      io.to(roomCode).emit('typingIndicator', { sender: room.botPlayer.name });

      setTimeout(() => {
        if (room.state !== 'chat') return;
        const msgObj = { sender: room.botPlayer.name, text, isMe: false };
        room.messages.push(msgObj);
        io.to(roomCode).emit('typingStop', { sender: room.botPlayer.name });
        io.to(roomCode).emit('chatMessage', msgObj);

        scheduleBotMessage(roomCode);
      }, typingDelay);
    }, delay);
  };

  socket.on('chatMessage', ({ roomCode, text }) => {
    const room = rooms[roomCode];
    if (room && room.state === 'chat') {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        const msgObj = { sender: player.name, text, id: socket.id };
        room.messages.push(msgObj);
        io.to(roomCode).emit('chatMessage', msgObj);
      }
    }
  });

  socket.on('submitVote', ({ roomCode, voteForId }) => {
    const room = rooms[roomCode];
    if (room && room.state === 'voting') {
      room.votes[socket.id] = voteForId;
      
      // If everyone except bot voted
      if (Object.keys(room.votes).length === room.players.length) {
        room.state = 'result';
        if (room.voteInterval) clearInterval(room.voteInterval);
        io.to(roomCode).emit('gameResult', {
          votes: room.votes,
          botId: room.botPlayer.id,
          botName: room.botPlayer.name
        });
      }
    }
  });

  socket.on('playAgain', (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;

    // Pick a fresh bot with a new name
    const botPlayer = {
      id: 'p' + Math.floor(Math.random() * 9999),
      name: generateBotName()
    };

    room.state = 'waiting';
    room.botPlayer = botPlayer;
    room.messages = [];
    room.votes = {};
    room.botIntervalArgs = null;
    if (room.voteInterval) clearInterval(room.voteInterval);

    // Mark first player as host
    room.players.forEach((p, i) => { p.isHost = i === 0; });

    io.to(roomCode).emit('backToWaiting', { players: room.players });
  });

  socket.on('disconnect', () => {
    // cleanup
    for (const roomCode in rooms) {
      rooms[roomCode].players = rooms[roomCode].players.filter(p => p.id !== socket.id);
      io.to(roomCode).emit('roomUpdate', { players: rooms[roomCode].players });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket server listening on port ${PORT}`);
});
