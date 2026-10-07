// Metro needs static require() paths, so list every tape here
export const WASHI_TAPES = [
  require("../assets/washi tapes/tape1.webp"),
  require("../assets/washi tapes/tape2.webp"),
  require("../assets/washi tapes/tape3.webp"),
  require("../assets/washi tapes/tape4.webp"),
  require("../assets/washi tapes/tape5.webp"),
  require("../assets/washi tapes/tape6.webp"),
  require("../assets/washi tapes/tape7.webp"),
  require("../assets/washi tapes/tape8.webp"),
  require("../assets/washi tapes/tape9.webp"),
];

// Stable "random" pick per key (e.g. goal.id): same tape and tilt every render
export function pickTape(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return {
    source: WASHI_TAPES[h % WASHI_TAPES.length],
    rotate: ((h >> 3) % 13) - 6, // -6° to +6°
  };
}
