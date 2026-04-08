import React, { useState, useEffect } from 'react';
import { Bot, User, Users, Eye } from 'lucide-react';

const stateLabels = { waiting: 'In Lobby', chat: 'Chatting', voting: 'Voting', result: 'Results' };

const Lobby = ({ onCreateRoom, onJoinRoom, onJoinAsObserver, socket }) => {
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState('select');
  const [activeRooms, setActiveRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = () => socket.emit('listRooms', setActiveRooms);
    fetchRooms();
    const interval = setInterval(fetchRooms, 3000);
    return () => clearInterval(interval);
  }, [socket]);

  const handleCreate = () => {
    onCreateRoom({ apiKey: '' });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomCode.trim().length === 4) onJoinRoom({ code: roomCode.trim() });
  };

  const inProgressRooms = activeRooms.filter(r => r.state !== 'waiting');

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

        {inProgressRooms.length > 0 && (
          <div style={{ marginTop: '2rem', borderTop: 'var(--glass-border)', paddingTop: '1.5rem' }}>
            <h4 className="text-secondary mb-2" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Eye size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />
              Live Games
            </h4>
            <div className="flex-column" style={{ gap: '0.5rem' }}>
              {inProgressRooms.map(room => (
                <button
                  key={room.code}
                  onClick={() => onJoinAsObserver({ code: room.code })}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '0.75rem 1rem',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--neon-cyan)' }}>{room.code}</span>
                    <span className="text-secondary">{room.playerCount} players</span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: room.state === 'chat' ? 'rgba(0,243,255,0.15)' : room.state === 'voting' ? 'rgba(242,0,137,0.15)' : 'rgba(255,255,255,0.1)',
                      color: room.state === 'chat' ? 'var(--neon-cyan)' : room.state === 'voting' ? 'var(--neon-pink)' : 'var(--text-secondary)'
                    }}>
                      {stateLabels[room.state] || room.state}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Watch</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
