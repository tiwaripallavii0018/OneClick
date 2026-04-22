const MAXLEN = 5;
export function generate() {
  let ans = "";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < MAXLEN; i++) {
    ans += chars[Math.floor(Math.random() * chars.length)];
  }
  return ans;
}