import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Lobby from './components/Lobby';
import ChatRoom from './components/ChatRoom';
import VotingScreen from './components/VotingScreen';
import ResultScreen from './components/ResultScreen';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
const socket = io(SERVER_URL);

function App() {
  const [gameState, setGameState] = useState('lobby'); // lobby, waiting, chat, voting, result
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [botId, setBotId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  useEffect(() => {
    socket.on('roomUpdate', ({ players }) => {
      setPlayers(players);
    });

    socket.on('gameStarted', ({ state, allPlayers, botId }) => {
      setAllPlayers(allPlayers);
      setBotId(botId);
      setGameState(state);
    });

    socket.on('gameStateChange', (state) => {
      setGameState(state);
    });

    socket.on('gameResult', (result) => {
      setGameResult(result);
      setGameState('result');
    });

    return () => {
      socket.off('roomUpdate');
      socket.off('gameStarted');
      socket.off('gameStateChange');
      socket.off('gameResult');
    };
  }, []);

  const startLobby = () => {
    setGameState('lobby');
    setUserName('');
    setRoomCode('');
    setPlayers([]);
    setAllPlayers([]);
    setBotId('');
    setIsHost(false);
    setGameResult(null);
  };

  const handleCreateRoom = ({ name, apiKey }) => {
    setUserName(name);
    setIsHost(true);
    socket.emit('createRoom', { name, apiKey }, ({ roomCode, players }) => {
      setRoomCode(roomCode);
      setPlayers(players);
      setGameState('waiting');
    });
  };

  const handleJoinRoom = ({ name, code }) => {
    setUserName(name);
    setIsHost(false);
    socket.emit('joinRoom', { name, roomCode: code.toUpperCase() }, (res) => {
      if (res.success) {
        setRoomCode(code.toUpperCase());
        setPlayers(res.players);
        setGameState('waiting');
      } else {
        alert(res.error);
      }
    });
  };

  const handleStartGame = () => {
    if (isHost) {
      socket.emit('startGame', roomCode);
    }
  };

  const handleVote = (selectedId) => {
    socket.emit('submitVote', { roomCode, voteForId: selectedId });
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw' }}>
      {gameState === 'lobby' && (
        <Lobby onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
      )}
      
      {gameState === 'waiting' && (
        <div className="container flex-center">
          <div className="glass-container fade-in text-center" style={{ width: '100%', maxWidth: '400px' }}>
            <h2>Room Code: {roomCode}</h2>
            <div className="mb-4">
              <h4 className="text-secondary mb-2">Players Waiting:</h4>
              {players.map((p, i) => (
                <div key={i} style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  {p.name} {p.isHost && '(Host)'}
                </div>
              ))}
            </div>
            {isHost ? (
              <button onClick={handleStartGame} className="primary" style={{ width: '100%' }}>
                Start Game
              </button>
            ) : (
              <p className="text-secondary">Waiting for host to start...</p>
            )}
          </div>
        </div>
      )}

      {gameState === 'chat' && (
        <ChatRoom userName={userName} socket={socket} roomCode={roomCode} allPlayers={allPlayers} />
      )}

      {gameState === 'voting' && (
        <VotingScreen allPlayers={allPlayers} onVote={handleVote} socket={socket} />
      )}

      {gameState === 'result' && (
        <ResultScreen botId={gameResult.botId} botName={gameResult.botName} votes={gameResult.votes} socketId={socket.id} onPlayAgain={startLobby} />
      )}
    </div>
  );
}

export default App;
