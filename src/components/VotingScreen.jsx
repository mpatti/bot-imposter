import React, { useState, useEffect, useRef } from 'react';
import { Target, Clock, Eye, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

const VotingScreen = ({ allPlayers, onVote, socket, isObserver, initialVoteTimeLeft, chatMessages }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteTimer, setVoteTimer] = useState(initialVoteTimeLeft ?? 30);
  const [showChat, setShowChat] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const handleVoteTimer = (time) => setVoteTimer(time);
    socket.on('voteTimerUpdate', handleVoteTimer);
    return () => socket.off('voteTimerUpdate', handleVoteTimer);
  }, [socket]);

  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showChat]);

  const handleSubmit = () => {
    if (selectedId && !isObserver) {
      onVote(selectedId);
      setHasVoted(true);
    }
  };

  const messages = chatMessages || [];

  return (
    <div className="container" style={{ padding: '0.5rem', height: '100vh', height: '100dvh', justifyContent: 'center' }}>
      <div className="glass-container fade-in" style={{ width: '100%', maxWidth: '500px', margin: '0 auto', maxHeight: '100%', overflowY: 'auto' }}>
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

        <div className="text-center" style={{ marginBottom: '1rem' }}>
          <Target size={48} className="mb-1" style={{ color: 'var(--neon-pink)' }} />
          <h2 style={{ marginBottom: '0.25rem' }}>Time's Up!</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: voteTimer <= 10 ? 'var(--neon-pink)' : 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '1.2rem', margin: '0.5rem 0' }}>
            <Clock size={20} />
            <span>{voteTimer}s</span>
          </div>
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
            {isObserver ? "Players are voting..." : hasVoted ? "Waiting for other players to vote..." : "Who do you think is the Bot Imposter?"}
          </p>
        </div>

        {/* Chat history toggle */}
        {messages.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => setShowChat(!showChat)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                padding: '0.6rem 1rem',
                fontSize: '0.8rem',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MessageSquare size={14} />
                Chat History
              </span>
              {showChat ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showChat && (
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '0 0 8px 8px',
                padding: '0.5rem 0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
              }}>
                {messages.map((msg, idx) => (
                  <div key={idx} style={{ fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: '600' }}>{msg.sender}: </span>
                    <span style={{ color: 'var(--text-primary)' }}>{msg.text}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        )}

        {!isObserver && !hasVoted && (
          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {allPlayers.map(player => (
              <button
                key={player.id}
                onClick={() => setSelectedId(player.id)}
                style={{
                  background: selectedId === player.id ? 'rgba(242, 0, 137, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: selectedId === player.id ? '1px solid var(--neon-pink)' : 'var(--glass-border)',
                  justifyContent: 'flex-start',
                  padding: '0.75rem 1rem',
                  transform: selectedId === player.id ? 'scale(1.02)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '36px', height: '36px', 
                    borderRadius: '50%', 
                    background: 'var(--bg-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', border: 'var(--glass-border)',
                    fontSize: '0.9rem',
                  }}>
                    {player.name[0]}
                  </div>
                  <span style={{ fontSize: '1.1rem' }}>{player.name}</span>
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
