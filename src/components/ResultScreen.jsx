import React from 'react';
import { Bot, User, RefreshCw } from 'lucide-react';
import { simulatedPlayers } from '../gameLogic';

const ResultScreen = ({ botId, userVoteId, onPlayAgain }) => {
  const isWinner = botId === userVoteId;
  const botPlayer = simulatedPlayers.find(p => p.id === botId);

  return (
    <div className="container flex-center">
      <div className="glass-container fade-in text-center" style={{ width: '100%', maxWidth: '500px' }}>
        
        {isWinner ? (
          <div>
            <User size={80} style={{ color: 'var(--neon-cyan)', margin: '0 auto 1rem auto' }} />
            <h1 style={{ color: 'var(--neon-cyan)', backgroundImage: 'none', WebkitTextFillColor: 'initial', textShadow: '0 0 10px rgba(0, 243, 255, 0.5)' }}>
              You Won!
            </h1>
            <p className="text-secondary mb-4" style={{ fontSize: '1.2rem' }}>
              Excellent deduction!
            </p>
          </div>
        ) : (
          <div>
            <Bot size={80} style={{ color: 'var(--neon-pink)', margin: '0 auto 1rem auto' }} />
            <h1 style={{ color: 'var(--neon-pink)', backgroundImage: 'none', WebkitTextFillColor: 'initial', textShadow: '0 0 10px rgba(242, 0, 137, 0.5)' }}>
              You Lost!
            </h1>
            <p className="text-secondary mb-4" style={{ fontSize: '1.2rem' }}>
              FOOLISH HUMAN. The AI has outsmarted you.
            </p>
          </div>
        )}

        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>The Bot Imposter was:</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{botPlayer?.name}</div>
        </div>

        <button onClick={onPlayAgain} className="primary" style={{ width: '100%' }}>
          <RefreshCw size={20} />
          Play Again
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
