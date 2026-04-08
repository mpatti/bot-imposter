import React, { useState } from 'react';
import { Bot, User, Users } from 'lucide-react';

const Lobby = ({ onCreateRoom, onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState('select');

  const handleCreate = () => {
    onCreateRoom({ apiKey: '' });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomCode.trim().length === 4) onJoinRoom({ code: roomCode.trim() });
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
            <li>You'll be assigned a random name — so will the bot.</li>
            <li>Chat naturally to identify the bot.</li>
            <li>Vote for the player you think is the AI when time runs out!</li>
          </ul>
        </div>
        
        {mode === 'select' && (
          <div className="flex-column" style={{ gap: '1rem' }}>
            <button onClick={handleCreate} className="primary">
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
