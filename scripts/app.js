(function(){
  const input = document.getElementById('text-input');
  const convertBtn = document.getElementById('convert-btn');
  const animateBtn = document.getElementById('animate-btn');
  const stopBtn = document.getElementById('stop-btn');
  const skipBtn = document.getElementById('skip-btn');
  const clearBtn = document.getElementById('clear-btn');
  const output = document.getElementById('image-output');
  const statusEl = document.getElementById('status');

  const ALLOWED_REGEX = /^[a-z0-9 ]+$/; // lowercase letters, digits, space
  const MAX_LEN = 50;
  const CHARS_BASE = './assets/chars/';
  
  // Animation state
  let currentImage = null;
  let isAnimating = false;

  function setStatus(message){
    statusEl.textContent = message || '';
  }

  function displayGrayscaleImage(width, height, pixels) {
    // Create a debug canvas to show the grayscale image
    const debugCanvas = document.createElement('canvas');
    debugCanvas.width = width;
    debugCanvas.height = height;
    debugCanvas.style.border = '2px solid blue';
    debugCanvas.style.margin = '10px';
    
    const debugCtx = debugCanvas.getContext('2d');
    const imageData = debugCtx.createImageData(width, height);
    
    for (let i = 0; i < pixels.length; i++) {
      const pixelValue = pixels[i];
      const pixelIndex = i * 4;
      
      // Set RGBA values (grayscale)
      imageData.data[pixelIndex] = pixelValue;     // Red
      imageData.data[pixelIndex + 1] = pixelValue; // Green
      imageData.data[pixelIndex + 2] = pixelValue; // Blue
      imageData.data[pixelIndex + 3] = 255;        // Alpha
    }
    
    debugCtx.putImageData(imageData, 0, 0);
    
    // Add to the page for debugging
    const debugContainer = document.createElement('div');
    debugContainer.innerHTML = '<h3>Debug: Grayscale Image</h3>';
    debugContainer.appendChild(debugCanvas);
    
    // Remove any existing grayscale debug container
    const existingDebug = document.getElementById('debug-grayscale-container');
    if (existingDebug) {
      existingDebug.remove();
    }
    
    debugContainer.id = 'debug-grayscale-container';
    document.body.appendChild(debugContainer);
    
    console.log('Debug grayscale image displayed:', width, 'x', height, 'pixels');
  }

  function displayBlackWhiteImage(width, height, pixels) {
    // Create a debug canvas to show the black and white image
    const debugCanvas = document.createElement('canvas');
    debugCanvas.width = width;
    debugCanvas.height = height;
    debugCanvas.style.border = '2px solid red';
    debugCanvas.style.margin = '10px';
    
    const debugCtx = debugCanvas.getContext('2d');
    const imageData = debugCtx.createImageData(width, height);
    
    for (let i = 0; i < pixels.length; i++) {
      const pixelValue = pixels[i];
      const pixelIndex = i * 4;
      
      // Set RGBA values (black = 0, white = 255)
      imageData.data[pixelIndex] = pixelValue;     // Red
      imageData.data[pixelIndex + 1] = pixelValue; // Green
      imageData.data[pixelIndex + 2] = pixelValue; // Blue
      imageData.data[pixelIndex + 3] = 255;        // Alpha
    }
    
    debugCtx.putImageData(imageData, 0, 0);
    
    // Add to the page for debugging
    const debugContainer = document.createElement('div');
    debugContainer.innerHTML = '<h3>Debug: Black/White Image</h3>';
    debugContainer.appendChild(debugCanvas);
    
    // Remove any existing debug container
    const existingDebug = document.getElementById('debug-container');
    if (existingDebug) {
      existingDebug.remove();
    }
    
    debugContainer.id = 'debug-container';
    document.body.appendChild(debugContainer);
    
    console.log('Debug image displayed:', width, 'x', height, 'pixels');
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
      currentImage = canvas; // Store for animation
    } catch (_) {
      // Fallback: append canvas directly if toDataURL not available
      output.appendChild(canvas);
      currentImage = canvas;
      return;
    }
    output.appendChild(img);
  }

  function updateConvertButtonState(){
    const text = input.value;
    const valid = validateInput(toAllowedLower(text));
    convertBtn.disabled = !valid;
    animateBtn.disabled = !valid || !currentImage;
  }

  async function onConvert(){
    const t0 = performance.now();
    const chars = processText(input.value);
    setStatus('Generating...');
    await composeImage(chars);
    const t1 = performance.now();
    setStatus(`Done in ${Math.round(t1 - t0)} ms`);
    updateConvertButtonState();
  }

  // Make onClear globally available
  window.onClear = function(){
    input.value = '';
    currentImage = null;
    isAnimating = false;
    updateConvertButtonState();
    output.innerHTML = '';
    setStatus('');
    input.focus();
    
    // Reset animation state
    if (typeof stopAnimation === 'function') {
      stopAnimation();
    }
    document.body.classList.remove('animating', 'completed', 'error');
  }
  
  // Make onAnimate globally available
  window.onAnimate = function(){
    console.log('onAnimate called, currentImage:', currentImage, 'isAnimating:', isAnimating);
    if (!currentImage || isAnimating) {
      console.log('onAnimate early return - currentImage:', !!currentImage, 'isAnimating:', isAnimating);
      return;
    }

    try {
      console.log('onAnimate: Getting image from output div');
      // Get the image from the image-output div (the displayed image)
      const imgElement = output.querySelector('img');
      const canvasElement = output.querySelector('canvas');
      console.log('onAnimate: imgElement found:', !!imgElement, 'canvasElement found:', !!canvasElement);
      
      if (!imgElement && !canvasElement) {
        console.log('onAnimate: No image or canvas element found');
        setStatus('No image found. Please convert text to image first.');
        return;
      }

      // Create a clean canvas with the same dimensions as the original
      const originalCanvas = currentImage;
      const canvas = document.createElement('canvas');
      canvas.width = originalCanvas.width;
      canvas.height = originalCanvas.height;
      const ctx = canvas.getContext('2d');

      console.log('Using existing canvas dimensions:', canvas.width, 'x', canvas.height);

      // Draw the image from either the img element or recreate the text
      if (imgElement) {
        console.log('onAnimate: Drawing from img element');
        ctx.drawImage(imgElement, 0, 0);
      } else if (canvasElement) {
        console.log('onAnimate: Recreating text on clean canvas');
        // Fill white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set text properties to match the character images
        ctx.fillStyle = '#000000';
        ctx.font = '48px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        
        // Get the text and recreate it with the same spacing
        const text = input.value.trim();
        const SPACE_GAP = 16;
        const CHAR_GAP = 4;
        const characters = text.split('');
        
        let x = 0;
        let prevWasImage = false;
        
        for (let i = 0; i < characters.length; i++) {
          const ch = characters[i];
          
          if (ch === ' ') {
            x += SPACE_GAP;
            prevWasImage = false;
          } else {
            if (prevWasImage) x += CHAR_GAP;
            
            // Draw the character
            const y = canvas.height; // Bottom alignment
            ctx.fillText(ch, x, y);
            
            // Estimate character width
            const charWidth = ctx.measureText(ch).width;
            x += charWidth;
            prevWasImage = true;
          }
        }
      }

      // Now we can safely get image data from the clean canvas
      const canvasImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Create grayscale pixel array
      const pixels = new Uint8Array(canvas.width * canvas.height);
      for (let i = 0; i < canvasImageData.data.length; i += 4) {
        // Use red channel as grayscale value
        pixels[i / 4] = canvasImageData.data[i];
      }

      console.log('Grayscale pixels sample:', pixels.slice(0, 20));
      console.log('Grayscale pixel range:', 'Min:', Math.min(...pixels), 'Max:', Math.max(...pixels));

      // Debug: Display the grayscale image
      displayGrayscaleImage(canvas.width, canvas.height, pixels);

      // Create a simple black and white image data structure
      const blackWhitePixels = new Uint8Array(canvas.width * canvas.height);
      let blackCount = 0;
      let whiteCount = 0;
      for (let i = 0; i < pixels.length; i++) {
        // Convert grayscale to black and white (threshold at 128)
        blackWhitePixels[i] = pixels[i] < 128 ? 0 : 255;
        if (blackWhitePixels[i] === 0) blackCount++;
        else whiteCount++;
      }

      console.log('Black/White conversion:', 'Black pixels:', blackCount, 'White pixels:', whiteCount);
      console.log('Sample pixels:', blackWhitePixels.slice(0, 10));

      // Debug: Display the black and white image
      displayBlackWhiteImage(canvas.width, canvas.height, blackWhitePixels);

      // Create a simple image data object for animation
      const animationImageData = {
        width: canvas.width,
        height: canvas.height,
        pixels: blackWhitePixels,
        text: input.value.trim()
      };

      // Start animation with the image data
      if (typeof startAnimation === 'function') {
        startAnimation(animationImageData);
      } else {
        setStatus('Animation system not loaded');
        return;
      }

      isAnimating = true;
      document.body.classList.add('animating');
      setStatus('Animation started!');

    } catch (error) {
      console.error('Animation error:', error);
      setStatus('Animation error: ' + error.message);
    }
  }
  
  // Make onStop globally available
  window.onStop = function(){
    if (!isAnimating) return;
    
    if (typeof stopAnimation === 'function') {
      stopAnimation();
    }
    
    isAnimating = false;
    document.body.classList.remove('animating');
    setStatus('Animation stopped');
  }
  
  // Make onSkip globally available
  window.onSkip = function(){
    if (!isAnimating) return;
    
    if (typeof skipAnimation === 'function') {
      skipAnimation();
    }
    
    isAnimating = false;
    document.body.classList.remove('animating');
    setStatus('Animation skipped');
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
  animateBtn.addEventListener('click', function() {
    console.log('Animate button clicked');
    onAnimate();
  });
  stopBtn.addEventListener('click', onStop);
  skipBtn.addEventListener('click', onSkip);
  clearBtn.addEventListener('click', onClear);

  // Init
  preloadAll();
  updateConvertButtonState();
})();


