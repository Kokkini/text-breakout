(function(){
  const input = document.getElementById('text-input');
  const animateBtn = document.getElementById('animate-btn');
  const stopBtn = document.getElementById('stop-btn');
  const skipBtn = document.getElementById('skip-btn');
  const clearBtn = document.getElementById('clear-btn');
  const statusEl = document.getElementById('status');

  const ALLOWED_REGEX = /^[a-z0-9 ]+$/; // lowercase letters, digits, space
  const MAX_LEN = 50;
  
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


  function updateAnimateButtonState(){
    const text = input.value;
    const valid = validateInput(toAllowedLower(text));
    animateBtn.disabled = !valid;
  }


  // Make onClear globally available
  window.onClear = function(){
    input.value = '';
    currentImage = null;
    isAnimating = false;
    updateAnimateButtonState();
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
    console.log('onAnimate called, isAnimating:', isAnimating);
    if (isAnimating) {
      console.log('onAnimate early return - already animating');
      return;
    }

    try {
      console.log('onAnimate: Generating text image directly');
      
      // Get the text input
      const text = input.value.trim();
      if (!text) {
        setStatus('Please enter some text first.');
        return;
      }

      // Create a clean canvas for the text image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size based on text length (estimate)
      const estimatedWidth = text.length * 30 + 100; // Rough estimate
      const estimatedHeight = 60;
      canvas.width = estimatedWidth;
      canvas.height = estimatedHeight;

      console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

      // Generate new text image using Eutopia font
      console.log('onAnimate: Generating new text image with Eutopia font');
      
      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set text properties with Eutopia font
      ctx.fillStyle = '#000000';
      const fontSize = 48;
      ctx.font = `${fontSize}px Eutopia, Arial, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      
      // Debug: Log the actual font being used
      console.log('Canvas font set to:', ctx.font);
      console.log('Font size:', fontSize);
      
      // Test if font is loaded by measuring text
      const testText = 'Hello';
      const metrics = ctx.measureText(testText);
      console.log('Font metrics for "Hello":', {
        width: metrics.width,
        actualBoundingBoxAscent: metrics.actualBoundingBoxAscent,
        actualBoundingBoxDescent: metrics.actualBoundingBoxDescent
      });
      
      // Draw the text with proper spacing
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
          
          // Draw the character using Eutopia font
          const y = canvas.height; // Bottom alignment
          ctx.fillText(ch, x, y);
          
          // Estimate character width
          const charWidth = ctx.measureText(ch).width;
          x += charWidth;
          prevWasImage = true;
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

      // Create black and white pixel array (already at low resolution)
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

  // Check if Eutopia font is loaded
  function checkFontLoaded() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Test with Eutopia font
    ctx.font = '16px Eutopia, Arial, sans-serif';
    const eutopiaWidth = ctx.measureText('Hello').width;
    
    // Test with Arial fallback
    ctx.font = '16px Arial, sans-serif';
    const arialWidth = ctx.measureText('Hello').width;
    
    console.log('Font test - Eutopia width:', eutopiaWidth, 'Arial width:', arialWidth);
    console.log('Fonts are different:', eutopiaWidth !== arialWidth);
    
    return eutopiaWidth !== arialWidth;
  }


  // Wire events
  input.addEventListener('input', updateAnimateButtonState);
  animateBtn.addEventListener('click', function() {
    console.log('Animate button clicked');
    onAnimate();
  });
  stopBtn.addEventListener('click', onStop);
  skipBtn.addEventListener('click', onSkip);
  clearBtn.addEventListener('click', onClear);

  // Init
  updateAnimateButtonState();
  
  // Check font loading after a short delay
  setTimeout(() => {
    const fontLoaded = checkFontLoaded();
    console.log('Eutopia font loaded:', fontLoaded);
    if (!fontLoaded) {
      console.warn('Eutopia font may not be loaded properly. Check the font path and file.');
    }
  }, 1000);
})();


