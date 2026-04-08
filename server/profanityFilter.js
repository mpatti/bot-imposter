// Common profanity and inappropriate phrases to filter
const badWords = [
  'fuck', 'fucking', 'fucked', 'fucker', 'fucks', 'fuckin',
  'shit', 'shitty', 'shitted', 'shitting', 'shithead', 'shitface', 'shitstain',
  'ass', 'asshole', 'asswipe', 'asshat', 'assface', 'asslicker',
  'bitch', 'bitches', 'bitchy', 'bitchass',
  'damn', 'goddamn', 'goddammit',
  'dick', 'dickhead', 'dickface', 'dickwad', 'dicksucker',
  'cock', 'cocksucker', 'cocksucking', 'cockhead', 'cockface',
  'pussy', 'pussies',
  'bastard', 'bastards',
  'cunt', 'cunts',
  'whore', 'whorehouse',
  'slut', 'slutty', 'sluts',
  'fag', 'faggot', 'fags', 'faggots',
  'nigger', 'niggers', 'nigga', 'niggas',
  'retard', 'retarded', 'retards',
  'rape', 'raped', 'rapist',
  'stfu', 'gtfo', 'wtf', 'lmfao',
  'milf',
  'dildo', 'dildos',
  'porn', 'porno', 'pornography',
  'titties', 'tits', 'boobs', 'boobies',
  'penis', 'vagina', 'anus', 'anal',
  'wank', 'wanker', 'wanking',
  'jizz', 'jizzed',
  'cum', 'cumshot', 'cumming',
  'orgasm', 'horny', 'erection',
  'twat', 'twats',
  'prick', 'pricks',
  'douche', 'douchebag', 'douchebags',
  'mofo', 'motherfucker', 'motherfucking', 'motherfuckers',
  'bullshit', 'horseshit', 'batshit',
  'jackass', 'dumbass', 'fatass', 'smartass', 'badass', 'lardass',
  'dipshit',
  'blowjob', 'handjob', 'rimjob',
  'skank', 'skanky',
  'spic', 'spick', 'spics',
  'chink', 'chinks',
  'kike', 'kikes',
  'wetback', 'wetbacks',
  'beaner', 'beaners',
  'gook', 'gooks',
  'cracker', 'crackers',
  'tranny', 'trannies',
  'dyke', 'dykes',
  'lesbo', 'lesbos',
  'hoe', 'hoes',
  'thot', 'thots',
  'turd', 'turds',
  'buttfuck', 'buttfucker',
  'circlejerk',
  'clusterfuck',
  'cuck', 'cucks',
  'deepthroat',
  'felch', 'felching',
  'fisting',
  'gangbang',
  'goatse',
  'grope', 'groping',
  'humping',
  'incel', 'incels',
  'jerkoff',
  'knobhead',
  'minge',
  'nonce',
  'nutjob', 'nutsack',
  'pedo', 'pedophile', 'paedo', 'paedophile',
  'pervert', 'perv', 'perverted',
  'queef',
  'rimming',
  'schlong',
  'scrote', 'scrotum',
  'semen',
  'spunk',
  'taint',
  'tosser',
  'wankstain',
  'bellend',
  'bollocks',
  'bugger', 'buggered',
  'arsehole', 'arse',
  'bloody',
  'shagging', 'shag',
  'sod', 'sodding', 'sodoff',
  'pillock',
  'minger',
  'git',
  'plonker',
  'numpty'
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
