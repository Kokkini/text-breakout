/**
 * Main Animation Loop and System Integration
 * Integrates p5.js animation loop with core systems
 */

// Define classes locally if not available globally
const AnimationParameters = window.AnimationParameters || class {
    constructor() {
        this.ballCount = 30;
        this.deviationAngle = 15;
        this.movementSpeed = 1.0;
    }
};

const AnimationState = window.AnimationState || class {
    constructor(isRunning, frameCount, balls, ballsActive, grid, parameters) {
        this.isRunning = isRunning;
        this.frameCount = frameCount;
        this.balls = balls;
        this.ballsActive = ballsActive;
        this.grid = grid;
        this.parameters = parameters;
    }
    
    addBall(ball) {
        this.balls.push(ball);
        this.ballsActive++;
    }
    
    removeBall(ballId) {
        const index = this.balls.findIndex(ball => ball.id === ballId);
        if (index !== -1) {
            this.balls.splice(index, 1);
            this.ballsActive--;
        }
    }
    
    getActiveBalls() {
        return this.balls.filter(ball => ball.isActive);
    }
    
    updateFrameCount() {
        this.frameCount++;
    }
};

const Grid = window.Grid || class {
    constructor(width, height, squares, padding, originalWidth, originalHeight) {
        this.width = width;
        this.height = height;
        this.squares = squares;
        this.padding = padding;
        this.originalWidth = originalWidth;
        this.originalHeight = originalHeight;
    }
    
    getSquare(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.squares[y][x];
        }
        return null;
    }
};

const Square = window.Square || class {
    constructor(x, y, state, type) {
        this.x = x;
        this.y = y;
        this.state = state;
        this.type = type;
    }
    
    isCarveable() {
        return this.state === 'BLACK_CARVEABLE';
    }
    
    isProtected() {
        return this.state === 'BLACK_PROTECTED';
    }
    
    isWhite() {
        return this.state === 'WHITE_CARVED' || this.state === 'WHITE_EDGE';
    }
};

const Ball = window.Ball || class {
    constructor(id, x, y, velocityX, velocityY, diameter) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.diameter = diameter;
        this.isActive = true;
    }
    
    getSpeed() {
        return Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
    }
    
    getAngle() {
        return Math.atan2(this.velocityY, this.velocityX);
    }
    
    setVelocityFromAngle(angle, speed) {
        this.velocityX = Math.cos(angle) * speed;
        this.velocityY = Math.sin(angle) * speed;
    }
    
    updatePosition(deltaTime = 1) {
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }
};

// Global variables
let animationState = null;
let grid = null;
let animationParameters = null;
let canvasWidth = 800;
let canvasHeight = 600;
let gridRenderingParams = null; // Will store current grid rendering parameters
let islands = []; // Store detected islands for completion checking

/**
 * p5.js setup function - called once when the program starts
 */
function setup() {
    try {
        // Create canvas
        const canvas = createCanvas(canvasWidth, canvasHeight);
        canvas.parent('animation-container');
        
        // Set frame rate
        frameRate(60);
        
        // Initialize animation parameters
        if (!animationParameters) {
            animationParameters = new AnimationParameters();
        }
        
        // Initialize UI controls
        initializeUIControls();
        
        // Event listeners are handled by the existing app.js
        
        // Set initial status
        updateStatus('Ready to start animation');
        
        console.log('Ball Create Text Animation initialized successfully');
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'setup' });
        updateStatus('Error during initialization', 'error');
    }
}

/**
 * p5.js draw function - called continuously in a loop
 */
function draw() {
    try {
        // Clear background - grey during animation, white otherwise
        if (animationState && animationState.isRunning) {
            background(0); // Grey background during animation
        } else {
            background(255); // White background when not animating
        }
        
        if (animationState && animationState.isRunning) {
            // Update animation
            updateAnimation();
            
            // Draw grid
            if (grid) {
                // Only recalculate grid rendering parameters if they don't exist
                if (!gridRenderingParams) {
                    if (typeof getGridRenderingParams === 'function') {
                        gridRenderingParams = getGridRenderingParams(grid, canvasWidth, canvasHeight);
                        if (typeof window !== 'undefined') window.gridRenderingParams = gridRenderingParams;
                    } else if (typeof window.getGridRenderingParams === 'function') {
                        gridRenderingParams = window.getGridRenderingParams(grid, canvasWidth, canvasHeight);
                        if (typeof window !== 'undefined') window.gridRenderingParams = gridRenderingParams;
                    } else {
                        // Fallback if function not available
                        gridRenderingParams = {
                            squareSize: Math.min(canvasWidth / grid.width, canvasHeight / grid.height),
                            offsetX: 0,
                            offsetY: 0,
                            gridWidth: grid.width,
                            gridHeight: grid.height
                        };
                        if (typeof window !== 'undefined') window.gridRenderingParams = gridRenderingParams;
                    }
                } else {
                    if (typeof window !== 'undefined') window.gridRenderingParams = gridRenderingParams;
                }
                drawGrid(grid, canvasWidth, canvasHeight);
            }
            
            // Draw balls
            if (animationState.balls) {
                drawBalls(animationState.balls);
            }
            
            // // Check for completion
            // if (isAnimationComplete(grid)) {
            //     completeAnimation();
            // }
            
        } else if (grid) {
            // Draw static grid when not animating
            // Only recalculate grid rendering parameters if they don't exist
            if (!gridRenderingParams) {
                if (typeof getGridRenderingParams === 'function') {
                    gridRenderingParams = getGridRenderingParams(grid, canvasWidth, canvasHeight);
                } else if (typeof window.getGridRenderingParams === 'function') {
                    gridRenderingParams = window.getGridRenderingParams(grid, canvasWidth, canvasHeight);
                } else {
                    // Fallback if function not available
                    gridRenderingParams = {
                        squareSize: Math.min(canvasWidth / grid.width, canvasHeight / grid.height),
                        offsetX: 0,
                        offsetY: 0,
                        gridWidth: grid.width,
                        gridHeight: grid.height
                    };
                }
            }
            if (typeof window !== 'undefined') window.gridRenderingParams = gridRenderingParams;
            drawGrid(grid, canvasWidth, canvasHeight);
        } else {
            // Show welcome message
            drawWelcomeMessage();
        }
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'draw' });
        updateStatus('Animation error occurred', 'error');
    }
}

/**
 * Update animation state for one frame
 */
function updateAnimation() {
    try {
        if (!animationState || !animationState.isRunning) {
            return;
        }
        
        // Update frame count
        animationState.frameCount++;
        
        // Update all balls
        const updateResults = updateAllBalls(animationState.balls, grid, gridRenderingParams, animationParameters);
        
        // Check and complete islands
        if (islands && islands.length > 0) {
            if (typeof updateIslands === 'function') {
                updateIslands(grid, islands);
            } else if (typeof window.updateIslands === 'function') {
                window.updateIslands(grid, islands);
            }
        }
        
        // Update animation state
        animationState.ballsActive = getActiveBalls(animationState.balls).length;
        animationState.carveableSquaresRemaining = countSquaresByState(grid, SquareState.BLACK_CARVEABLE);
        
        // Clean up inactive balls
        animationState.balls = cleanupInactiveBalls(animationState.balls);
        
        // Spawn new balls if needed
        if (animationParameters && animationState.ballsActive < animationParameters.ballCount) {
            const ballsNeeded = animationParameters.ballCount - animationState.ballsActive;
            for (let i = 0; i < ballsNeeded; i++) {
                const newBall = spawnNewBall(grid, animationParameters, gridRenderingParams);
                if (newBall) {
                    animationState.addBall(newBall);
                }
            }
        }
        
        // Update status
        updateAnimationStatus();
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'updateAnimation' });
    }
}

/**
 * Start the ball carving animation
 */
function startAnimation(imageData) {
    try {
        console.log('startAnimation called with imageData:', imageData);
        
        let blackWhiteImage;
        
        if (imageData) {
            console.log('imageData properties:', {
                width: imageData.width,
                height: imageData.height,
                pixels: imageData.pixels ? imageData.pixels.length : 'undefined',
                text: imageData.text
            });
            
            if (!imageData.pixels) {
                throw new Error('imageData.pixels is undefined');
            }
            
            // Convert image data directly to black/white format
            const binaryPixels = [];
            for (let i = 0; i < imageData.pixels.length; i++) {
                const grayValue = imageData.pixels[i];
                // Threshold at 128: below = black (true), above = white (false)
                // Black text (0) = true (protected), white background (255) = false (carveable)
                binaryPixels.push(grayValue < 128);
            }
            
            // Create a simple black/white image object
            blackWhiteImage = {
                width: imageData.width,
                height: imageData.height,
                pixels: binaryPixels,
                text: imageData.text
            };
            
            console.log('Black/White Image Resolution:', imageData.width, 'x', imageData.height);
            console.log('Total pixels:', imageData.width * imageData.height);
            console.log('Binary pixels length:', binaryPixels.length);
        } else {
            // Fallback: get text from input and convert
            const text = document.getElementById('text-input').value.trim();
            
            if (!text) {
                updateStatus('Please enter some text first', 'error');
                return;
            }
            
            // Convert text to image
            const grayscaleImage = convertTextToImageOptimized(text);
            blackWhiteImage = convertToBlackWhite(grayscaleImage);
        }
        
        // Create grid
        grid = createGrid(blackWhiteImage, 3);
        
        console.log('Grid Dimensions:', grid.width, 'x', grid.height);
        console.log('Grid total squares:', grid.width * grid.height);
        console.log('Image to Grid ratio:', 'Image:', blackWhiteImage.width, 'x', blackWhiteImage.height, 'Grid:', grid.width, 'x', grid.height);

        // Reset and calculate grid rendering parameters for aspect ratio preservation
        gridRenderingParams = null; // Reset to ensure fresh calculation
        if (typeof getGridRenderingParams === 'function') {
            gridRenderingParams = getGridRenderingParams(grid, canvasWidth, canvasHeight);
            console.log('Grid rendering params:', gridRenderingParams);
        } else {
            console.error('getGridRenderingParams function not available, checking window object...');
            if (typeof window.getGridRenderingParams === 'function') {
                gridRenderingParams = window.getGridRenderingParams(grid, canvasWidth, canvasHeight);
                console.log('Grid rendering params (from window):', gridRenderingParams);
            } else {
                console.error('getGridRenderingParams not available in window either');
                // Fallback: create basic parameters
                gridRenderingParams = {
                    squareSize: Math.min(canvasWidth / grid.width, canvasHeight / grid.height),
                    offsetX: 0,
                    offsetY: 0,
                    gridWidth: grid.width,
                    gridHeight: grid.height
                };
                console.log('Using fallback grid rendering params:', gridRenderingParams);
            }
        }

        // Mark isolated carveable squares as protected
        markIsolatedCarveableAsProtected(grid);
        
        // Initialize islands for loop detection and completion
        if (typeof initializeIslands === 'function') {
            islands = initializeIslands(grid);
        } else if (typeof window.initializeIslands === 'function') {
            islands = window.initializeIslands(grid);
        } else {
            console.warn('initializeIslands function not available');
            islands = [];
        }
        
        // Initialize animation state
        animationState = new AnimationState(
            true,  // isRunning
            false, // isComplete
            0,     // frameCount
            countSquaresByState(grid, SquareState.BLACK_CARVEABLE), // carveableSquaresRemaining
            0,     // ballsActive
            0      // totalBallsSpawned
        );
        
        // Spawn initial balls
        if (!animationParameters) {
            animationParameters = new AnimationParameters();
        }
        
        console.log('About to spawn initial balls, gridRenderingParams:', gridRenderingParams);
        const initialBalls = spawnInitialBalls(grid, animationParameters, gridRenderingParams);
        
        animationState.balls = initialBalls;
        animationState.ballsActive = initialBalls.length;
        animationState.totalBallsSpawned = initialBalls.length;
        
        // Update UI
        // Text input remains enabled so users can edit text while animation runs
        
        // Add animating class to body
        document.body.classList.add('animating');
        
        updateStatus('Animation started - ' + animationState.carveableSquaresRemaining + ' squares to carve');
        
        console.log('Animation started with', initialBalls.length, 'balls');
        
    } catch (error) {
        const handledError = globalErrorHandler.handleError(error, { context: 'startAnimation' });
        updateStatus(handledError, 'error');
    }
}

/**
 * Stop the animation
 */
function stopAnimation() {
    try {
        if (animationState) {
            animationState.isRunning = false;
        }
        
        // Update UI
        document.getElementById('text-input').disabled = false;
        
        // Remove animating class
        document.body.classList.remove('animating');
        
        updateStatus('Animation stopped');
        
        console.log('Animation stopped');
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'stopAnimation' });
    }
}

/**
 * Complete the animation
 */
function completeAnimation() {
    try {
        if (animationState) {
            animationState.isRunning = false;
            animationState.isComplete = true;
        }
        
        // Update UI
        document.getElementById('text-input').disabled = false;
        
        // Remove animating class
        document.body.classList.remove('animating');
        document.body.classList.add('completed');
        
        updateStatus('Animation completed! Text pattern revealed.', 'completed');
        
        console.log('Animation completed in', animationState.frameCount, 'frames');
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'completeAnimation' });
    }
}

/**
 * Skip the animation and show final result
 */
function skipAnimation() {
    try {
        if (grid) {
            // Turn all carveable squares white
            for (let y = 0; y < grid.height; y++) {
                for (let x = 0; x < grid.width; x++) {
                    const square = grid.getSquare(x, y);
                    if (square && square.state === SquareState.BLACK_CARVEABLE) {
                        updateSquareState(grid, x, y, SquareState.WHITE_CARVED);
                    }
                }
            }
        }
        
        completeAnimation();
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'skipAnimation' });
    }
}

/**
 * Reset the animation
 */
function resetAnimation() {
    try {
        // Stop animation if running
        if (animationState && animationState.isRunning) {
            stopAnimation();
        }
        
        // Clear state
        animationState = null;
        grid = null;
        islands = [];
        
        // Reset UI - use correct element IDs from existing HTML
        const textInput = document.getElementById('text-input');
        if (textInput) textInput.value = '';
        if (textInput) textInput.disabled = false;
        
        // Remove classes
        document.body.classList.remove('animating', 'completed', 'error');
        
        // Reset parameters to defaults
        if (animationParameters) {
            animationParameters.ballCount = 30;
            animationParameters.deviationAngle = 15;
            animationParameters.movementSpeed = 1.0;
            if (typeof updateParameterDisplays === 'function') {
                updateParameterDisplays();
            }
        }
        
        updateStatus('Ready to start animation');
        
        console.log('Animation reset');
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'resetAnimation' });
    }
}

/**
 * Update animation status display
 */
function updateAnimationStatus() {
    try {
        if (!animationState) {
            return;
        }
        
        const statusText = `Frame: ${animationState.frameCount} | ` +
                          `Balls: ${animationState.ballsActive} | ` +
                          `Remaining: ${animationState.carveableSquaresRemaining}`;
        
        updateStatus(statusText);
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'updateAnimationStatus' });
    }
}

/**
 * Update status message
 */
function updateStatus(message, type = 'normal') {
    try {
        const statusElement = document.getElementById('statusText');
        if (statusElement) {
            statusElement.textContent = message;
            
            // Update status container class
            const statusContainer = document.getElementById('status');
            if (statusContainer) {
                statusContainer.className = 'status ' + type;
            }
        }
        
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

/**
 * Draw welcome message when no animation is running
 */
function drawWelcomeMessage() {
    try {
        fill(100);
        textAlign(CENTER, CENTER);
        textSize(24);
        text('Loading...', canvasWidth / 2, canvasHeight / 2);
        
        // textSize(16);
        // text('Watch as balls carve out your text!', canvasWidth / 2, canvasHeight / 2 + 40);
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'drawWelcomeMessage' });
    }
}

/**
 * Handle window resize
 */
function windowResized() {
    try {
        // Adjust canvas size to fit container
        const container = document.getElementById('canvas-container');
        if (container) {
            const containerRect = container.getBoundingClientRect();
            canvasWidth = Math.min(1000, containerRect.width - 20);
            canvasHeight = Math.min(800, containerRect.height - 20);
            
            resizeCanvas(canvasWidth, canvasHeight);
        }
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'windowResized' });
    }
}

/**
 * Handle key presses
 */
function keyPressed() {}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOM loaded, ready for p5.js initialization');
    } catch (error) {
        console.error('Error during DOM load:', error);
    }
});
