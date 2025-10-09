(function(){
  const input = document.getElementById('text-input');
  const convertBtn = document.getElementById('convert-btn');
  const clearBtn = document.getElementById('clear-btn');
  const output = document.getElementById('image-output');
  const statusEl = document.getElementById('status');

  const ALLOWED_REGEX = /^[a-z0-9 ]+$/; // lowercase letters, digits, space
  const MAX_LEN = 50;
  const CHARS_BASE = './assets/chars/';

  function setStatus(message){
    statusEl.textContent = message || '';
  }

  function toAllowedLower(text){
    return text.toLowerCase();
  }

  function validateInput(text){
    if (!text) return false;
    if (text.trim().length === 0) return false;
    if (text.length > MAX_LEN) return false;
    return ALLOWED_REGEX.test(text);
  }

  function processText(raw){
    const t = toAllowedLower(raw);
    const filtered = [];
    for (let i = 0; i < t.length; i++) {
      const ch = t[i];
      if (ch === ' ' || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9')) {
        filtered.push(ch);
      }
    }
    return filtered;
  }

  function loadCharacterImage(character){
    return new Promise((resolve, reject) => {
      if (character === ' ') {
        // Represent space as gap, no image
        return resolve(null);
      }
      const img = new Image();
      img.alt = character;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('ImageLoadError'));
      img.src = `${CHARS_BASE}${character}.png`;
    });
  }

  async function composeImage(characters){
    // Compose onto a single canvas with white background.
    output.innerHTML = '';
    const SPACE_GAP = 16; // px white space for spaces
    const CHAR_GAP = 4;   // px spacing between adjacent characters
    const charactersWithPadding = [' ', ...characters, ' '];

    // Load images (spaces resolve to null). Skip missing images.
    const loaded = await Promise.all(charactersWithPadding.map(async (ch) => {
      if (ch === ' ') return { ch, img: null };
      try {
        const img = await loadCharacterImage(ch);
        return { ch, img };
      } catch (_) {
        return null; // missing image -> skip
      }
    }));

    // Filter out missing characters entirely (per spec)
    const parts = loaded.filter(Boolean);

    // Determine canvas size
    let width = 0;
    let height = 0;
    let prevWasImage = false;
    for (const part of parts) {
      if (part.img === null) {
        width += SPACE_GAP; // space
        prevWasImage = false; // break adjacency
      } else {
        if (prevWasImage) width += CHAR_GAP; // gap between adjacent characters
        width += part.img.width;
        height = Math.max(height, part.img.height);
        prevWasImage = true;
      }
    }

    if (width === 0 || height === 0) {
      // Nothing to render
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw characters left-to-right; align to bottom
    let x = 0;
    prevWasImage = false;
    for (const part of parts) {
      if (part.img === null) {
        x += SPACE_GAP; // gap for space
        prevWasImage = false;
      } else {
        if (prevWasImage) x += CHAR_GAP;
        const y = canvas.height - part.img.height;
        ctx.drawImage(part.img, x, y);
        x += part.img.width;
        prevWasImage = true;
      }
    }

    // Display the single composed image
    displayCompositeImage(canvas);
  }

  function displayCompositeImage(canvas){
    // Replace output with a single <img> generated from the canvas
    output.innerHTML = '';
    const img = document.createElement('img');
    img.alt = 'Composite image';
    try {
      img.src = canvas.toDataURL('image/png');
    } catch (_) {
      // Fallback: append canvas directly if toDataURL not available
      output.appendChild(canvas);
      return;
    }
    output.appendChild(img);
  }

  function updateConvertButtonState(){
    const text = input.value;
    const valid = validateInput(toAllowedLower(text));
    convertBtn.disabled = !valid;
  }

  async function onConvert(){
    const t0 = performance.now();
    const chars = processText(input.value);
    setStatus('Generating...');
    await composeImage(chars);
    const t1 = performance.now();
    setStatus(`Done in ${Math.round(t1 - t0)} ms`);
  }

  function onClear(){
    input.value = '';
    updateConvertButtonState();
    output.innerHTML = '';
    setStatus('');
    input.focus();
  }

  // Preload images for fast conversion
  function preloadAll(){
    const list = [];
    for (let c = 97; c <= 122; c++) { // a-z
      list.push(String.fromCharCode(c));
    }
    for (let d = 48; d <= 57; d++) { // 0-9
      list.push(String.fromCharCode(d));
    }
    list.forEach(ch => {
      const img = new Image();
      img.src = `${CHARS_BASE}${ch}.png`;
    });
  }

  // Wire events
  input.addEventListener('input', updateConvertButtonState);
  convertBtn.addEventListener('click', onConvert);
  clearBtn.addEventListener('click', onClear);

  // Init
  preloadAll();
  updateConvertButtonState();
})();


