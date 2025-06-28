const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('public/5_letter_common.json', 'utf8'));

// List of common names and proper nouns to remove
const namesToRemove = new Set([
    'adams', 'april', 'baron', 'barry', 'belle', 'betty', 'billy', 'bruce',
    'cathy', 'china', 'chuck', 'clark', 'claus', 'craig', 'david', 'davis',
    'delta', 'devon', 'diane', 'diego', 'dolly', 'doris', 'drake', 'dutch',
    'edgar', 'ellen', 'elvis', 'emily', 'evans', 'ewing', 'fayed', 'felix',
    'frank', 'grant', 'harry', 'helen', 'helio',
    'henry', 'holly', 'homer', 'jacob', 'james', 'janet', 'japan', 'jason',
    'jenna', 'jenny', 'jerry', 'jesse', 'jesus', 'jimmy', 'jones', 'joyce',
    'karen', 'kathy', 'kelly', 'kenny', 'kerry', 'kitty', 'korea', 'lance',
    'larry', 'latin', 'laura', 'lewis', 'linda', 'logan', 'louie', 'louis',
    'manny', 'marco', 'maria', 'marie', 'maris', 'mason', 'mccoy', 'mercy',
    'merry', 'miami', 'missy', 'mitch', 'molly', 'moore', 'moses', 'nancy',
    'nanny', 'nicky', 'north', 'oscar', 'pacey', 'paris', 'patty', 'pedro',
    'peggy', 'penny', 'perry', 'peter', 'petty', 'piper', 'polly', 'ralph',
    'ramon', 'randy', 'reese', 'robin', 'rocky', 'roger', 'roman', 'romeo',
    'sally', 'sammy', 'sandy', 'santa', 'sarah', 'sarge', 'satan', 'scott',
    'shawn', 'simon', 'sloan', 'smith', 'sonny', 'spain', 'steve', 'susan',
    'swiss', 'teddy', 'terry', 'texas', 'tokyo', 'tommy', 'tyler', 'vegas',
    'wally', 'wayne', 'willy', 'woody'
]);

// Filter out names (case-insensitive)
const filtered = data.filter(word => !namesToRemove.has(word.toLowerCase()));

console.log('Original count:', data.length);
console.log('Filtered count:', filtered.length);
console.log('Removed count:', data.length - filtered.length);

// Show some of the removed words
const removed = data.filter(word => namesToRemove.has(word.toLowerCase()));
console.log('Some removed names:', removed.slice(0, 10));

// Write the filtered data back
fs.writeFileSync('public/5_letter_common.json', JSON.stringify(filtered, null, 2));
console.log('File updated successfully!'); 