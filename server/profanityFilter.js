// Common profanity and inappropriate phrases to filter
const badWords = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'dick', 'cock', 'pussy',
  'bastard', 'cunt', 'whore', 'slut', 'fag', 'nigger', 'nigga',
  'retard', 'rape', 'stfu', 'gtfo', 'milf', 'dildo', 'porn',
  'titties', 'tits', 'boobs', 'penis', 'vagina', 'anus',
  'wank', 'jizz', 'cum', 'orgasm', 'horny', 'erection',
  'twat', 'prick', 'douche', 'mofo', 'motherfucker',
  'asshole', 'bullshit', 'goddamn', 'jackass', 'dumbass',
  'dipshit', 'shithead', 'fucker', 'wtf', 'lmfao'
];

// Build regex that matches whole words and common evasions (e.g. f*ck, sh1t)
const buildPattern = (word) => {
  const escaped = word
    .split('')
    .map(ch => {
      const subs = {
        'a': '[a@4]',
        'e': '[e3]',
        'i': '[i1!|]',
        'o': '[o0]',
        's': '[s$5]',
        't': '[t7]',
      };
      return subs[ch] || ch;
    })
    .join('[\\s.*_-]*'); // allow fillers between letters
  return escaped;
};

const patterns = badWords.map(w => new RegExp(`\\b${buildPattern(w)}\\b`, 'gi'));

export const filterMessage = (text) => {
  let filtered = text;
  for (const pattern of patterns) {
    filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
  }
  return filtered;
};
