/**
 * Text to Image Conversion Module
 * Converts text input to grayscale and binary images for the ball animation system
 */

// Define GrayscaleImage class locally if not available globally
const GrayscaleImage = window.GrayscaleImage || class {
    constructor(width, height, pixels, text) {
        this.width = width;
        this.height = height;
        this.pixels = pixels; // Uint8Array of grayscale values (0-255)
        this.text = text;
    }
};

// Define BlackWhiteImage class locally if not available globally
const BlackWhiteImage = window.BlackWhiteImage || class {
    constructor(width, height, pixels) {
        this.width = width;
        this.height = height;
        this.pixels = pixels; // Array of boolean values (true = black, false = white)
    }
};

/**
 * Convert text to grayscale image using p5.js
 * @param {string} text - Input text (alphanumeric with spaces only)
 * @returns {GrayscaleImage} GrayscaleImage object with pixel data
 */
function convertTextToImage(text) {
    try {
        // Validate input text
        ValidationHelper.validateText(text);
        
        // Create a temporary graphics buffer for text rendering
        const tempCanvas = createGraphics(400, 100);
        tempCanvas.background(255); // White background
        tempCanvas.fill(0); // Black text
        tempCanvas.textSize(48);
        tempCanvas.textAlign(CENTER, CENTER);
        tempCanvas.text(text, 200, 50);
        
        // Load pixels to get the pixel data
        tempCanvas.loadPixels();
        
        // Extract pixel data (RGBA format, we only need one channel for grayscale)
        const pixels = new Uint8Array(tempCanvas.width * tempCanvas.height);
        for (let i = 0; i < tempCanvas.pixels.length; i += 4) {
            // Use red channel as grayscale value
            pixels[i / 4] = tempCanvas.pixels[i];
        }
        
        // Create and return GrayscaleImage
        return new GrayscaleImage(
            tempCanvas.width,
            tempCanvas.height,
            pixels,
            text
        );
        
    } catch (error) {
        const handledError = globalErrorHandler.handleError(error, { text: text });
        throw new InvalidTextError(handledError);
    }
}

/**
 * Convert grayscale image to binary black/white image
 * @param {GrayscaleImage} grayscaleImage - Source grayscale image
 * @returns {BlackWhiteImage} BlackWhiteImage object with binary pixel data
 */
function convertToBlackWhite(grayscaleImage) {
    try {
        if (!(grayscaleImage instanceof GrayscaleImage)) {
            throw new Error('Input must be a GrayscaleImage object');
        }
        
        const binaryPixels = [];
        
        // Convert grayscale pixels to binary
        for (let i = 0; i < grayscaleImage.pixels.length; i++) {
            const grayValue = grayscaleImage.pixels[i];
            // Threshold at 128: below = black (true), above = white (false)
            // Black text (0) = true (protected), white background (255) = false (carveable)
            binaryPixels.push(grayValue < 128);
        }
        
        return new BlackWhiteImage(
            grayscaleImage.width,
            grayscaleImage.height,
            binaryPixels
        );
        
    } catch (error) {
        const handledError = globalErrorHandler.handleError(error, { 
            grayscaleImage: grayscaleImage 
        });
        throw new AnimationError(handledError);
    }
}

/**
 * Create a preview of the text image
 * @param {GrayscaleImage} grayscaleImage - Grayscale image to preview
 * @param {number} x - X position to draw at
 * @param {number} y - Y position to draw at
 * @param {number} scale - Scale factor for the preview
 */
function drawTextPreview(grayscaleImage, x = 0, y = 0, scale = 1) {
    try {
        if (!(grayscaleImage instanceof GrayscaleImage)) {
            throw new Error('Input must be a GrayscaleImage object');
        }
        
        // Create a temporary graphics buffer for the preview
        const previewCanvas = createGraphics(
            grayscaleImage.width * scale,
            grayscaleImage.height * scale
        );
        
        // Draw the grayscale image
        previewCanvas.loadPixels();
        for (let py = 0; py < previewCanvas.height; py++) {
            for (let px = 0; px < previewCanvas.width; px++) {
                const sourceX = Math.floor(px / scale);
                const sourceY = Math.floor(py / scale);
                const pixelIndex = sourceY * grayscaleImage.width + sourceX;
                
                if (pixelIndex < grayscaleImage.pixels.length) {
                    const grayValue = grayscaleImage.pixels[pixelIndex];
                    const pixelIndex4 = (py * previewCanvas.width + px) * 4;
                    previewCanvas.pixels[pixelIndex4] = grayValue;     // R
                    previewCanvas.pixels[pixelIndex4 + 1] = grayValue; // G
                    previewCanvas.pixels[pixelIndex4 + 2] = grayValue; // B
                    previewCanvas.pixels[pixelIndex4 + 3] = 255;       // A
                }
            }
        }
        previewCanvas.updatePixels();
        
        // Draw the preview to the main canvas
        image(previewCanvas, x, y);
        
    } catch (error) {
        globalErrorHandler.handleError(error, { 
            grayscaleImage: grayscaleImage,
            x: x,
            y: y,
            scale: scale
        });
    }
}

/**
 * Create a preview of the binary image
 * @param {BlackWhiteImage} blackWhiteImage - Binary image to preview
 * @param {number} x - X position to draw at
 * @param {number} y - Y position to draw at
 * @param {number} scale - Scale factor for the preview
 */
function drawBinaryPreview(blackWhiteImage, x = 0, y = 0, scale = 1) {
    try {
        if (!(blackWhiteImage instanceof BlackWhiteImage)) {
            throw new Error('Input must be a BlackWhiteImage object');
        }
        
        // Create a temporary graphics buffer for the preview
        const previewCanvas = createGraphics(
            blackWhiteImage.width * scale,
            blackWhiteImage.height * scale
        );
        
        // Draw the binary image
        previewCanvas.loadPixels();
        for (let py = 0; py < previewCanvas.height; py++) {
            for (let px = 0; px < previewCanvas.width; px++) {
                const sourceX = Math.floor(px / scale);
                const sourceY = Math.floor(py / scale);
                const pixelIndex = sourceY * blackWhiteImage.width + sourceX;
                
                if (pixelIndex < blackWhiteImage.pixels.length) {
                    const isBlack = blackWhiteImage.pixels[pixelIndex];
                    const color = isBlack ? 0 : 255; // Black or white
                    const pixelIndex4 = (py * previewCanvas.width + px) * 4;
                    previewCanvas.pixels[pixelIndex4] = color;     // R
                    previewCanvas.pixels[pixelIndex4 + 1] = color; // G
                    previewCanvas.pixels[pixelIndex4 + 2] = color; // B
                    previewCanvas.pixels[pixelIndex4 + 3] = 255;   // A
                }
            }
        }
        previewCanvas.updatePixels();
        
        // Draw the preview to the main canvas
        image(previewCanvas, x, y);
        
    } catch (error) {
        globalErrorHandler.handleError(error, { 
            blackWhiteImage: blackWhiteImage,
            x: x,
            y: y,
            scale: scale
        });
    }
}

/**
 * Get text metrics for layout calculations
 * @param {string} text - Text to measure
 * @returns {Object} Text metrics object
 */
function getTextMetrics(text) {
    try {
        ValidationHelper.validateText(text);
        
        // Create a temporary graphics buffer for measurement
        const tempCanvas = createGraphics(1, 1);
        tempCanvas.textSize(48);
        tempCanvas.textAlign(LEFT, BASELINE);
        
        const textWidth = tempCanvas.textWidth(text);
        const textHeight = 48; // Approximate text height
        
        return {
            width: Math.ceil(textWidth),
            height: textHeight,
            textWidth: textWidth,
            textHeight: textHeight
        };
        
    } catch (error) {
        globalErrorHandler.handleError(error, { text: text });
        return { width: 0, height: 0, textWidth: 0, textHeight: 0 };
    }
}

/**
 * Optimize text rendering for better grid generation
 * @param {string} text - Text to optimize
 * @returns {Object} Optimized rendering parameters
 */
function optimizeTextRendering(text) {
    try {
        ValidationHelper.validateText(text);
        
        const metrics = getTextMetrics(text);
        
        // Calculate optimal canvas size with padding
        const padding = 20;
        const canvasWidth = Math.max(200, metrics.width + padding * 2);
        const canvasHeight = Math.max(60, metrics.height + padding * 2);
        
        // Calculate optimal text size to fit the canvas
        const maxTextWidth = canvasWidth - padding * 2;
        const maxTextHeight = canvasHeight - padding * 2;
        
        let textSize = 48;
        if (metrics.textWidth > maxTextWidth) {
            textSize = Math.floor(48 * (maxTextWidth / metrics.textWidth));
        }
        if (metrics.textHeight > maxTextHeight) {
            textSize = Math.min(textSize, maxTextHeight);
        }
        
        return {
            canvasWidth: canvasWidth,
            canvasHeight: canvasHeight,
            textSize: Math.max(12, textSize),
            padding: padding
        };
        
    } catch (error) {
        globalErrorHandler.handleError(error, { text: text });
        return {
            canvasWidth: 400,
            canvasHeight: 100,
            textSize: 48,
            padding: 20
        };
    }
}

/**
 * Enhanced text to image conversion with optimization
 * @param {string} text - Input text
 * @returns {GrayscaleImage} Optimized grayscale image
 */
function convertTextToImageOptimized(text) {
    try {
        ValidationHelper.validateText(text);
        
        const renderParams = optimizeTextRendering(text);
        
        // Create optimized graphics buffer
        const tempCanvas = createGraphics(renderParams.canvasWidth, renderParams.canvasHeight);
        tempCanvas.background(255); // White background
        tempCanvas.fill(0); // Black text
        tempCanvas.textSize(renderParams.textSize);
        tempCanvas.textAlign(CENTER, CENTER);
        tempCanvas.text(text, renderParams.canvasWidth / 2, renderParams.canvasHeight / 2);
        
        // Load pixels to get the pixel data
        tempCanvas.loadPixels();
        
        // Extract pixel data (RGBA format, we only need one channel for grayscale)
        const pixels = new Uint8Array(tempCanvas.width * tempCanvas.height);
        for (let i = 0; i < tempCanvas.pixels.length; i += 4) {
            // Use red channel as grayscale value
            pixels[i / 4] = tempCanvas.pixels[i];
        }
        
        // Create and return GrayscaleImage
        return new GrayscaleImage(
            tempCanvas.width,
            tempCanvas.height,
            pixels,
            text
        );
        
    } catch (error) {
        const handledError = globalErrorHandler.handleError(error, { text: text });
        throw new InvalidTextError(handledError);
    }
}

// Make functions available globally for browser usage
if (typeof window !== 'undefined') {
    window.convertTextToImage = convertTextToImage;
    window.convertToBlackWhite = convertToBlackWhite;
    window.drawTextPreview = drawTextPreview;
    window.drawBinaryPreview = drawBinaryPreview;
    window.getTextMetrics = getTextMetrics;
    window.optimizeTextRendering = optimizeTextRendering;
    window.convertTextToImageOptimized = convertTextToImageOptimized;
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        convertTextToImage,
        convertToBlackWhite,
        drawTextPreview,
        drawBinaryPreview,
        getTextMetrics,
        optimizeTextRendering,
        convertTextToImageOptimized
    };
}
