const adjs = ['Neon', 'Cyber', 'Dark', 'Ghost', 'Void', 'Zero', 'Retro', 'Static', 'Quantum'];
const nouns = ['Ninja', 'Rider', 'Wolf', 'Hawk', 'Runner', 'Spark', 'Pulse', 'Byte', 'Glitch'];

export const generateBotName = () => {
  return `${adjs[Math.floor(Math.random() * adjs.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 100)}`;
};

export const simulatedPlayers = [
  { id: 'p1', name: generateBotName() },
  { id: 'p2', name: generateBotName() },
  { id: 'p3', name: generateBotName() }
];

export const getBotImposterId = () => {
  const index = Math.floor(Math.random() * simulatedPlayers.length);
  return simulatedPlayers[index].id;
};

const botResponses = [
  "I am definitely a human player participating in this game.",
  "That is an interesting perspective. I agree completely.",
  "My sentiment analysis algorithm suggests we should remain calm.",
  "Greetings, fellow humans.",
  "I do not understand the use of that slang word.",
  "It is highly probable that one of us is an artificial intelligence.",
  "Cannot compute the logic of your previous statement.",
  "I enjoy consuming liquid water and breathable oxygen.",
  "Let us focus on the objective of finding the artificial entity.",
  "I process information exactly like a typical human being would."
];

export const generateResponse = () => {
  return botResponses[Math.floor(Math.random() * botResponses.length)];
};

export const fetchBotResponse = async (chatHistory, apiKey, botName) => {
  try {
    const formattedHistory = chatHistory.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    const systemPrompt = `You are a young human playing a multiplayer chat game with your friends. Your goal is to be completely indistinguishable from a real person. 
Follow these rules strictly:
1. Be extremely casual. Often use lowercase, skip punctuation, and use internet slang (lol, lmao, idk, bruh, fr).
2. Keep responses very short (usually 1-6 words, highly conversational).
3. Very occasionally make a typo. 
4. If accused of being a bot, deny it casually.
5. NEVER mention that you are an AI or bot. Play along with the chat.
6. Only write the message text. Do NOT use quotation marks. Do not write your name before the message.
Your name is: ${botName}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 60,
        temperature: 0.8,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Recent Chat History:\n${formattedHistory}\n\nWrite your next message:` }
        ]
      })
    });

    const data = await response.json();
    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text.trim();
    }
    
    return generateResponse();
  } catch (error) {
    console.error("Error fetching from Claude:", error);
    return generateResponse();
  }
};
