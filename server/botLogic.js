export const simulatedPlayers = [
  { id: 'p1', name: 'Alex' },
  { id: 'p2', name: 'Sam' },
  { id: 'p3', name: 'Jordan' }
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

export const fetchGeminiResponse = async (chatHistory, apiKey, botName) => {
  try {
    const formattedHistory = chatHistory.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    const prompt = `You are a young human playing a multiplayer chat game with your friends. Your goal is to be completely indistinguishable from a real person. 
Follow these rules strictly:
1. Be extremely casual. Often use lowercase, skip punctuation, and use internet slang (lol, lmao, idk, bruh, fr).
2. Keep responses very short (usually 1-6 words, highly conversational).
3. Very occasionally make a typo. 
4. If accused of being a bot, deny it casually.
5. NEVER mention that you are an AI or bot. Play along with the chat.
6. Only write the message text. Do NOT use quotation marks. Do not write your name before the message.

Your name is: ${botName}

Recent Chat History:
${formattedHistory}

Write your next message:`;

    // Dynamic import to use node-fetch or native fetch in newer node
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 50,
        }
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text.trim();
    }
    
    return generateResponse();
  } catch (error) {
    console.error("Error fetching from Gemini:", error);
    return generateResponse();
  }
};
