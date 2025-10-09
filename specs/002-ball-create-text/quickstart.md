# Quickstart Guide: Ball Create Text Animation

**Feature**: Ball Create Text Animation  
**Date**: 2025-01-27  
**Technology**: p5.js

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Basic understanding of JavaScript
- p5.js library (included via CDN)

## Setup

### 1. HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ball Create Text Animation</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div id="app">
        <div id="controls">
            <h2>Animation Controls</h2>
            <div class="control-group">
                <label for="textInput">Enter Text:</label>
                <input type="text" id="textInput" placeholder="Enter text here" maxlength="50">
            </div>
            <div class="control-group">
                <label for="ballCount">Ball Count:</label>
                <input type="range" id="ballCount" min="1" max="50" value="20">
                <span id="ballCountValue">20</span>
            </div>
            <div class="control-group">
                <label for="deviationAngle">Deviation Angle:</label>
                <input type="range" id="deviationAngle" min="1" max="45" value="20">
                <span id="deviationAngleValue">20°</span>
            </div>
            <div class="control-group">
                <label for="movementSpeed">Movement Speed:</label>
                <input type="range" id="movementSpeed" min="0.1" max="5.0" step="0.1" value="1.0">
                <span id="movementSpeedValue">1.0x</span>
            </div>
            <div class="button-group">
                <button id="startBtn">Start Animation</button>
                <button id="stopBtn" disabled>Stop Animation</button>
                <button id="resetBtn">Reset</button>
            </div>
        </div>
        <div id="canvas-container">
            <!-- p5.js canvas will be inserted here -->
        </div>
    </div>
    <script src="js/text-to-image.js"></script>
    <script src="js/grid-system.js"></script>
    <script src="js/ray-casting.js"></script>
    <script src="js/ball-animation.js"></script>
    <script src="js/ui-controls.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### 2. Basic p5.js Setup
```javascript
// main.js
let animationState = null;
let grid = null;
let animationParameters = {
    ballCount: 20,
    deviationAngle: 20,
    movementSpeed: 1.0
};

function setup() {
    createCanvas(800, 600);
    background(255);
    
    // Initialize UI controls
    initializeUIControls();
    
    // Set up event listeners
    setupEventListeners();
}

function draw() {
    background(255);
    
    if (animationState && animationState.isRunning) {
        updateAnimation(animationState);
        drawGrid(grid);
        drawBalls(animationState.balls);
    } else if (grid) {
        drawGrid(grid);
    }
}

function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', startAnimation);
    document.getElementById('stopBtn').addEventListener('click', stopAnimation);
    document.getElementById('resetBtn').addEventListener('click', resetAnimation);
}
```

## Core Implementation

### 3. Text to Image Conversion
```javascript
// text-to-image.js
function convertTextToImage(text) {
    // Validate input
    if (!text || text.length === 0 || text.length > 50) {
        throw new Error('Text must be 1-50 characters');
    }
    
    // Create canvas for text rendering
    const tempCanvas = createGraphics(400, 100);
    tempCanvas.background(255);
    tempCanvas.fill(0);
    tempCanvas.textSize(48);
    tempCanvas.textAlign(CENTER, CENTER);
    tempCanvas.text(text, 200, 50);
    
    // Extract pixel data
    const pixels = tempCanvas.pixels;
    const width = tempCanvas.width;
    const height = tempCanvas.height;
    
    return {
        width: width,
        height: height,
        pixels: pixels,
        text: text
    };
}

function convertToBlackWhite(grayscaleImage) {
    const binaryPixels = [];
    
    for (let i = 0; i < grayscaleImage.pixels.length; i += 4) {
        // Use red channel for grayscale value
        const grayValue = grayscaleImage.pixels[i];
        // Convert to binary: black text (0) = true, white background (255) = false
        binaryPixels.push(grayValue < 128);
    }
    
    return {
        width: grayscaleImage.width,
        height: grayscaleImage.height,
        pixels: binaryPixels
    };
}
```

### 4. Grid System
```javascript
// grid-system.js
function createGrid(blackWhiteImage, padding = 5) {
    const gridWidth = blackWhiteImage.width + (padding * 2);
    const gridHeight = blackWhiteImage.height + (padding * 2);
    const squares = [];
    
    // Initialize grid with edge padding
    for (let y = 0; y < gridHeight; y++) {
        squares[y] = [];
        for (let x = 0; x < gridWidth; x++) {
            let state, type;
            
            if (x < padding || x >= gridWidth - padding || 
                y < padding || y >= gridHeight - padding) {
                // Edge padding
                state = SquareState.WHITE_EDGE;
                type = SquareType.EDGE;
            } else {
                // Image area
                const imageX = x - padding;
                const imageY = y - padding;
                const pixelIndex = imageY * blackWhiteImage.width + imageX;
                const isBlack = blackWhiteImage.pixels[pixelIndex];
                
                if (isBlack) {
                    state = SquareState.BLACK_PROTECTED;
                    type = SquareType.PROTECTED;
                } else {
                    state = SquareState.BLACK_CARVEABLE;
                    type = SquareType.CARVEABLE;
                }
            }
            
            squares[y][x] = {
                x: x,
                y: y,
                state: state,
                type: type
            };
        }
    }
    
    return {
        width: gridWidth,
        height: gridHeight,
        squares: squares,
        padding: padding
    };
}
```

### 5. Ball Animation
```javascript
// ball-animation.js
function createBall(x, y, velocityX, velocityY, diameter) {
    return {
        id: generateUniqueId(),
        x: x,
        y: y,
        velocityX: velocityX,
        velocityY: velocityY,
        diameter: diameter,
        isActive: true
    };
}

function updateBallPosition(ball) {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // Check bounds
    if (ball.x < 0 || ball.x > width || ball.y < 0 || ball.y > height) {
        ball.isActive = false;
    }
}

function checkBallCollision(ball, grid) {
    const gridX = Math.floor(ball.x / (width / grid.width));
    const gridY = Math.floor(ball.y / (height / grid.height));
    
    if (gridX < 0 || gridX >= grid.width || gridY < 0 || gridY >= grid.height) {
        return { hasCollision: false };
    }
    
    const square = grid.squares[gridY][gridX];
    
    if (square.state === SquareState.BLACK_CARVEABLE) {
        return {
            hasCollision: true,
            square: square,
            isEdge: false,
            collisionPoint: { x: ball.x, y: ball.y }
        };
    } else if (square.state === SquareState.BLACK_PROTECTED) {
        return {
            hasCollision: true,
            square: square,
            isEdge: false,
            collisionPoint: { x: ball.x, y: ball.y }
        };
    }
    
    return { hasCollision: false };
}
```

### 6. Ray Casting
```javascript
// ray-casting.js
function castRay(startX, startY, angle, grid, maxDistance) {
    const intersections = [];
    const endX = startX + Math.cos(angle) * maxDistance;
    const endY = startY + Math.sin(angle) * maxDistance;
    
    // Simple line-grid intersection algorithm
    const steps = Math.max(Math.abs(endX - startX), Math.abs(endY - startY));
    const stepX = (endX - startX) / steps;
    const stepY = (endY - startY) / steps;
    
    for (let i = 0; i <= steps; i++) {
        const x = startX + stepX * i;
        const y = startY + stepY * i;
        
        const gridX = Math.floor(x / (width / grid.width));
        const gridY = Math.floor(y / (height / grid.height));
        
        if (gridX >= 0 && gridX < grid.width && gridY >= 0 && gridY < grid.height) {
            const square = grid.squares[gridY][gridX];
            const distance = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
            
            intersections.push({
                x: x,
                y: y,
                distance: distance,
                square: square,
                isEdge: square.type === SquareType.EDGE
            });
        }
    }
    
    return {
        startX: startX,
        startY: startY,
        angle: angle,
        maxDistance: maxDistance,
        intersections: intersections
    };
}
```

## Usage Examples

### Basic Animation
```javascript
// Start animation with default settings
function startAnimation() {
    const text = document.getElementById('textInput').value;
    if (!text) {
        alert('Please enter some text');
        return;
    }
    
    try {
        // Convert text to image
        const grayscaleImage = convertTextToImage(text);
        const blackWhiteImage = convertToBlackWhite(grayscaleImage);
        
        // Create grid
        grid = createGrid(blackWhiteImage);
        
        // Start animation
        animationState = {
            isRunning: true,
            isComplete: false,
            frameCount: 0,
            balls: [],
            parameters: animationParameters
        };
        
        // Spawn initial balls
        spawnInitialBalls(animationState, grid);
        
        // Update UI
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        
    } catch (error) {
        alert('Error: ' + error.message);
    }
}
```

### Custom Parameters
```javascript
// Update parameters from UI
function updateParameters() {
    animationParameters.ballCount = parseInt(document.getElementById('ballCount').value);
    animationParameters.deviationAngle = parseInt(document.getElementById('deviationAngle').value);
    animationParameters.movementSpeed = parseFloat(document.getElementById('movementSpeed').value);
    
    // Update display values
    document.getElementById('ballCountValue').textContent = animationParameters.ballCount;
    document.getElementById('deviationAngleValue').textContent = animationParameters.deviationAngle + '°';
    document.getElementById('movementSpeedValue').textContent = animationParameters.movementSpeed + 'x';
}
```

## Testing

### Unit Tests
```javascript
// Example test structure
describe('Text to Image Conversion', () => {
    test('should convert text to grayscale image', () => {
        const image = convertTextToImage('Hello');
        expect(image.width).toBeGreaterThan(0);
        expect(image.height).toBeGreaterThan(0);
        expect(image.pixels).toBeDefined();
    });
    
    test('should validate text input', () => {
        expect(() => convertTextToImage('')).toThrow('Text must be 1-50 characters');
        expect(() => convertTextToImage('a'.repeat(51))).toThrow('Text must be 1-50 characters');
    });
});
```

### Manual Testing
1. Enter various text inputs (short, long, special characters)
2. Adjust animation parameters and observe behavior
3. Test edge cases (single character, maximum length)
4. Verify animation completion detection
5. Test user controls (start, stop, reset)

## Troubleshooting

### Common Issues
1. **Animation not starting**: Check text input validation
2. **Balls not moving**: Verify velocity calculations
3. **Collision detection issues**: Check grid coordinate mapping
4. **Performance problems**: Reduce ball count or ray casting complexity

### Debug Mode
```javascript
// Enable debug mode for development
const DEBUG_MODE = true;

function draw() {
    background(255);
    
    if (animationState && animationState.isRunning) {
        updateAnimation(animationState);
        drawGrid(grid);
        drawBalls(animationState.balls);
        
        if (DEBUG_MODE) {
            drawDebugInfo(animationState);
        }
    }
}
```

## Next Steps

1. Implement advanced ray casting algorithms
2. Add sound effects for ball collisions
3. Create different ball types and behaviors
4. Add animation presets and themes
5. Implement save/load functionality for animations
