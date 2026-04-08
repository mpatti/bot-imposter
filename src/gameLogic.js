export const simulatedPlayers = [
  { id: 'p1', name: 'Alex' },
  { id: 'p2', name: 'Sam' },
  { id: 'p3', name: 'Jordan' }
];

export const getBotImposterId = () => {
  const index = Math.floor(Math.random() * simulatedPlayers.length);
  return simulatedPlayers[index].id;
};

const humanResponses = [
  "lol yeah",
  "wait wut",
  "idk about that...",
  "anybody else lagging?",
  "haha true",
  "tbh i kinda agree",
  "sus",
  "nah no way",
  "that makes sense",
  "brb getting water",
  "who are we voting?",
  "im not the bot i swear 😂",
  "anyone played this before?",
];

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

export const generateResponse = (playerId, isBot) => {
  if (isBot) {
    return botResponses[Math.floor(Math.random() * botResponses.length)];
  } else {
    return humanResponses[Math.floor(Math.random() * humanResponses.length)];
  }
};

export const fetchGeminiResponse = async (chatHistory, apiKey, botName) => {
  try {
    const formattedHistory = chatHistory.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    const prompt = `You are playing a game called 'Bot Imposter'. Your objective is to blend in as a human player in a chat room, but occasionally leave subtle clues that you might be an AI.
There are a few other players in the chat.
Your name is ${botName}.
Respond VERY concisely (1-2 sentences max), naturally, and use casual internet language when appropriate.
Do NOT use quotation marks around your answer. Do not preface it with your name.
Here is the chat history:
${formattedHistory}

Write your next message:`;

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
    
    // Fallback if API response is unexpected
    return generateResponse(null, true);
  } catch (error) {
    console.error("Error fetching from Gemini:", error);
    // Fallback if API call fails
    return generateResponse(null, true);
  }
};
