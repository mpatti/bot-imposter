import React, { useState, useEffect, useRef } from 'react';
import { Send, Clock, Eye } from 'lucide-react';

const ChatRoom = ({ userName, socket, roomCode, allPlayers, scores, isObserver, initialMessages, initialTimeLeft }) => {
  const [messages, setMessages] = useState(
    (initialMessages || []).map(msg => ({ ...msg, isMe: msg.id === socket.id }))
  );
  const [inputVal, setInputVal] = useState('');
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft ?? 90);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  useEffect(() => {
    const handleTimer = (time) => setTimeLeft(time);
    const handleMessage = (msg) => {
      setMessages(prev => [...prev, { ...msg, isMe: msg.id === socket.id }]);
    };
    const handleTyping = ({ sender }) => {
      setTypingUsers(prev => prev.includes(sender) ? prev : [...prev, sender]);
    };
    const handleTypingStop = ({ sender }) => {
      setTypingUsers(prev => prev.filter(u => u !== sender));
    };

    socket.on('timerUpdate', handleTimer);
    socket.on('chatMessage', handleMessage);
    socket.on('typingIndicator', handleTyping);
    socket.on('typingStop', handleTypingStop);

    return () => {
      socket.off('timerUpdate', handleTimer);
      socket.off('chatMessage', handleMessage);
      socket.off('typingIndicator', handleTyping);
      socket.off('typingStop', handleTypingStop);
    };
  }, [socket]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isObserver) return;
    
    socket.emit('chatMessage', { roomCode, text: inputVal.trim() });
    setInputVal('');
  };

  return (
    <div style={{
      height: '100vh',
      height: '100dvh',
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      padding: '0.5rem',
    }}>
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--glass-bg)',
        boxShadow: 'var(--glass-shadow)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: 'var(--glass-border)',
        borderRadius: '12px',
        padding: '0.75rem',
        overflow: 'hidden',
      }}>

        {isObserver && (
          <div style={{
            background: 'rgba(0, 243, 255, 0.1)',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            borderRadius: '8px',
            padding: '0.4rem 0.75rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--neon-cyan)',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            flexShrink: 0,
          }}>
            <Eye size={12} />
            Observing — you'll join the next round
          </div>
        )}
        
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '0.5rem',
          marginBottom: '0.5rem',
          borderBottom: 'var(--glass-border)',
          flexShrink: 0,
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', whiteSpace: 'nowrap' }}>Room {roomCode}</h2>
              {!isObserver && (
                <span style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', fontWeight: '600', whiteSpace: 'nowrap' }}>{scores.wins}W {scores.losses}L {scores.accused}A</span>
              )}
            </div>
            <div className="text-secondary" style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {allPlayers.map(p => p.name).join(', ')}
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: timeLeft <= 10 ? 'var(--neon-pink)' : 'var(--neon-cyan)',
            fontWeight: 'bold',
            flexShrink: 0,
            marginLeft: '0.5rem',
          }}>
            <Clock size={18} />
            <span style={{ fontSize: '1.1rem', minWidth: '2ch', textAlign: 'center' }}>{timeLeft}</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          paddingRight: '0.25rem',
          WebkitOverflowScrolling: 'touch',
        }}>
          {messages.length === 0 && (
            <div className="flex-center text-secondary" style={{ height: '100%', fontSize: '0.9rem' }}>
              {isObserver ? 'Watching the game...' : 'Chat initiated. Try saying hello!'}
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} style={{ 
              alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.isMe ? 'flex-end' : 'flex-start'
            }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '1px', padding: '0 4px' }}>
                {msg.sender}
              </span>
              <div style={{
                background: msg.isMe ? 'linear-gradient(135deg, var(--neon-cyan), #0077ff)' : 'rgba(255,255,255,0.1)',
                color: msg.isMe ? '#000' : 'var(--text-primary)',
                padding: '0.5rem 0.75rem',
                borderRadius: '14px',
                borderTopRightRadius: msg.isMe ? '4px' : '14px',
                borderTopLeftRadius: !msg.isMe ? '4px' : '14px',
                wordBreak: 'break-word',
                fontWeight: msg.isMe ? '500' : '400',
                fontSize: '0.9rem',
              }}>
                {msg.text}
              </div>
            </div>
          ))}

          {typingUsers.length > 0 && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '1px', padding: '0 4px' }}>
                {typingUsers.join(', ')}
              </span>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '0.5rem 0.75rem',
                borderRadius: '14px',
                borderTopLeftRadius: '4px',
                display: 'flex',
                gap: '4px',
                alignItems: 'center'
              }}>
                <span className="typing-dot" style={{ animationDelay: '0s' }}>•</span>
                <span className="typing-dot" style={{ animationDelay: '0.2s' }}>•</span>
                <span className="typing-dot" style={{ animationDelay: '0.4s' }}>•</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!isObserver && (
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexShrink: 0 }}>
            <input 
              type="text" 
              value={inputVal} 
              onChange={e => setInputVal(e.target.value)} 
              placeholder="Type a message..." 
              autoComplete="off"
              autoFocus
              style={{ padding: '0.6rem 0.75rem', fontSize: '0.9rem' }}
            />
            <button type="submit" className="primary" style={{ padding: '0 1rem', flexShrink: 0 }}>
              <Send size={18} />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ChatRoom;
