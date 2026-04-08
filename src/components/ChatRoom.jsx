import React, { useState, useEffect, useRef } from 'react';
import { Send, Clock } from 'lucide-react';
import { simulatedPlayers, generateResponse, fetchGeminiResponse } from '../gameLogic';

const ChatRoom = ({ userName, apiKey, botId, onTimeUp }) => {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const messagesEndRef = useRef(null);
  const messagesDataRef = useRef(messages);

  useEffect(() => {
    messagesDataRef.current = messages;
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, onTimeUp]);

  // Simulated player actions
  useEffect(() => {
    const intervals = [];
    
    simulatedPlayers.forEach(player => {
      const isBot = player.id === botId;
      const delay = 5000 + Math.random() * 10000;
      
      const id = setInterval(async () => {
        if (isBot && apiKey && messagesDataRef.current.length > 0) {
          // If the last message was also from this bot, maybe don't spam.
          const lastMsg = messagesDataRef.current[messagesDataRef.current.length - 1];
          if (lastMsg.sender === player.name) return;

          const text = await fetchGeminiResponse(messagesDataRef.current, apiKey, player.name);
          setMessages(prev => [...prev, { sender: player.name, text, isMe: false }]);
        } else if (!isBot || !apiKey) {
          const text = generateResponse(player.id, isBot);
          setMessages(prev => [...prev, { sender: player.name, text, isMe: false }]);
        }
      }, delay);
      intervals.push((id));
    });

    return () => intervals.forEach(clearInterval);
  }, [botId, apiKey]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    
    setMessages(prev => [...prev, { sender: userName, text: inputVal.trim(), isMe: true }]);
    setInputVal('');
    
    // Potentially trigger an immediate bot response for flavor
    if (Math.random() > 0.6) {
      setTimeout(async () => {
        const randomPlayer = simulatedPlayers[Math.floor(Math.random() * simulatedPlayers.length)];
        const isBot = randomPlayer.id === botId;
        
        let text = '';
        if (isBot && apiKey) {
           text = await fetchGeminiResponse(messagesDataRef.current, apiKey, randomPlayer.name);
        } else {
           text = generateResponse(randomPlayer.id, isBot);
        }
        setMessages(prev => [...prev, { sender: randomPlayer.name, text, isMe: false }]);
      }, 1500 + Math.random() * 2000);
    }
  };

  return (
    <div className="container" style={{ padding: '1rem', height: '100vh' }}>
      <div className="glass-container fade-in flex-column" style={{ height: '100%', padding: '1rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: 'var(--glass-border)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>Lobby #404</h2>
            <div className="text-secondary" style={{ fontSize: '0.85rem' }}>Players: {userName}, {simulatedPlayers.map(p => p.name).join(', ')}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timeLeft <= 10 ? 'var(--neon-pink)' : 'var(--neon-cyan)', fontWeight: 'bold' }}>
            <Clock size={24} />
            <span style={{ fontSize: '1.2rem', minWidth: '3ch', textAlign: 'center' }}>{timeLeft}</span>
          </div>
        </div>

        {/* Message List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
          {messages.length === 0 && (
            <div className="flex-center text-secondary" style={{ height: '100%' }}>
              Chat initiated. Try saying hello!
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
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <input 
            type="text" 
            value={inputVal} 
            onChange={e => setInputVal(e.target.value)} 
            placeholder="Type a message to find the bot..." 
            autoComplete="off"
          />
          <button type="submit" className="primary" style={{ padding: '0 1.5rem' }}>
            <Send size={20} />
          </button>
        </form>

      </div>
    </div>
  );
};

export default ChatRoom;
