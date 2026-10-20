/** Generates tiny royalty-free sine-tone WAV files (no external assets). */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../assets/sounds');

function writeTone(filename, freq, durationSec, volume = 0.25) {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.min(1, i / (sampleRate * 0.02)) * Math.exp(-t * 4);
    const sample = Math.sin(2 * Math.PI * freq * t) * volume * env;
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, sample * 32767)), 44 + i * 2);
  }
  fs.writeFileSync(path.join(outDir, filename), buffer);
}

fs.mkdirSync(outDir, { recursive: true });
writeTone('place.wav', 523.25, 0.12, 0.2);
writeTone('complete.wav', 659.25, 0.18, 0.22);
writeTone('win.wav', 784, 0.35, 0.24);
writeTone('erase.wav', 392, 0.08, 0.15);
console.log('Wrote tones to', outDir);
