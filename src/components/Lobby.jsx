import React, { useState } from 'react';
import { Bot, User } from 'lucide-react';

const Lobby = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin({ name: name.trim(), apiKey: apiKey.trim() });
    }
  };

  return (
    <div className="container flex-center">
      <div className="glass-container fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <Bot size={64} className="mb-2" style={{ color: 'var(--neon-cyan)' }} />
          <h1>Bot Imposter</h1>
          <p className="text-secondary">Find the AI hiding among humans.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-column">
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
          <button type="submit" className="primary" disabled={!name.trim()}>
            <User size={20} />
            Join Lobby
          </button>
        </form>
      </div>
    </div>
  );
};

export default Lobby;
