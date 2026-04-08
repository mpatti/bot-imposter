import React, { useState } from 'react';
import { Target } from 'lucide-react';
import { simulatedPlayers } from '../gameLogic';

const VotingScreen = ({ onVote }) => {
  const [selectedId, setSelectedId] = useState(null);

  const handleSubmit = () => {
    if (selectedId) {
      onVote(selectedId);
    }
  };

  return (
    <div className="container flex-center">
      <div className="glass-container fade-in" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="text-center mb-4">
          <Target size={64} className="mb-2" style={{ color: 'var(--neon-pink)' }} />
          <h2>Time's Up!</h2>
          <p className="text-secondary">Who do you think is the Bot Imposter?</p>
        </div>

        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          {simulatedPlayers.map(player => (
            <button
              key={player.id}
              onClick={() => setSelectedId(player.id)}
              style={{
                background: selectedId === player.id ? 'rgba(242, 0, 137, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: selectedId === player.id ? '1px solid var(--neon-pink)' : 'var(--glass-border)',
                justifyContent: 'flex-start',
                padding: '1rem',
                transform: selectedId === player.id ? 'scale(1.02)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '40px', height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--bg-dark)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', border: 'var(--glass-border)'
                }}>
                  {player.name[0]}
                </div>
                <span style={{ fontSize: '1.2rem' }}>{player.name}</span>
              </div>
            </button>
          ))}
        </div>

        <button 
          onClick={handleSubmit} 
          className="primary" 
          disabled={!selectedId} 
          style={{ width: '100%' }}
        >
          Confirm Vote
        </button>
      </div>
    </div>
  );
};

export default VotingScreen;
