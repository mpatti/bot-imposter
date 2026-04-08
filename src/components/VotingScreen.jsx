import React, { useState, useEffect } from 'react';
import { Target, Clock, Eye } from 'lucide-react';

const VotingScreen = ({ allPlayers, onVote, socket, isObserver, initialVoteTimeLeft }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteTimer, setVoteTimer] = useState(initialVoteTimeLeft ?? 30);

  useEffect(() => {
    const handleVoteTimer = (time) => setVoteTimer(time);
    socket.on('voteTimerUpdate', handleVoteTimer);
    return () => socket.off('voteTimerUpdate', handleVoteTimer);
  }, [socket]);

  const handleSubmit = () => {
    if (selectedId && !isObserver) {
      onVote(selectedId);
      setHasVoted(true);
    }
  };

  return (
    <div className="container flex-center">
      <div className="glass-container fade-in" style={{ width: '100%', maxWidth: '500px' }}>
        {isObserver && (
          <div style={{
            background: 'rgba(0, 243, 255, 0.1)',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--neon-cyan)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}>
            <Eye size={14} />
            Observing — waiting for votes
          </div>
        )}

        <div className="text-center mb-4">
          <Target size={64} className="mb-2" style={{ color: 'var(--neon-pink)' }} />
          <h2>Time's Up!</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: voteTimer <= 10 ? 'var(--neon-pink)' : 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '1.3rem', margin: '0.75rem 0' }}>
            <Clock size={22} />
            <span>{voteTimer}s</span>
          </div>
          <p className="text-secondary">
            {isObserver ? "Players are voting..." : hasVoted ? "Waiting for other players to vote..." : "Who do you think is the Bot Imposter?"}
          </p>
        </div>

        {!isObserver && !hasVoted && (
          <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
            {allPlayers.map(player => (
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
        )}

        {!isObserver && !hasVoted && (
          <button 
            onClick={handleSubmit} 
            className="primary" 
            disabled={!selectedId} 
            style={{ width: '100%' }}
          >
            Confirm Vote
          </button>
        )}
      </div>
    </div>
  );
};

export default VotingScreen;
