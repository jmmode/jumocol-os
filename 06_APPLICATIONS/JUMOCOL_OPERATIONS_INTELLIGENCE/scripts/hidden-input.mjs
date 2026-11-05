// Hidden terminal input that never echoes, logs or returns more than the typed value.
// Works on raw bytes instead of readline keypress parsing: on Windows consoles Alt/AltGr
// characters can arrive prefixed with ESC, which keypress parsing flags as `meta` and drops.

/** Applies one raw chunk to the current value. Pure: used by the reader and by tests. */
export function applyChunk(value, chunk) {
  const chars = [...chunk];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === '\r' || c === '\n') return { value, done: true };
    if (c === '\u0003') return { value, cancelled: true };
    if (c === '\u007f' || c === '\b') { value = [...value].slice(0, -1).join(''); continue; }
    if (c === '\u001b') {
      // CSI/SS3 sequences (arrows, function keys) are skipped; ESC+char keeps the char.
      if (chars[i + 1] === '[' || chars[i + 1] === 'O') {
        i += 2;
        while (i < chars.length && !/[A-Za-z~]/.test(chars[i])) i++;
      }
      continue;
    }
    if (/[\u0000-\u001f]/.test(c)) continue;
    value += c;
  }
  return { value };
}

export function hiddenPassword(label, input = process.stdin, output = process.stdout) {
  if (!input.isTTY) throw new Error('Ejecute en una terminal interactiva local. No pase contraseñas por argumentos.');
  output.write(label);
  input.setRawMode(true);
  input.setEncoding('utf8');
  input.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    const finish = () => { input.removeListener('data', onData); input.setRawMode(false); input.pause(); output.write('\n'); };
    const onData = chunk => {
      const before = [...value].length;
      const result = applyChunk(value, chunk);
      value = result.value;
      const after = [...value].length;
      // Mask only: one asterisk per accepted character so the owner sees input is received.
      if (after > before) output.write('*'.repeat(after - before));
      else if (after < before) output.write('\b \b'.repeat(before - after));
      if (result.cancelled) { finish(); reject(new Error('Cancelado.')); }
      else if (result.done) { finish(); resolve(value); }
    };
    input.on('data', onData);
  });
}
