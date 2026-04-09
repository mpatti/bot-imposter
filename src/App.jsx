import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Lobby from './components/Lobby';
import ChatRoom from './components/ChatRoom';
import VotingScreen from './components/VotingScreen';
import ResultScreen from './components/ResultScreen';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
const socket = io(SERVER_URL);

function App() {
  const [gameState, setGameState] = useState('lobby');
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [botId, setBotId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [scores, setScores] = useState({ wins: 0, losses: 0 });
  const [isObserver, setIsObserver] = useState(false);
  const [initialMessages, setInitialMessages] = useState([]);
  const [initialTimeLeft, setInitialTimeLeft] = useState(60);
  const [initialVoteTimeLeft, setInitialVoteTimeLeft] = useState(30);

  useEffect(() => {
    socket.on('roomUpdate', ({ players }) => {
      setPlayers(players);
    });

    socket.on('gameStarted', ({ state, allPlayers, botId }) => {
      setAllPlayers(allPlayers);
      setBotId(botId);
      setInitialMessages([]);
      setGameState(state);
    });

    socket.on('gameStateChange', (state) => {
      setGameState(state);
    });

    socket.on('gameResult', (result) => {
      setGameResult(result);
      setGameState('result');

      if (!isObserver) {
        const userVoteId = result.votes[socket.id];
        if (userVoteId === result.botId) {
          setScores(prev => ({ ...prev, wins: prev.wins + 1 }));
        } else {
          setScores(prev => ({ ...prev, losses: prev.losses + 1 }));
        }
      }
    });

    socket.on('backToWaiting', ({ players }) => {
      setPlayers(players);
      setAllPlayers([]);
      setGameResult(null);
      setInitialMessages([]);
      setIsHost(players[0]?.id === socket.id);
      const me = players.find(p => p.id === socket.id);
      if (me) {
        setUserName(me.name);
        setIsObserver(false);
      }
      setGameState('waiting');
    });

    return () => {
      socket.off('roomUpdate');
      socket.off('gameStarted');
      socket.off('gameStateChange');
      socket.off('gameResult');
      socket.off('backToWaiting');
    };
  }, [isObserver]);

  const startLobby = () => {
    setGameState('lobby');
    setUserName('');
    setRoomCode('');
    setPlayers([]);
    setAllPlayers([]);
    setBotId('');
    setIsHost(false);
    setGameResult(null);
    setIsObserver(false);
    setInitialMessages([]);
  };

  const handleCreateRoom = ({ apiKey }) => {
    setIsHost(true);
    socket.emit('createRoom', { apiKey }, ({ roomCode, players, assignedName }) => {
      setUserName(assignedName);
      setRoomCode(roomCode);
      setPlayers(players);
      setGameState('waiting');
    });
  };

  const handleJoinRoom = ({ code }) => {
    setIsHost(false);
    socket.emit('joinRoom', { roomCode: code.toUpperCase() }, (res) => {
      if (res.success) {
        setUserName(res.assignedName);
        setRoomCode(code.toUpperCase());
        setPlayers(res.players);
        setGameState('waiting');
      } else {
        alert(res.error);
      }
    });
  };

  const handleJoinAsObserver = ({ code }) => {
    socket.emit('joinAsObserver', { roomCode: code.toUpperCase() }, (res) => {
      if (!res.success) {
        alert(res.error);
        return;
      }
      setIsObserver(true);
      setRoomCode(code.toUpperCase());
      setPlayers(res.players);
      setAllPlayers(res.allPlayers);
      setInitialMessages(res.messages || []);
      setInitialTimeLeft(res.timeLeft ?? 60);
      setInitialVoteTimeLeft(res.voteTimeLeft ?? 30);
      if (res.result) setGameResult(res.result);
      setGameState(res.state);
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

  const handlePlayAgain = () => {
    socket.emit('playAgain', roomCode);
  };

  const observerBanner = isObserver ? (
    <div style={{
      background: 'rgba(0, 243, 255, 0.1)',
      border: '1px solid rgba(0, 243, 255, 0.3)',
      borderRadius: '8px',
      padding: '0.6rem 1rem',
      textAlign: 'center',
      fontSize: '0.85rem',
      color: 'var(--neon-cyan)',
      marginBottom: '1rem'
    }}>
      Observing — you'll join the next round
    </div>
  ) : null;

  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', width: '100vw' }}>
      {gameState === 'lobby' && (
        <Lobby
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onJoinAsObserver={handleJoinAsObserver}
          socket={socket}
        />
      )}
      
      {gameState === 'waiting' && (
        <div className="container flex-center">
          <div className="glass-container fade-in text-center" style={{ width: '100%', maxWidth: '400px' }}>
            {observerBanner}
            <h2>Room Code: {roomCode}</h2>
            {!isObserver && (
              <div style={{ marginBottom: '1rem', color: 'var(--neon-cyan)', fontSize: '1.1rem' }}>
                You are: <strong>{userName}</strong>
              </div>
            )}
            <div className="mb-4">
              <h4 className="text-secondary mb-2">Players Waiting:</h4>
              {players.map((p, i) => (
                <div key={i} style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  {p.name} {p.isHost && '(Host)'}
                </div>
              ))}
            </div>
            {!isObserver && isHost ? (
              <button onClick={handleStartGame} className="primary" style={{ width: '100%' }}>
                Start Game
              </button>
            ) : !isObserver ? (
              <p className="text-secondary">Waiting for host to start...</p>
            ) : null}
          </div>
        </div>
      )}

      {gameState === 'chat' && (
        <ChatRoom
          userName={userName}
          socket={socket}
          roomCode={roomCode}
          allPlayers={allPlayers}
          scores={scores}
          isObserver={isObserver}
          initialMessages={initialMessages}
          initialTimeLeft={initialTimeLeft}
        />
      )}

      {gameState === 'voting' && (
        <VotingScreen
          allPlayers={allPlayers}
          onVote={handleVote}
          socket={socket}
          isObserver={isObserver}
          initialVoteTimeLeft={initialVoteTimeLeft}
        />
      )}

      {gameState === 'result' && gameResult && (
        <ResultScreen
          botId={gameResult.botId}
          botName={gameResult.botName}
          votes={gameResult.votes}
          socketId={socket.id}
          onPlayAgain={handlePlayAgain}
          onLeave={startLobby}
          scores={scores}
          isObserver={isObserver}
        />
      )}
    </div>
  );
}

export default App;
