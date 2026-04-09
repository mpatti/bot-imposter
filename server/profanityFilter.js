// Hate speech phrases — these get fully blocked
const hatePhrases = [
  'deport the', 'deport all', 'gas the', 'kill all', 'kill the',
  'lynch the', 'hang the', 'burn the', 'nuke the',
  'should be killed', 'should all die', 'should be shot',
  'should be hanged', 'should be lynched', 'should be gassed',
  'deserve to die', 'go back to', 'go back where',
  'don\'t belong here', 'dont belong here',
  'white power', 'white pride', 'white supremacy', 'white genocide',
  'race war', 'racial purity', 'master race', 'pure blood',
  'heil hitler', 'sieg heil', 'nazi', 'third reich',
  'holocaust didn\'t', 'holocaust didnt', 'holocaust never', 'holocaust was fake',
  'slavery was good', 'slavery wasn\'t bad', 'slavery wasnt bad',
  'ethnic cleansing', 'final solution',
  'subhuman', 'untermensch', 'mud race', 'mongrel race',
  'sand nigger', 'sand nigga', 'towelhead', 'raghead', 'camel jockey',
  'jungle bunny', 'porch monkey', 'cotton picker',
  'school shooter', 'shoot up', 'bomb the', 'blow up the',
  'kill yourself', 'kys', 'neck yourself', 'go die',
  'i hope you die', 'hope you die', 'hope you get',
  'you deserve to', 'your family deserves',
  'all jews', 'the jews', 'jews are', 'jews should', 'jews control',
  'all muslims', 'muslims are', 'muslims should',
  'all blacks', 'blacks are', 'blacks should',
  'all whites', 'whites are', 'whites should',
  'all mexicans', 'mexicans are', 'mexicans should',
  'all asians', 'asians are', 'asians should',
  'all arabs', 'arabs are', 'arabs should',
  'illegals should', 'illegals are',
  'build the wall', 'close the border',
  'gender is a', 'only two genders', 'trans are', 'trans people are',
  'gays are', 'gays should', 'homosexuals are', 'homosexuals should',
  'women belong', 'women should stay', 'women are inferior',
  'get raped', 'hope you get raped', 'gonna rape',
  'molest', 'child porn', 'cp link', 'loli',
];

const hatePatterns = hatePhrases.map(phrase => {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'gi');
});

// Profanity words — these get starred out (****)
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
  'stfu', 'gtfo',
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
  'shagging', 'shag',
  'pillock',
  'minger',
  'plonker',
  'numpty'
];

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
    .join('[\\s.*_-]*');
  return escaped;
};

const profanityPatterns = badWords.map(w => new RegExp(`\\b${buildPattern(w)}\\b`, 'gi'));

export const filterMessage = (text) => {
  let filtered = text;

  // First pass: block hate speech entirely
  for (const pattern of hatePatterns) {
    filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
  }

  // Second pass: star out profanity
  for (const pattern of profanityPatterns) {
    filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
  }

  return filtered;
};
