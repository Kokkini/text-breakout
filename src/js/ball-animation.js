/**
 * Ball Animation Module
 * Handles ball creation, physics, movement, and collision detection
 */

/**
 * Create new ball object
 * @param {number} x - Initial X position
 * @param {number} y - Initial Y position
 * @param {number} velocityX - Initial X velocity
 * @param {number} velocityY - Initial Y velocity
 * @param {number} diameter - Ball diameter
 * @returns {Ball} Ball object with unique ID
 */
function createBall(x, y, velocityX, velocityY, diameter) {
    try {
        if (typeof x !== 'number' || !isFinite(x)) {
            throw new Error('X position must be a finite number');
        }
        if (typeof y !== 'number' || !isFinite(y)) {
            throw new Error('Y position must be a finite number');
        }
        if (typeof velocityX !== 'number' || !isFinite(velocityX)) {
            throw new Error('X velocity must be a finite number');
        }
        if (typeof velocityY !== 'number' || !isFinite(velocityY)) {
            throw new Error('Y velocity must be a finite number');
        }
        if (typeof diameter !== 'number' || diameter <= 0) {
            throw new Error('Diameter must be a positive number');
        }
        
        // Generate unique ID
        const id = 'ball_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        return new Ball(id, x, y, velocityX, velocityY, diameter);
        
    } catch (error) {
        const handledError = globalErrorHandler.handleError(error, { 
            x: x,
            y: y,
            velocityX: velocityX,
            velocityY: velocityY,
            diameter: diameter
        });
        throw new BallError(handledError);
    }
}

/**
 * Update ball position based on velocity
 * @param {Ball} ball - Ball to update
 */
function updateBallPosition(ball) {
    try {
        if (!(ball instanceof Ball)) {
            throw new Error('Ball must be a Ball object');
        }
        
        // Update position
        ball.updatePosition();
        
        // Check bounds and deactivate if out of bounds
        if (ball.x < 0 || ball.x > width || ball.y < 0 || ball.y > height) {
            ball.isActive = false;
        }
        
    } catch (error) {
        globalErrorHandler.handleError(error, { ball: ball });
        ball.isActive = false; // Deactivate ball on error
    }
}

/**
 * Check if ball collides with grid elements
 * @param {Ball} ball - Ball to check
 * @param {Grid} grid - Grid to check against
 * @returns {Object} CollisionResult object with collision information
 */
function checkBallCollision(ball, grid) {
    try {
        if (!(ball instanceof Ball)) {
            throw new Error('Ball must be a Ball object');
        }
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        
        // Get the square the ball is currently in
        const square = getSquareAtPixel(grid, ball.x, ball.y, width, height);
        
        if (!square) {
            return { hasCollision: false };
        }
        
        // Check collision based on square state
        if (square.state === SquareState.BLACK_CARVEABLE) {
            console.log('Ball hit carveable square at', ball.x, ball.y, 'state:', square.state);
            return {
                hasCollision: true,
                square: square,
                isEdge: false,
                collisionPoint: { x: ball.x, y: ball.y },
                shouldCarve: true
            };
        } else if (square.state === SquareState.BLACK_PROTECTED) {
            console.log('Ball hit PROTECTED square at', ball.x, ball.y, 'state:', square.state, '- DESTROYING BALL');
            return {
                hasCollision: true,
                square: square,
                isEdge: false,
                collisionPoint: { x: ball.x, y: ball.y },
                shouldDestroy: true
            };
        } else if (square.state === SquareState.WHITE_EDGE) {
            console.log('Ball hit edge at', ball.x, ball.y, 'state:', square.state);
            return {
                hasCollision: true,
                square: square,
                isEdge: true,
                collisionPoint: { x: ball.x, y: ball.y },
                shouldBounce: true
            };
        }
        
        return { hasCollision: false };
        
    } catch (error) {
        globalErrorHandler.handleError(error, { 
            ball: ball,
            grid: grid
        });
        return { hasCollision: false };
    }
}

/**
 * Handle ball collision with square
 * @param {Ball} ball - Ball that collided
 * @param {Object} collisionResult - Collision result from checkBallCollision
 * @param {Grid} grid - Grid being collided with
 * @returns {Object} Result of collision handling
 */
function handleBallCollision(ball, collisionResult, grid) {
    try {
        if (!collisionResult.hasCollision) {
            return { success: true, action: 'none' };
        }
        
        const { square, shouldCarve, shouldDestroy, shouldBounce } = collisionResult;
        
        if (shouldCarve) {
            // Carve the square (turn black to white) and bounce
            updateSquareState(grid, square.x, square.y, SquareState.WHITE_CARVED);
            bounceBallOffSquare(ball, collisionResult);
            return { success: true, action: 'carved', square: square };
            
        } else if (shouldDestroy) {
            // Destroy the ball (no bouncing for protected squares)
            ball.isActive = false;
            return { success: true, action: 'destroyed', square: square };
            
        } else if (shouldBounce) {
            // Bounce the ball off the edge with smart ray casting
            bounceBallOffEdgeSmart(ball, collisionResult, grid);
            return { success: true, action: 'bounce', square: square };
        }
        
        return { success: true, action: 'none' };
        
    } catch (error) {
        globalErrorHandler.handleError(error, { 
            ball: ball,
            collisionResult: collisionResult,
            grid: grid
        });
        return { success: false, action: 'error' };
    }
}

/**
 * Bounce ball off edge with smart ray casting
 * @param {Ball} ball - Ball to bounce
 * @param {Object} collisionResult - Collision result with collision point
 * @param {Grid} grid - Grid for ray casting
 */
function bounceBallOffEdgeSmart(ball, collisionResult, grid) {
    try {
        if (!ball || !collisionResult || !grid) {
            return;
        }
        
        // Get deviation angle from animation parameters (default 20 degrees)
        const deviationAngle = 20; // This should come from animationParameters
        
        // Use smart ray casting to find optimal bounce angle
        if (typeof findOptimalBounceAngle === 'function') {
            const bounceResult = findOptimalBounceAngle(ball, grid, deviationAngle);
            
            if (bounceResult && bounceResult.isOptimal) {
                // Use the optimal angle found by ray casting
                const speed = ball.getSpeed();
                ball.setVelocityFromAngle(bounceResult.angle, speed);
                return;
            }
        }
        
        // Fallback to simple edge reflection if ray casting fails
        bounceBallOffEdge(ball, collisionResult);
        
    } catch (error) {
        globalErrorHandler.handleError(error, { ball: ball, collisionResult: collisionResult, grid: grid });
        // Fallback to simple bounce
        bounceBallOffEdge(ball, collisionResult);
    }
}

/**
 * Bounce ball off edge with reflection
 * @param {Ball} ball - Ball to bounce
 * @param {Object} collisionResult - Collision result with collision point
 */
function bounceBallOffEdge(ball, collisionResult) {
    try {
        if (!ball || !collisionResult) {
            return;
        }
        
        // Simple edge reflection - reverse velocity component based on which edge was hit
        const { collisionPoint } = collisionResult;
        
        // Determine which edge was hit based on ball position relative to collision point
        const ballRadius = ball.diameter / 2;
        
        // Check if ball hit left or right edge
        if (Math.abs(ball.x - collisionPoint.x) > Math.abs(ball.y - collisionPoint.y)) {
            // Hit left or right edge - reverse X velocity
            ball.velocityX = -ball.velocityX;
        } else {
            // Hit top or bottom edge - reverse Y velocity
            ball.velocityY = -ball.velocityY;
        }
        
        // Add some randomness to prevent balls from getting stuck in patterns
        const randomFactor = 0.1;
        ball.velocityX += (Math.random() - 0.5) * randomFactor;
        ball.velocityY += (Math.random() - 0.5) * randomFactor;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { ball: ball, collisionResult: collisionResult });
    }
}

/**
 * Bounce ball off square with reflection
 * @param {Ball} ball - Ball to bounce
 * @param {Object} collisionResult - Collision result with collision point
 */
function bounceBallOffSquare(ball, collisionResult) {
    try {
        if (!ball || !collisionResult) {
            return;
        }
        
        // Simple square reflection - reverse velocity component based on approach angle
        const { collisionPoint } = collisionResult;
        
        // Determine which side of the square was hit based on approach direction
        const approachX = ball.velocityX;
        const approachY = ball.velocityY;
        
        // If approaching more horizontally, bounce off vertical sides
        if (Math.abs(approachX) > Math.abs(approachY)) {
            ball.velocityX = -ball.velocityX;
        } else {
            // If approaching more vertically, bounce off horizontal sides
            ball.velocityY = -ball.velocityY;
        }
        
        // Add some randomness to prevent balls from getting stuck in patterns
        const randomFactor = 0.1;
        ball.velocityX += (Math.random() - 0.5) * randomFactor;
        ball.velocityY += (Math.random() - 0.5) * randomFactor;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { ball: ball, collisionResult: collisionResult });
    }
}

/**
 * Spawn new ball at edge position
 * @param {Grid} grid - Grid to spawn ball on
 * @param {AnimationParameters} parameters - Animation parameters
 * @returns {Ball|null} New ball or null if spawning failed
 */
function spawnNewBall(grid, parameters) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        if (!(parameters instanceof AnimationParameters)) {
            throw new Error('Parameters must be an AnimationParameters object');
        }
        
        // Calculate ball diameter (half of square edge length)
        const squareWidth = width / grid.width;
        const squareHeight = height / grid.height;
        const ballDiameter = Math.min(squareWidth, squareHeight) * 0.5;
        
        // Find a random edge position
        const edgePositions = getEdgePositions(grid);
        if (edgePositions.length === 0) {
            return null;
        }
        
        const randomEdge = edgePositions[Math.floor(Math.random() * edgePositions.length)];
        const pixelCoords = getSquarePixelCoordinates(grid, randomEdge.x, randomEdge.y, width, height);
        
        // Position ball at center of edge square
        const ballX = pixelCoords.x + pixelCoords.width / 2;
        const ballY = pixelCoords.y + pixelCoords.height / 2;
        
        // Random initial velocity
        const speed = 2 * parameters.movementSpeed;
        const angle = Math.random() * Math.PI * 2;
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;
        
        return createBall(ballX, ballY, velocityX, velocityY, ballDiameter);
        
    } catch (error) {
        globalErrorHandler.handleError(error, { 
            grid: grid,
            parameters: parameters
        });
        return null;
    }
}

/**
 * Get all edge positions in the grid
 * @param {Grid} grid - Grid to search
 * @returns {Array} Array of edge square coordinates
 */
function getEdgePositions(grid) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        
        const edgePositions = [];
        
        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                const square = grid.getSquare(x, y);
                if (square && square.state === SquareState.WHITE_EDGE) {
                    edgePositions.push({ x: x, y: y });
                }
            }
        }
        
        return edgePositions;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { grid: grid });
        return [];
    }
}

/**
 * Spawn initial balls around the grid edges
 * @param {Grid} grid - Grid to spawn balls on
 * @param {AnimationParameters} parameters - Animation parameters
 * @returns {Array} Array of spawned balls
 */
function spawnInitialBalls(grid, parameters) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        if (!(parameters instanceof AnimationParameters)) {
            throw new Error('Parameters must be an AnimationParameters object');
        }
        
        const balls = [];
        const ballCount = Math.min(parameters.ballCount, 50); // Limit to 50 balls max
        
        for (let i = 0; i < ballCount; i++) {
            const ball = spawnNewBall(grid, parameters);
            if (ball) {
                balls.push(ball);
            }
        }
        
        return balls;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { 
            grid: grid,
            parameters: parameters
        });
        return [];
    }
}

/**
 * Update all balls in the animation
 * @param {Array} balls - Array of balls to update
 * @param {Grid} grid - Grid for collision detection
 * @returns {Object} Update results
 */
function updateAllBalls(balls, grid) {
    try {
        if (!Array.isArray(balls)) {
            throw new Error('Balls must be an array');
        }
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        
        const results = {
            ballsUpdated: 0,
            ballsDestroyed: 0,
            squaresCarved: 0,
            ballsBounced: 0
        };
        
        for (let i = balls.length - 1; i >= 0; i--) {
            const ball = balls[i];
            
            if (!ball.isActive) {
                continue;
            }
            
            // Update ball position
            updateBallPosition(ball);
            results.ballsUpdated++;
            
            // Check for collisions
            const collisionResult = checkBallCollision(ball, grid);
            if (collisionResult.hasCollision) {
                const handleResult = handleBallCollision(ball, collisionResult, grid);
                
                if (handleResult.action === 'carved') {
                    results.squaresCarved++;
                    console.log('Ball carved square at', ball.x, ball.y);
                } else if (handleResult.action === 'destroyed') {
                    results.ballsDestroyed++;
                    console.log('Ball destroyed at', ball.x, ball.y);
                } else if (handleResult.action === 'bounce') {
                    results.ballsBounced++;
                    console.log('Ball bounced at', ball.x, ball.y);
                }
            }
        }
        
        return results;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { 
            balls: balls,
            grid: grid
        });
        return {
            ballsUpdated: 0,
            ballsDestroyed: 0,
            squaresCarved: 0,
            ballsBounced: 0
        };
    }
}

/**
 * Draw all balls on the canvas
 * @param {Array} balls - Array of balls to draw
 */
function drawBalls(balls) {
    try {
        if (!Array.isArray(balls)) {
            throw new Error('Balls must be an array');
        }
        
        for (const ball of balls) {
            if (ball.isActive) {
                fill(0); // Black balls
                noStroke();
                ellipse(ball.x, ball.y, ball.diameter, ball.diameter);
            }
        }
        
    } catch (error) {
        globalErrorHandler.handleError(error, { balls: balls });
    }
}

/**
 * Get active balls from an array
 * @param {Array} balls - Array of balls
 * @returns {Array} Array of active balls
 */
function getActiveBalls(balls) {
    try {
        if (!Array.isArray(balls)) {
            throw new Error('Balls must be an array');
        }
        
        return balls.filter(ball => ball.isActive);
        
    } catch (error) {
        globalErrorHandler.handleError(error, { balls: balls });
        return [];
    }
}

/**
 * Clean up inactive balls from an array
 * @param {Array} balls - Array of balls
 * @returns {Array} Array with inactive balls removed
 */
function cleanupInactiveBalls(balls) {
    try {
        if (!Array.isArray(balls)) {
            throw new Error('Balls must be an array');
        }
        
        return balls.filter(ball => ball.isActive);
        
    } catch (error) {
        globalErrorHandler.handleError(error, { balls: balls });
        return balls;
    }
}

// Make functions available globally for browser usage
if (typeof window !== 'undefined') {
    window.createBall = createBall;
    window.updateBallPosition = updateBallPosition;
    window.checkBallCollision = checkBallCollision;
    window.handleBallCollision = handleBallCollision;
    window.spawnNewBall = spawnNewBall;
    window.getEdgePositions = getEdgePositions;
    window.spawnInitialBalls = spawnInitialBalls;
    window.updateAllBalls = updateAllBalls;
    window.drawBalls = drawBalls;
    window.getActiveBalls = getActiveBalls;
    window.cleanupInactiveBalls = cleanupInactiveBalls;
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createBall,
        updateBallPosition,
        checkBallCollision,
        handleBallCollision,
        spawnNewBall,
        getEdgePositions,
        spawnInitialBalls,
        updateAllBalls,
        drawBalls,
        getActiveBalls,
        cleanupInactiveBalls
    };
}
