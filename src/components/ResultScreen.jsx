import React from 'react';
import { Bot, User, RotateCcw, DoorOpen, Eye, Crosshair } from 'lucide-react';

const ResultScreen = ({ botId, botName, votes, socketId, onPlayAgain, onLeave, scores, isObserver, allPlayers }) => {
  const userVoteId = votes[socketId];
  const isWinner = !isObserver && botId === userVoteId;
  const accusedThisRound = !isObserver ? Object.values(votes).filter(v => v === socketId).length : 0;

  const voteTally = {};
  for (const votedFor of Object.values(votes)) {
    voteTally[votedFor] = (voteTally[votedFor] || 0) + 1;
  }

  const playerName = (id) => {
    const p = (allPlayers || []).find(p => p.id === id);
    return p ? p.name : id;
  };

  return (
    <div className="container flex-center">
      <div className="glass-container fade-in text-center" style={{ width: '100%', maxWidth: '500px' }}>

        {isObserver ? (
          <div>
            <div style={{
              background: 'rgba(0, 243, 255, 0.1)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: 'var(--neon-cyan)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}>
              <Eye size={14} />
              Observing — you'll join the next round
            </div>
            <Bot size={80} style={{ color: 'var(--neon-cyan)', margin: '0 auto 1rem auto' }} />
            <h2>Round Over</h2>
          </div>
        ) : isWinner ? (
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

        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>The Bot Imposter was:</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>{botName}</div>

          {!isObserver && accusedThisRound > 0 && (
            <div style={{
              background: 'rgba(242, 0, 137, 0.1)',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              color: 'var(--neon-pink)',
            }}>
              <Crosshair size={14} />
              {accusedThisRound} player{accusedThisRound > 1 ? 's' : ''} thought YOU were the bot! +{accusedThisRound} pts
            </div>
          )}

          {/* Per-player results */}
          {allPlayers && allPlayers.length > 0 && Object.keys(votes).length > 0 && (
            <div style={{ borderTop: 'var(--glass-border)', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="text-secondary" style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Player Results</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {allPlayers.filter(p => p.id !== botId).map(p => {
                  const theirVote = votes[p.id];
                  const gotItRight = theirVote === botId;
                  const votedForName = playerName(theirVote);
                  const isMe = p.id === socketId;
                  const accusedCount = Object.values(votes).filter(v => v === p.id).length;
                  return (
                    <div key={p.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      background: gotItRight ? 'rgba(0, 243, 255, 0.08)' : 'rgba(242, 0, 137, 0.05)',
                      fontSize: '0.85rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1rem' }}>{gotItRight ? '✓' : '✗'}</span>
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: isMe ? '700' : '400' }}>
                            {p.name}{isMe && !isObserver ? ' (you)' : ''}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            voted {votedForName}{theirVote === botId ? ' 🤖' : ''}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {accusedCount > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#ff8c00' }}>
                            +{accusedCount} accused
                          </div>
                        )}
                        <div style={{
                          fontSize: '0.7rem',
                          color: gotItRight ? 'var(--neon-cyan)' : 'var(--neon-pink)',
                          fontWeight: '600',
                        }}>
                          {gotItRight ? 'Correct!' : 'Wrong'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isObserver && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', borderTop: 'var(--glass-border)', paddingTop: '0.75rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="text-secondary" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Wins</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>{scores.wins}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="text-secondary" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Losses</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--neon-pink)', fontWeight: 'bold' }}>{scores.losses}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="text-secondary" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Accused</div>
                <div style={{ fontSize: '1.1rem', color: '#ff8c00', fontWeight: 'bold' }}>{scores.accused}</div>
              </div>
            </div>
          )}
        </div>

        {!isObserver && (
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
        )}

        {isObserver && (
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
            Waiting for host to start the next round...
          </p>
        )}
      </div>
    </div>
  );
};

export default ResultScreen;
