import React from 'react';
import { Bot, User, RotateCcw, DoorOpen } from 'lucide-react';

const ResultScreen = ({ botId, botName, votes, socketId, onPlayAgain, onLeave, scores }) => {
  const userVoteId = votes[socketId];
  const isWinner = botId === userVoteId;

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
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>{botName}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', borderTop: 'var(--glass-border)', paddingTop: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="text-secondary" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Session Wins</div>
              <div style={{ fontSize: '1.2rem', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>{scores.wins}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="text-secondary" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Session Losses</div>
              <div style={{ fontSize: '1.2rem', color: 'var(--neon-pink)', fontWeight: 'bold' }}>{scores.losses}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button onClick={onPlayAgain} className="primary" style={{ width: '100%' }}>
            <RotateCcw size={20} />
            Play Again
          </button>
          <button onClick={onLeave} style={{ width: '100%', background: 'rgba(255,255,255,0.08)' }}>
            <DoorOpen size={20} />
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
