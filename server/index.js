import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fetchBotResponse, generateResponse, pickPersonality } from './botLogic.js';
import { filterMessage } from './profanityFilter.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const PLAYER_NAMES = ['Alex', 'Sam', 'Jordan', 'Riley', 'Casey'];

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = {};

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

io.on('connection', (socket) => {

  socket.on('listRooms', (callback) => {
    const roomList = Object.entries(rooms)
      .filter(([_, room]) => room.players.length > 0)
      .map(([code, room]) => ({
        code,
        state: room.state,
        playerCount: room.players.length,
        observerCount: room.observers.length
      }));
    callback(roomList);
  });
  
  socket.on('createRoom', ({ apiKey }, callback) => {
    const roomCode = generateRoomCode();
    socket.join(roomCode);
    
    const namePool = shuffleArray(PLAYER_NAMES);
    const assignedName = namePool.shift();
    
    rooms[roomCode] = {
      state: 'waiting',
      players: [{ id: socket.id, name: assignedName, isHost: true }],
      observers: [],
      namePool,
      botPlayer: null,
      messages: [],
      apiKey: apiKey || ANTHROPIC_API_KEY,
      timer: 90,
      currentTimeLeft: 90,
      currentVoteTimeLeft: 30,
      votes: {},
      botIntervalArgs: null
    };
    
    callback({ roomCode, players: rooms[roomCode].players, assignedName });
  });

  socket.on('joinRoom', ({ roomCode }, callback) => {
    const room = rooms[roomCode];
    if (room && room.state === 'waiting') {
      if (room.namePool.length <= 1) {
        callback({ success: false, error: "Room is full (max 4 players)." });
        return;
      }
      socket.join(roomCode);
      const assignedName = room.namePool.shift();
      room.players.push({ id: socket.id, name: assignedName, isHost: false });
      
      io.to(roomCode).emit('roomUpdate', { players: room.players });
      callback({ success: true, players: room.players, assignedName });
    } else {
      callback({ success: false, error: "Room not found or already in progress." });
    }
  });

  socket.on('joinAsObserver', ({ roomCode }, callback) => {
    const room = rooms[roomCode];
    if (!room) {
      callback({ success: false, error: "Room not found." });
      return;
    }
    socket.join(roomCode);
    room.observers.push({ id: socket.id });

    const allPlayers = room.botPlayer
      ? [...room.players, { id: room.botPlayer.id, name: room.botPlayer.name, isHost: false }]
      : room.players;

    callback({
      success: true,
      state: room.state,
      messages: room.messages,
      allPlayers,
      players: room.players,
      timeLeft: room.currentTimeLeft,
      voteTimeLeft: room.currentVoteTimeLeft,
      result: room.state === 'result' && room.botPlayer ? {
        votes: room.votes,
        botId: room.botPlayer.id,
        botName: room.botPlayer.name
      } : null
    });
  });

  socket.on('startGame', (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;
    
    room.state = 'chat';
    
    // Assign the bot a name from the remaining pool
    const botName = room.namePool.length > 0
      ? room.namePool[Math.floor(Math.random() * room.namePool.length)]
      : 'Unknown';
    const personality = pickPersonality();
    room.botPlayer = { id: 'bot-' + Math.floor(Math.random() * 99999), name: botName, personality };
    
    const allPlayers = [...room.players, { id: room.botPlayer.id, name: room.botPlayer.name, isHost: false }];
    
    io.to(roomCode).emit('gameStarted', { state: 'chat', allPlayers, botId: room.botPlayer.id });

    // Start timer
    let timeLeft = room.timer;
    room.currentTimeLeft = timeLeft;
    const interval = setInterval(() => {
      timeLeft--;
      room.currentTimeLeft = timeLeft;
      io.to(roomCode).emit('timerUpdate', timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(interval);
        if (room.botIntervalArgs) clearTimeout(room.botIntervalArgs);
        room.state = 'voting';
        io.to(roomCode).emit('gameStateChange', 'voting');

        // Start 30-second voting timer
        let voteTime = 30;
        room.currentVoteTimeLeft = voteTime;
        const voteInterval = setInterval(() => {
          voteTime--;
          room.currentVoteTimeLeft = voteTime;
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
        text = await fetchBotResponse(room.messages, room.apiKey, room.botPlayer.name, room.botPlayer.personality);
      } else {
        text = generateResponse();
      }

      if (room.state !== 'chat') return;
      const cleanText = filterMessage(text);
      const msgObj = { sender: room.botPlayer.name, text: cleanText, isMe: false };
      room.messages.push(msgObj);
      io.to(roomCode).emit('chatMessage', msgObj);

      scheduleBotMessage(roomCode);
    }, delay);
  };

  socket.on('chatMessage', ({ roomCode, text }) => {
    const room = rooms[roomCode];
    if (room && room.state === 'chat') {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        const msgObj = { sender: player.name, text: filterMessage(text), id: socket.id };
        room.messages.push(msgObj);
        io.to(roomCode).emit('chatMessage', msgObj);
      }
    }
  });

  socket.on('submitVote', ({ roomCode, voteForId }) => {
    const room = rooms[roomCode];
    if (room && room.state === 'voting') {
      if (!room.players.find(p => p.id === socket.id)) return;
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

    room.state = 'waiting';
    room.botPlayer = null;
    room.messages = [];
    room.votes = {};
    room.botIntervalArgs = null;
    if (room.voteInterval) clearInterval(room.voteInterval);

    // Promote observers into the player pool
    const maxPlayers = PLAYER_NAMES.length - 1;
    const combined = [...room.players.map(p => ({ id: p.id }))];
    for (const obs of room.observers) {
      if (combined.length < maxPlayers) {
        combined.push({ id: obs.id });
      }
    }
    const promoted = new Set(room.observers.map(o => o.id));
    room.observers = room.observers.filter(o => !combined.find(c => c.id === o.id));

    // Reshuffle names for everyone
    const namePool = shuffleArray(PLAYER_NAMES);
    room.players = combined.map((p, i) => ({
      id: p.id,
      name: namePool[i],
      isHost: i === 0
    }));
    room.namePool = namePool.slice(combined.length);

    io.to(roomCode).emit('backToWaiting', { players: room.players });
  });

  socket.on('disconnect', () => {
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      room.players = room.players.filter(p => p.id !== socket.id);
      room.observers = room.observers.filter(o => o.id !== socket.id);
      io.to(roomCode).emit('roomUpdate', { players: room.players });
      if (room.players.length === 0 && room.observers.length === 0) {
        delete rooms[roomCode];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket server listening on port ${PORT}`);
});
