import React, { useState, useEffect, useRef } from 'react';
import { Send, Clock, Eye } from 'lucide-react';

const ChatRoom = ({ userName, socket, roomCode, allPlayers, scores, isObserver, initialMessages, initialTimeLeft }) => {
  const [messages, setMessages] = useState(
    (initialMessages || []).map(msg => ({ ...msg, isMe: msg.id === socket.id }))
  );
  const [inputVal, setInputVal] = useState('');
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft ?? 60);
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
    <div className="container" style={{ padding: '1rem', height: '100vh' }}>
      <div className="glass-container fade-in flex-column" style={{ height: '100%', padding: '1rem' }}>

        {isObserver && (
          <div style={{
            background: 'rgba(0, 243, 255, 0.1)',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--neon-cyan)',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}>
            <Eye size={14} />
            Observing — you'll join the next round
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: 'var(--glass-border)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>Room {roomCode}</h2>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
              <div className="text-secondary" style={{ fontSize: '0.85rem' }}>Players: {allPlayers.map(p => p.name).join(', ')}</div>
              {!isObserver && (
                <div style={{ fontSize: '0.85rem', color: 'var(--neon-cyan)', fontWeight: '600' }}>{scores.wins}W - {scores.losses}L</div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timeLeft <= 10 ? 'var(--neon-pink)' : 'var(--neon-cyan)', fontWeight: 'bold' }}>
            <Clock size={24} />
            <span style={{ fontSize: '1.2rem', minWidth: '3ch', textAlign: 'center' }}>{timeLeft}</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
          {messages.length === 0 && (
            <div className="flex-center text-secondary" style={{ height: '100%' }}>
              {isObserver ? 'Watching the game...' : 'Chat initiated. Try saying hello!'}
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} style={{ 
              alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.isMe ? 'flex-end' : 'flex-start'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px', padding: '0 4px' }}>
                {msg.sender}
              </span>
              <div style={{
                background: msg.isMe ? 'linear-gradient(135deg, var(--neon-cyan), #0077ff)' : 'rgba(255,255,255,0.1)',
                color: msg.isMe ? '#000' : 'var(--text-primary)',
                padding: '0.75rem 1rem',
                borderRadius: '16px',
                borderTopRightRadius: msg.isMe ? '4px' : '16px',
                borderTopLeftRadius: !msg.isMe ? '4px' : '16px',
                wordBreak: 'break-word',
                fontWeight: msg.isMe ? '500' : '400'
              }}>
                {msg.text}
              </div>
            </div>
          ))}

          {typingUsers.length > 0 && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px', padding: '0 4px' }}>
                {typingUsers.join(', ')}
              </span>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '0.75rem 1rem',
                borderRadius: '16px',
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

        {!isObserver && (
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <input 
              type="text" 
              value={inputVal} 
              onChange={e => setInputVal(e.target.value)} 
              placeholder="Type a message to find the bot..." 
              autoComplete="off"
              autoFocus
            />
            <button type="submit" className="primary" style={{ padding: '0 1.5rem' }}>
              <Send size={20} />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ChatRoom;
