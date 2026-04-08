import React, { useState } from 'react';
import Lobby from './components/Lobby';
import ChatRoom from './components/ChatRoom';
import VotingScreen from './components/VotingScreen';
import ResultScreen from './components/ResultScreen';
import { getBotImposterId } from './gameLogic';

function App() {
  const [gameState, setGameState] = useState('lobby'); // lobby, chat, voting, result
  const [userName, setUserName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [botId, setBotId] = useState('');
  const [userVoteId, setUserVoteId] = useState(null);

  const startLobby = () => {
    setGameState('lobby');
    setUserName('');
    setApiKey('');
    setBotId('');
    setUserVoteId(null);
  };

  const handleJoin = ({ name, apiKey }) => {
    setUserName(name);
    setApiKey(apiKey);
    setBotId(getBotImposterId());
    setGameState('chat');
  };

  const handleTimeUp = () => {
    setGameState('voting');
  };

  const handleVote = (selectedId) => {
    setUserVoteId(selectedId);
    setGameState('result');
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw' }}>
      {gameState === 'lobby' && <Lobby onJoin={handleJoin} />}
      {gameState === 'chat' && <ChatRoom userName={userName} apiKey={apiKey} botId={botId} onTimeUp={handleTimeUp} />}
      {gameState === 'voting' && <VotingScreen onVote={handleVote} />}
      {gameState === 'result' && <ResultScreen botId={botId} userVoteId={userVoteId} onPlayAgain={startLobby} />}
    </div>
  );
}

export default App;
