import React, { useState } from 'react';
import { Bot, User, Users } from 'lucide-react';

const Lobby = ({ onCreateRoom, onJoinRoom }) => {
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState('select'); // select, create, join

  const handleCreate = (e) => {
    e.preventDefault();
    if (name.trim()) onCreateRoom({ name: name.trim(), apiKey: apiKey.trim() });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (name.trim() && roomCode.trim().length === 4) onJoinRoom({ name: name.trim(), code: roomCode.trim() });
  };

  return (
    <div className="container flex-center">
      <div className="glass-container fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <Bot size={64} className="mb-2" style={{ color: 'var(--neon-cyan)' }} />
          <h1>Bot Imposter</h1>
          <p className="text-secondary">Find the AI hiding among humans.</p>
        </div>
        
        {mode === 'select' && (
          <div className="flex-column" style={{ gap: '1rem' }}>
            <button onClick={() => setMode('create')} className="primary">
              <User size={20} />
              Create Room
            </button>
            <button onClick={() => setMode('join')} style={{ background: 'rgba(255,255,255,0.1)' }}>
              <Users size={20} />
              Join Room
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="flex-column">
            <div className="mb-3">
              <input
                type="text"
                placeholder="Enter your alias..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={15}
                autoFocus
              />
            </div>
            <div className="mb-4 text-center">
              <input
                type="password"
                placeholder="Gemini API Key (Optional for Real AI)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mb-1"
                style={{ fontSize: '0.85rem' }}
              />
              <small className="text-secondary" style={{ fontSize: '0.75rem' }}>If left blank, pre-scripted bots will be used.</small>
            </div>
            <button type="submit" className="primary" disabled={!name.trim()}>Create Lobby</button>
            <button type="button" onClick={() => setMode('select')} style={{ marginTop: '0.5rem', background: 'transparent' }}>Cancel</button>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="flex-column">
            <div className="mb-3">
              <input
                type="text"
                placeholder="Enter your alias..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={15}
                autoFocus
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="4-Letter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={4}
              />
            </div>
            <button type="submit" className="primary" disabled={!name.trim() || roomCode.length < 4}>Join Lobby</button>
            <button type="button" onClick={() => setMode('select')} style={{ marginTop: '0.5rem', background: 'transparent' }}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Lobby;
