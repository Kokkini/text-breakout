(function(){
  const input = document.getElementById('text-input');
  const startNewBtn = document.getElementById('start-new-btn');
  const statusEl = document.getElementById('status');
  const fontSizeSlider = document.getElementById('font-size');
  const fontSizeValue = document.getElementById('font-size-value');

  // const ALLOWED_REGEX = /^[a-z0-9 \n]+$/; // lowercase letters, digits, space, newlines
  const ALLOWED_REGEX = /^[\s\S]*$/; // allow all characters
  const MAX_LEN = 200;
  
  // Animation state
  let currentImage = null;
  let isAnimating = false;

  function setStatus(message){
    statusEl.textContent = message || '';
  }

  // Initialize font size control
  if (fontSizeSlider && fontSizeValue) {
    fontSizeValue.textContent = fontSizeSlider.value;
    fontSizeSlider.addEventListener('input', function(){
      fontSizeValue.textContent = fontSizeSlider.value;
    });
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


  // Start new animation function
  function startNewAnimation() {
    const text = input.value.trim();
    if (!text) {
      setStatus('Please enter some text first.');
      return;
    }
    
    // Stop current animation if running
    if (isAnimating && typeof stopAnimation === 'function') {
      stopAnimation();
      // Reset local animation state to allow new animation to start
      isAnimating = false;
    }
    
    // Start new animation
    onAnimate();
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

      // First, measure the text to determine proper canvas size
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      const fontSize = fontSizeSlider ? parseInt(fontSizeSlider.value, 10) : 20;
      const fontModifier = 'bold';
      // const fontFamily = 'Eutopia, Arial, sans-serif';
      const fontFamily = 'Arial, sans-serif';
      tempCtx.font = fontModifier ? `${fontModifier} ${fontSize}px ${fontFamily}` : `${fontSize}px ${fontFamily}`;
      tempCtx.textAlign = 'left';
      tempCtx.textBaseline = 'bottom';
      
      // Split text into lines
      const lines = text.split('\n');
      const SPACE_GAP = 6 * fontSize / 20;
      const CHAR_GAP = 2 * fontSize / 20;
      // const LINE_HEIGHT = fontSize * 0.8; // for Eutopia
      const LINE_HEIGHT = fontSize * 1.2; // for Arial
      
      // Calculate dimensions for each line
      let maxLineWidth = 0;
      const lineWidths = [];
      
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        const characters = line.split('');
        
        let lineWidth = 0;
    let prevWasImage = false;
        
        for (let i = 0; i < characters.length; i++) {
          const ch = characters[i];
          
          if (ch === ' ') {
            lineWidth += SPACE_GAP;
            prevWasImage = false;
      } else {
            if (prevWasImage) lineWidth += CHAR_GAP;
            
            // Measure character width
            const charWidth = tempCtx.measureText(ch).width;
            lineWidth += charWidth;
        prevWasImage = true;
      }
    }

        lineWidths.push(lineWidth);
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
      }
      
      // Calculate total text dimensions
      const textWidth = maxLineWidth;
      const textHeight = lines.length * LINE_HEIGHT;
      
      // Add minimal padding around the text
      const padding = 1;
      const canvasWidth = textWidth + (padding * 2);
      const canvasHeight = textHeight + (padding * 2);
      
      console.log('Text dimensions:', textWidth, 'x', textHeight);
      console.log('Canvas dimensions:', canvasWidth, 'x', canvasHeight);
      console.log('Number of lines:', lines.length);

      // Create the actual canvas with proper dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      console.log('onAnimate: Generating new text image');

    // Fill white background
    ctx.fillStyle = COLORS.TEXT_WHITE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text properties
      ctx.fillStyle = COLORS.TEXT_BLACK;
      ctx.font = fontModifier ? `${fontModifier} ${fontSize}px ${fontFamily}` : `${fontSize}px ${fontFamily}`;
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
      
      // Draw the text with proper spacing and padding for each line
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        const characters = line.split('');
        
        let x = padding; // Start with left padding
        let prevWasImage = false;
        
        // Calculate Y position for this line (from top to bottom)
        const y = padding + (lineIndex + 1) * LINE_HEIGHT;
        
        for (let i = 0; i < characters.length; i++) {
          const ch = characters[i];
          
          if (ch === ' ') {
            x += SPACE_GAP;
        prevWasImage = false;
      } else {
        if (prevWasImage) x += CHAR_GAP;
            
            // Draw the character
            ctx.fillText(ch, x, y);
            
            // Get character width
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
      // displayGrayscaleImage(canvas.width, canvas.height, pixels);

      // Create black and white pixel array (already at low resolution)
      const blackWhitePixels = new Uint8Array(canvas.width * canvas.height);
      let blackCount = 0;
      let whiteCount = 0;
      for (let i = 0; i < pixels.length; i++) {
        // Convert grayscale to black and white (threshold at 128)
        let blackWhiteThreshold = 128;
        blackWhitePixels[i] = pixels[i] < blackWhiteThreshold ? 0 : 255;
        if (blackWhitePixels[i] === 0) blackCount++;
        else whiteCount++;
      }

      console.log('Black/White conversion:', 'Black pixels:', blackCount, 'White pixels:', whiteCount);
      console.log('Sample pixels:', blackWhitePixels.slice(0, 10));

      // Debug: Display the black and white image
      // displayBlackWhiteImage(canvas.width, canvas.height, blackWhitePixels);

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
  startNewBtn.addEventListener('click', function() {
    console.log('Start New button clicked');
    startNewAnimation();
  });

  // Init
  // Check if URL has any configuration params
  function hasAnyURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const relevantParams = ['ballCount', 'balls', 'numBalls', 'deviationAngle', 'deviation', 
                            'angle', 'movementSpeed', 'speed', 'fontSize', 'textResolution', 
                            'resolution', 'text', 'viewer'];
    for (const param of relevantParams) {
      if (urlParams.has(param)) return true;
    }
    return false;
  }
  
  // Only set default text and auto-start if no URL params are present
  if (!hasAnyURLParams()) {
    // Set default text and start animation automatically
    input.value = 'Hello\nWorld!';
    
    // Start animation automatically after a short delay to ensure everything is loaded
    setTimeout(() => {
      console.log('Auto-starting animation with default text: Hello\\nWorld!');
      onAnimate();
    }, 1500);
  }
  
  // Check font loading after a short delay
  setTimeout(() => {
    const fontLoaded = checkFontLoaded();
    console.log('Eutopia font loaded:', fontLoaded);
    if (!fontLoaded) {
      console.warn('Eutopia font may not be loaded properly. Check the font path and file.');
    }
  }, 1000);
})();


