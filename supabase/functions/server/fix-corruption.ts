// Deno script to fix index.tsx corruption
// Run: deno run --allow-read --allow-write fix-corruption.ts

const indexPath = "./index.tsx";

console.log("🔧 Reading index.tsx...");
const content = await Deno.readTextFile(indexPath);
const lines = content.split('\n');

console.log(`📄 Total lines: ${lines.length}`);

// Keep lines 1-841 (before corruption)
const part1 = lines.slice(0, 841);

// Keep lines 1109-end (after corruption, including crypto-markets route)
const part2 = lines.slice(1108); // 1108 because array is 0-indexed

console.log(`✂️  Removing lines 842-1108 (${1108 - 841} corrupt lines)`);

// Combine clean parts
const cleanContent = [...part1, '', ...part2].join('\n');

// Backup original
console.log("💾 Creating backup: index.tsx.backup");
await Deno.writeTextFile("./index.tsx.backup", content);

// Write clean version
console.log("✍️  Writing clean index.tsx");
await Deno.writeTextFile(indexPath, cleanContent);

console.log("✅ DONE! index.tsx is now clean");
console.log(`📊 New file size: ${cleanContent.split('\n').length} lines (was ${lines.length})`);
console.log("📂 Backup saved at: index.tsx.backup");
