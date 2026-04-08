import React, { useState, useEffect } from 'react';
import { Bot, User, Users } from 'lucide-react';

const generateRandomName = () => {
  const adjs = ['Neon', 'Cyber', 'Dark', 'Ghost', 'Void', 'Zero', 'Retro', 'Static', 'Quantum'];
  const nouns = ['Ninja', 'Rider', 'Wolf', 'Hawk', 'Runner', 'Spark', 'Pulse', 'Byte', 'Glitch'];
  return `${adjs[Math.floor(Math.random() * adjs.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 100)}`;
};

const Lobby = ({ onCreateRoom, onJoinRoom }) => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState('select'); // select, create, join

  useEffect(() => {
    setName(generateRandomName());
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    onCreateRoom({ name, apiKey: '' });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomCode.trim().length === 4) onJoinRoom({ name, code: roomCode.trim() });
  };

  return (
    <div className="container flex-center">
      <div className="glass-container fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <Bot size={64} className="mb-2" style={{ color: 'var(--neon-cyan)' }} />
          <h1>Guess the Bot</h1>
          <p className="text-secondary">One player is an AI. Can you spot which one?</p>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderLeft: '2px solid var(--neon-cyan)' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>How to play</h4>
          <ul style={{ paddingLeft: '1.2rem' }}>
            <li>Enter a room with friends.</li>
            <li>Chat naturally to identify the bot.</li>
            <li>The bot is powered by advanced AI and will try to blend in.</li>
            <li>Vote for the player you think is the AI when time runs out!</li>
          </ul>
        </div>
        
        {mode === 'select' && (
          <div className="flex-column" style={{ gap: '1rem' }}>
            <div className="text-center mb-2">
              <div className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Your alias</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--neon-cyan)' }}>{name}</div>
            </div>
            <button onClick={() => { setMode('create'); handleCreate({ preventDefault: () => {} }); }} className="primary">
              <User size={20} />
              Create Room
            </button>
            <button onClick={() => setMode('join')} style={{ background: 'rgba(255,255,255,0.1)' }}>
              <Users size={20} />
              Join Room
            </button>
          </div>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="flex-column">
            <div className="text-center mb-3">
              <div className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Your alias</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--neon-cyan)' }}>{name}</div>
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="4-Letter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />
            </div>
            <button type="submit" className="primary" disabled={roomCode.length < 4}>Join Lobby</button>
            <button type="button" onClick={() => setMode('select')} style={{ marginTop: '0.5rem', background: 'transparent' }}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Lobby;
