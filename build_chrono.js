const fs = require('fs');
const path = require('path');
const baseDir = 'D:/Projects/Bible Reading App';
const raw = fs.readFileSync(path.join(baseDir, 'chrono_data.txt'), 'utf8');
const dataLines = raw.replace(/\r/g, '').trim().split('\n');
const oldReadings = [];
for (let i = 1; i < dataLines.length; i++) {
  const parts = dataLines[i].split('|');
  if (parts.length >= 2) oldReadings.push(parts[1].trim());
}

console.log('Parsed ' + oldReadings.length + ' old readings');
console.log('Old day 1: ' + oldReadings[0]);
console.log('Old day 14: ' + oldReadings[13]);

function extractFirstBook(text) {
  const bp = ['Song of Solomon','1 Chronicles','2 Chronicles','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Corinthians','2 Corinthians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','1 Peter','2 Peter','1 John','2 John','3 John','Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','Job','Psalms','Psalm','Proverbs','Ecclesiastes','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','Galatians','Ephesians','Philippians','Colossians','Titus','Philemon','Hebrews','James','Jude','Revelation'];
  for (const b of bp) { if (text.startsWith(b)) return b === 'Psalm' ? 'Psalms' : b; }
  return text.split(/[\s;,]/)[0];
}

const result = [];
function add(ch, bk) { result.push({chapters: ch, book: bk || extractFirstBook(ch)}); }

// ===== BUILD NEW SCHEDULE =====
// Helper: oldReadings[N-1] = old day N

// SECTION 1: New beginning - Creation, Job, Abraham (22 days)
add('Genesis 1, 2','Genesis');                       // new day 1
add('Genesis 3-5','Genesis');                        // new day 2
add('Genesis 6-9','Genesis');                        // new day 3
add('Genesis 10, 11; 1 Chronicles 1:1-27','Genesis'); // new day 4

// Job: old days 14-26 (indices 13-25) = 13 readings
for (let i=13;i<=25;i++) add(oldReadings[i],'Job');  // new days 5-17

add('Genesis 12, 13','Genesis');                     // new day 18
add('Genesis 14, 15','Genesis');                     // new day 19
add('Genesis 16','Genesis');                         // new day 20
add('Genesis 17','Genesis');                         // new day 21
add('Genesis 18','Genesis');                         // new day 22

// SECTION 2: Genesis 19-50 (old days 1-13, indices 0-12) = 13 readings
for (let i=0;i<=12;i++) add(oldReadings[i]);        // new days 22-34

// SECTION 3: Exodus → pre-Solomon (old days 27-137, indices 26-136) = 111 readings
for (let i=26;i<=136;i++) add(oldReadings[i]);      // new days 35-145

// SECTION 4: Solomon section — chronological order
// 1. Solomon made king, asks for wisdom
add(oldReadings[137]); // old 138: 1Ki 3; 2Chr 1; Ps 42,43,100

// 2. Solomon's administration + wisdom intro + Proverbs 1
add(oldReadings[139]); // old 140: 1Ki 10:1-13; 2Chr 9:1-12; 1Ki 4:1-19; 4:29-34; Proverbs 1

// 3. Proverbs + Song of Solomon
add(oldReadings[140]); // old 141: Proverbs 2-4
for (let i=141;i<=152;i++) add(oldReadings[i]); // old 142-153: Proverbs 5-31, SoS 1-4, SoS 5-8; 1Ki 5; 2Chr 2

// 5. Temple preparation + building (from tail + old)
add(oldReadings[153]); // old day 154: 1Ki 6; 2Chr 3; 1Ki 7:1-22; 2Chr 4:1-22
add(oldReadings[352]); // old day 353 (tail): 1Ki 4:20-28; 7:23-51; 2Chr 4:1-5:1

// 6. Temple dedication
add(oldReadings[353]); // old day 354 (tail): 1Ki 8:1-53; 2Chr 5:2-6:42
add(oldReadings[354]); // old day 355 (tail): 1Ki 8:54-9:23; 2Chr 7:1-8:10

// 7. Solomon's other projects
add(oldReadings[138]); // old day 139: 1Ki 9:24; 2Chr 8:11; etc.

// 8. Ecclesiastes
add(oldReadings[349]); // old day 350 (tail): Ecclesiastes 1-4
add(oldReadings[350]); // old day 351 (tail): Ecclesiastes 5-8
add(oldReadings[351]); // old day 352 (tail): Ecclesiastes 9-12

// 9. Solomon's wealth + decline
add(oldReadings[355]); // old day 356 (tail): 1Ki 10:14-29; 2Chr 9:13-28; 1Ki 11:1-40; Ps 81

// 10. Misc Psalms + Solomon summary (from tail)
add(oldReadings[348]); // old day 349 (tail): Psalms 113; 116; 120; 122; 124; 129
add(oldReadings[357]); // old day 358 (tail): Psalms 111; 112; 144
add(oldReadings[356]); // old day 357 (tail): 2Chr 1:14-17; 1Ki 4:21-28; Ps 47 etc

// 11. Kingdom transition
add(oldReadings[154]); // old 155: Psalms 73; 88; transition

// SECTION 5: Divided kingdom (old days 156-160, indices 155-159) = 5 readings
for (let i=155;i<=159;i++) add(oldReadings[i]);

// SKIP old day 161 (index 160) — duplicate of old day 171

// Old days 162-177 (indices 161-176) = 16 readings
for (let i=161;i<=176;i++) add(oldReadings[i]);

// Old days 178-182 (indices 177-181) = 5 readings
for (let i=177;i<=181;i++) add(oldReadings[i]);

// SKIP old day 183 (index 182) — Micah 4-7 duplicate of day 178 content

// Old days 184-197 (indices 183-196) = 14 readings
for (let i=183;i<=196;i++) add(oldReadings[i]);

// Old day 198 (index 197) — fix to remove duplicate Manasseh content
add('Isaiah 66','Isaiah');

// Old days 199-348 (indices 198-347) = 150 readings (through Revelation 20-22)
for (let i=198;i<=347;i++) add(oldReadings[i]);

// SKIP old days 349-365 (indices 348-364) — all relocated above or duplicates
// Days 349-358: relocated to Solomon section above
// Days 359-365: duplicates of divided kingdom content

console.log('Total readings: ' + result.length);

let out = '    const READINGS_CHRONO = [\n';
for (let i=0;i<result.length;i++) {
  const r = result[i];
  const d = i+1;
  const ch = r.chapters.replace(/"/g, '\\"');
  const bk = r.book.replace(/"/g, '\\"');
  out += '      { day: '+d+', book: "'+bk+'", chapters: "'+ch+'", diamond: false, dot: false }';
  if (i<result.length-1) out += ',';
  out += '\n';
}
out += '    ];\n';
fs.writeFileSync(path.join(baseDir, 'chrono_output.js'), out);
console.log('Written to chrono_output.js');
