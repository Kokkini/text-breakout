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
 * Update ball position with sub-stepping to prevent tunneling
 * @param {Ball} ball - Ball to update
 * @param {Grid} grid - Grid for collision detection
 * @param {Object} gridRenderingParams - Grid rendering parameters
 * @returns {Object} Collision result if any collision occurred
 */
function updateBallPositionWithSubstepping(ball, grid, gridRenderingParams) {
    try {
        if (!(ball instanceof Ball)) {
            throw new Error('Ball must be a Ball object');
        }
        let eps = 1e-6;
        
        // Store original position
        const originalX = ball.x;
        const originalY = ball.y;
        
        // Calculate movement distance
        const movementDistance = Math.sqrt(ball.velocityX * ball.velocityX + ball.velocityY * ball.velocityY);
        
        // Determine safe movement threshold in grid units (half square)
        let maxSafeDistance = 0.5;
        // console.log('Max safe distance: ', maxSafeDistance, 'Movement distance: ', movementDistance);
        // If movement is small enough, use simple update
        if (movementDistance <= maxSafeDistance) {
            ball.updatePosition();
            
            // Check bounds in grid units and deactivate if out of bounds
            if (ball.x < 0 || ball.x > grid.width || ball.y < 0 || ball.y > grid.height) {
                ball.isActive = false;
            }
            
            // return { hasCollision: false };
            let collisionResult = checkBallCollision(ball, grid, gridRenderingParams);
            if (collisionResult.hasCollision) {
                // Update ball position to the collision point
                ball.x = collisionResult.collisionPoint.x + collisionResult.normal.x * eps;
                ball.y = collisionResult.collisionPoint.y + collisionResult.normal.y * eps;
                return collisionResult;
            }
            return { hasCollision: false };
        }

        // console.log('Movement is too large, using sub-stepping');
        
        // Movement is too large, use sub-stepping
        const numSteps = Math.ceil(movementDistance / maxSafeDistance);
        const stepVelocityX = ball.velocityX / numSteps;
        const stepVelocityY = ball.velocityY / numSteps;
        
        // Store original velocity
        const originalVelocityX = ball.velocityX;
        const originalVelocityY = ball.velocityY;
        
        // Temporarily set step velocity
        ball.velocityX = stepVelocityX;
        ball.velocityY = stepVelocityY;
        
        let collisionResult = { hasCollision: false };
        
        // Perform sub-steps
        for (let step = 0; step < numSteps; step++) {
            // Update position for this step
            ball.updatePosition();
            
            // Check bounds in grid units
            if (ball.x < 0 || ball.x > grid.width || ball.y < 0 || ball.y > grid.height) {
                ball.isActive = false;
                break;
            }
            
            // Check for collision at this step
                const stepCollision = checkBallCollision(ball, grid, gridRenderingParams);
            if (stepCollision.hasCollision) {
                collisionResult = stepCollision;
                break; // Stop at first collision
            }
        }
        
        // Restore original velocity
        ball.velocityX = originalVelocityX;
        ball.velocityY = originalVelocityY;
        if (collisionResult.hasCollision) {
            // Update ball position to the collision point
            ball.x = collisionResult.collisionPoint.x + collisionResult.normal.x * eps;
            ball.y = collisionResult.collisionPoint.y + collisionResult.normal.y * eps;
        }
        
        return collisionResult;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { ball: ball });
        ball.isActive = false; // Deactivate ball on error
        return { hasCollision: false };
    }
}

/**
 * Update ball position with sub-stepping and pre-collision checking
 * This function checks for collisions BEFORE updating ball position
 * @param {Ball} ball - Ball to update
 * @param {Grid} grid - Grid for collision detection
 * @param {Object} gridRenderingParams - Grid rendering parameters
 * @returns {Object} Collision result if any collision occurred
 */
function updateBallPositionWithSubsteppingAndPreCollisionCheck(ball, grid, gridRenderingParams) {
    try {
        if (!(ball instanceof Ball)) {
            throw new Error('Ball must be a Ball object');
        }
        let eps = 1e-6;
        
        // Store original position
        const originalX = ball.x;
        const originalY = ball.y;
        
        // Calculate movement distance
        const movementDistance = Math.sqrt(ball.velocityX * ball.velocityX + ball.velocityY * ball.velocityY);
        
        // Determine safe movement threshold in grid units (half square)
        let maxSafeDistance = 0.5;
        
        // Helper function to check if a square is collide-able
        function isCollideable(square) {
            if (!square) return false;
            return square.state === SquareState.BLACK_CARVEABLE || 
                   square.state === SquareState.BLACK_PROTECTED ||
                   (square.state === SquareState.WHITE_EDGE && 
                    (square.x === 0 || square.x === grid.width - 1 || 
                     square.y === 0 || square.y === grid.height - 1));
        }
        
        // Helper function to get 8 adjacent squares
        function getAdjacentSquares(currentX, currentY) {
            return [
                getSquareAtGrid(grid, currentX, currentY - 1), // Up
                getSquareAtGrid(grid, currentX, currentY + 1), // Down
                getSquareAtGrid(grid, currentX - 1, currentY), // Left
                getSquareAtGrid(grid, currentX + 1, currentY), // Right
                getSquareAtGrid(grid, currentX - 1, currentY - 1), // Up-Left
                getSquareAtGrid(grid, currentX - 1, currentY + 1), // Down-Left
                getSquareAtGrid(grid, currentX + 1, currentY - 1), // Up-Right
                getSquareAtGrid(grid, currentX + 1, currentY + 1) // Down-Right
            ];
        }
        
        // If movement is small enough, use simple pre-collision check
        if (movementDistance <= maxSafeDistance) {
            // Calculate next position
            const nextX = ball.x + ball.velocityX;
            const nextY = ball.y + ball.velocityY;
            
            // Check bounds first
            if (nextX < 0 || nextX > width || nextY < 0 || nextY > height) {
                ball.isActive = false;
                return { hasCollision: false };
            }
            
            // Get current square and next square
            const currentSquare = getSquareAtGrid(grid, ball.x, ball.y);
            const nextSquare = getSquareAtGrid(grid, nextX, nextY);
            
            // If next position would be in a collide-able square, check for collision
            if (isCollideable(nextSquare)) {
                // Get adjacent squares to current position
                const adjacentSquares = getAdjacentSquares(ball.x, ball.y);
                
                // Check ray intersection with each collide-able adjacent square
                for (const adjacentSquare of adjacentSquares) {
                    if (isCollideable(adjacentSquare)) {
                        // Calculate square boundaries
                        const squareLeft = adjacentSquare.x;
                        const squareRight = adjacentSquare.x + 1;
                        const squareTop = adjacentSquare.y;
                        const squareBottom = adjacentSquare.y + 1;
                        
                        // Cast ray from current position to next position
                        const intersection = findRaySquareIntersection(
                            ball.x, ball.y,    // Ray start (current position)
                            nextX, nextY,      // Ray end (next position)
                            squareLeft, squareTop, squareRight, squareBottom
                        );
                        
                        if (intersection) {
                            // Calculate normal vector based on intersection side
                            let normalX = 0, normalY = 0;
                            switch (intersection.side) {
                                case 'left':
                                    normalX = -1;
                                    break;
                                case 'right':
                                    normalX = 1;
                                    break;
                                case 'top':
                                    normalY = -1;
                                    break;
                                case 'bottom':
                                    normalY = 1;
                                    break;
                                case 'corner':
                                    // Corner collision - calculate diagonal normal
                                    const cornerX = intersection.x - (squareLeft + squareRight) / 2;
                                    const cornerY = intersection.y - (squareTop + squareBottom) / 2;
                                    const length = Math.sqrt(cornerX * cornerX + cornerY * cornerY);
                                    normalX = cornerX / length;
                                    normalY = cornerY / length;
                                    break;
                            }
                            
                            // Update ball position to collision point + epsilon
                            ball.x = intersection.x + normalX * eps;
                            ball.y = intersection.y + normalY * eps;
                            
                            // Return collision result
                            return {
                                hasCollision: true,
                                square: adjacentSquare,
                                isEdge: adjacentSquare.state === SquareState.WHITE_EDGE,
                                collisionPoint: { x: intersection.x, y: intersection.y },
                                normal: { x: normalX, y: normalY },
                                shouldCarve: adjacentSquare.state === SquareState.BLACK_CARVEABLE,
                                shouldBounce: adjacentSquare.state === SquareState.BLACK_PROTECTED || 
                                            adjacentSquare.state === SquareState.WHITE_EDGE
                            };
                        }
                    }
                }
            }
            
            // No collision detected, update position normally
            ball.updatePosition();
            return { hasCollision: false };
        }
        
        // Movement is too large, use sub-stepping with pre-collision check
        const numSteps = Math.ceil(movementDistance / maxSafeDistance);
        const stepVelocityX = ball.velocityX / numSteps;
        const stepVelocityY = ball.velocityY / numSteps;
        
        // Store original velocity
        const originalVelocityX = ball.velocityX;
        const originalVelocityY = ball.velocityY;
        
        // Temporarily set step velocity
        ball.velocityX = stepVelocityX;
        ball.velocityY = stepVelocityY;
        
        let collisionResult = { hasCollision: false };
        
        // Perform sub-steps with pre-collision checking
        for (let step = 0; step < numSteps; step++) {
            // Calculate next position for this step
            const nextX = ball.x + stepVelocityX;
            const nextY = ball.y + stepVelocityY;
            
            // Check bounds
            if (nextX < 0 || nextX > width || nextY < 0 || nextY > height) {
                ball.isActive = false;
                break;
            }
            
            // Get current square and next square
            const currentSquare = getSquareAtGrid(grid, ball.x, ball.y);
            const nextSquare = getSquareAtGrid(grid, nextX, nextY);
            
            // If next position would be in a collide-able square, check for collision
            if (isCollideable(nextSquare)) {
                // Get adjacent squares to current position
                const adjacentSquares = getAdjacentSquares(ball.x, ball.y);
                
                // Check ray intersection with each collide-able adjacent square
                for (const adjacentSquare of adjacentSquares) {
                    if (isCollideable(adjacentSquare)) {
                        // Calculate square boundaries
                        const squareLeft = adjacentSquare.x;
                        const squareRight = adjacentSquare.x + 1;
                        const squareTop = adjacentSquare.y;
                        const squareBottom = adjacentSquare.y + 1;
                        
                        // Cast ray from current position to next position
                        const intersection = findRaySquareIntersection(
                            ball.x, ball.y,    // Ray start (current position)
                            nextX, nextY,      // Ray end (next position)
                            squareLeft, squareTop, squareRight, squareBottom
                        );
                        
                        if (intersection) {
                            // Calculate normal vector based on intersection side
                            let normalX = 0, normalY = 0;
                            switch (intersection.side) {
                                case 'left':
                                    normalX = -1;
                                    break;
                                case 'right':
                                    normalX = 1;
                                    break;
                                case 'top':
                                    normalY = -1;
                                    break;
                                case 'bottom':
                                    normalY = 1;
                                    break;
                                case 'corner':
                                    // Corner collision - calculate diagonal normal
                                    const cornerX = intersection.x - (squareLeft + squareRight) / 2;
                                    const cornerY = intersection.y - (squareTop + squareBottom) / 2;
                                    const length = Math.sqrt(cornerX * cornerX + cornerY * cornerY);
                                    normalX = cornerX / length;
                                    normalY = cornerY / length;
                                    break;
                            }
                            
                            // Update ball position to collision point + epsilon
                            ball.x = intersection.x + normalX * eps;
                            ball.y = intersection.y + normalY * eps;
                            
                            // Set collision result
                            collisionResult = {
                                hasCollision: true,
                                square: adjacentSquare,
                                isEdge: adjacentSquare.state === SquareState.WHITE_EDGE,
                                collisionPoint: { x: intersection.x, y: intersection.y },
                                normal: { x: normalX, y: normalY },
                                shouldCarve: adjacentSquare.state === SquareState.BLACK_CARVEABLE,
                                shouldBounce: adjacentSquare.state === SquareState.BLACK_PROTECTED || 
                                            adjacentSquare.state === SquareState.WHITE_EDGE
                            };
                            
                            // Restore original velocity and return
                            ball.velocityX = originalVelocityX;
                            ball.velocityY = originalVelocityY;
                            return collisionResult;
                        }
                    }
                }
            }
            
            // No collision detected for this step, update position
            ball.updatePosition();
        }
        
        // Restore original velocity
        ball.velocityX = originalVelocityX;
        ball.velocityY = originalVelocityY;
        
        return collisionResult;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { ball: ball });
        ball.isActive = false; // Deactivate ball on error
        return { hasCollision: false };
    }
}

/**
 * Update ball position based on velocity (legacy function for compatibility)
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
 * Find intersection point between a ray and a square
 * @param {number} rayStartX - Ray start X coordinate
 * @param {number} rayStartY - Ray start Y coordinate
 * @param {number} rayEndX - Ray end X coordinate
 * @param {number} rayEndY - Ray end Y coordinate
 * @param {number} squareLeft - Square left boundary
 * @param {number} squareTop - Square top boundary
 * @param {number} squareRight - Square right boundary
 * @param {number} squareBottom - Square bottom boundary
 * @returns {Object|null} Intersection point with side information or null
 */
function findRaySquareIntersection(rayStartX, rayStartY, rayEndX, rayEndY, squareLeft, squareTop, squareRight, squareBottom) {
    const dx = rayEndX - rayStartX;
    const dy = rayEndY - rayStartY;
  
    const sides = [
      { side: 'left',   x: squareLeft,  y: null, t: null },
      { side: 'right',  x: squareRight, y: null, t: null },
      { side: 'top',    y: squareTop,   x: null, t: null },
      { side: 'bottom', y: squareBottom,x: null, t: null },
    ];
  
    let intersections = [];
  
    for (let s of sides) {
      let t, u, x, y;
      if (s.side === 'left' || s.side === 'right') {
        if (dx === 0) continue;
        t = (s.x - rayStartX) / dx;
        if (t < 0) continue;
        y = rayStartY + dy * t;
        if (y >= squareTop && y <= squareBottom)
          intersections.push({ x: s.x, y, side: s.side, t });
      } else {
        if (dy === 0) continue;
        t = (s.y - rayStartY) / dy;
        if (t < 0) continue;
        x = rayStartX + dx * t;
        if (x >= squareLeft && x <= squareRight)
          intersections.push({ x, y: s.y, side: s.side, t });
      }
    }
  
    if (intersections.length === 0) return null;
    intersections.sort((a, b) => a.t - b.t);
    const i = intersections[0];
    return { x: i.x, y: i.y, side: i.side };
  }
  

/**
 * Calculate the normal vector and collision point for a collision using ray casting
 * @param {Ball} ball - Ball that collided
 * @param {Square} square - Square that was hit
 * @param {Grid} grid - Grid for edge detection
 * @param {Object} gridRenderingParams - Grid rendering parameters
 * @returns {Object} Object with normal vector {x, y} and collision point {x, y}
 */
function calculateCollisionNormal(ball, square, grid, gridRenderingParams) {
    let normalX = 0, normalY = 0;
    let collisionPoint = { x: ball.x, y: ball.y }; // Default fallback
    // Operate entirely in grid units
    
    // Check if this is an edge collision
    const isAtGridBoundary = (square.x === 0 || square.x === grid.width - 1 || 
                            square.y === 0 || square.y === grid.height - 1);
    
    if (isAtGridBoundary) {
        // Edge collision - determine normal based on which edge was hit
        if (square.x === 0) {
            // Hit left edge of the grid, right edge of the square
            normalX = 1;
            collisionPoint = { x: 1, y: ball.y };
        } else if (square.x === grid.width - 1) {
            // Hit right edge of the grid, left edge of the square
            normalX = -1;
            collisionPoint = { x: square.x, y: ball.y };
        } else if (square.y === 0) {
            // Hit top edge of the grid, bottom edge of the square
            normalY = 1;
            collisionPoint = { x: ball.x, y: 1 };
        } else if (square.y === grid.height - 1) {
            // Hit bottom edge of the grid, top edge of the square
            normalY = -1;
            collisionPoint = { x: ball.x, y: square.y };
        }
    } else {
        // Square collision - use ray casting to find the actual collision point
        
        // Square boundaries in grid units
        const squareLeft = square.x;
        const squareRight = square.x + 1;
        const squareTop = square.y;
        const squareBottom = square.y + 1;
        
        // Calculate ball's previous position (before collision)
        const prevX = ball.x - ball.velocityX;
        const prevY = ball.y - ball.velocityY;
        
        // Use ray casting to find intersection with square boundaries for the square and the 4 adjacent squares
        let squares = [square];
        if (square.x > 0) {
            let s = grid.getSquare(square.x - 1, square.y);
            squares.push(s);
        }
        if (square.x < grid.width - 1) {
            let s = grid.getSquare(square.x + 1, square.y);
            squares.push(s);
        }
        if (square.y > 0) {
            let s = grid.getSquare(square.x, square.y - 1);
            squares.push(s);
        }
        if (square.y < grid.height - 1) {
            let s = grid.getSquare(square.x, square.y + 1);
            squares.push(s);
        }
        let intersections = [];
        for (let s of squares) {
            if (s.state === SquareState.WHITE_CARVED) {
                continue;
            }
            const sLeft = s.x;
            const sRight = s.x + 1;
            const sTop = s.y;
            const sBottom = s.y + 1;

            let sIntersection = findRaySquareIntersection(
                prevX, prevY, ball.x, ball.y,
                sLeft, sTop, sRight, sBottom
            );
            if (sIntersection) {
                intersections.push(sIntersection);
            }
        }
        // get the intersection with the lowest t value
        const intersection = intersections.reduce((closest, current) => 
            current.t < closest.t ? current : closest
        );
        // const intersection = findRaySquareIntersection(
        //     prevX, prevY, ball.x, ball.y,
        //     squareLeft, squareTop, squareRight, squareBottom
        // );
        
        if (intersection) {
            // Use the precise intersection point as collision point
            collisionPoint = { x: intersection.x, y: intersection.y };
            
            // Determine which side was hit based on the intersection point
            const { side } = intersection;
            
            switch (side) {
                case 'left':
                    normalX = -1; // Normal points left
                    break;
                case 'right':
                    normalX = 1;  // Normal points right
                    break;
                case 'top':
                    normalY = -1; // Normal points up
                    break;
                case 'bottom':
                    normalY = 1;  // Normal points down
                    break;
                case 'corner':
                    // Corner collision - calculate diagonal normal
                    const cornerX = intersection.x - (squareLeft + squareRight) / 2;
                    const cornerY = intersection.y - (squareTop + squareBottom) / 2;
                    const length = Math.sqrt(cornerX * cornerX + cornerY * cornerY);
                    normalX = cornerX / length;
                    normalY = cornerY / length;
                    break;
            }
        } else {
            // Fallback: use ball position relative to square center
            console.log('Fallback to ball position relative to square center');
            const ballGridX = ball.x;
            const ballGridY = ball.y;
            const squareCenterX = square.x + 0.5;
            const squareCenterY = square.y + 0.5;
            
            const deltaX = ballGridX - squareCenterX;
            const deltaY = ballGridY - squareCenterY;
            
            const epsilon = 0.0;
            if (Math.abs(deltaX) > Math.abs(deltaY) + epsilon) {
                normalX = deltaX > 0 ? 1 : -1;
            } else if (Math.abs(deltaY) > Math.abs(deltaX) + epsilon) {
                normalY = deltaY > 0 ? 1 : -1;
            } else {
                // Corner fallback
                normalX = deltaX > 0 ? Math.sqrt(1/2) : -Math.sqrt(1/2);
                normalY = deltaY > 0 ? Math.sqrt(1/2) : -Math.sqrt(1/2);
            }
        }
    }
    
    return { 
        normal: { x: normalX, y: normalY }, 
        collisionPoint: collisionPoint 
    };
}

/**
 * Check if ball collides with grid elements
 * @param {Ball} ball - Ball to check
 * @param {Grid} grid - Grid to check against
 * @returns {Object} CollisionResult object with collision information
 */
function checkBallCollision(ball, grid, gridRenderingParams) {
    try {
        if (!(ball instanceof Ball)) {
            throw new Error('Ball must be a Ball object');
        }
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        
        // Get the square the ball is currently in
        const square = getSquareAtGrid(grid, ball.x, ball.y);
        
        if (!square) {
            return { hasCollision: false };
        }
        
        // Calculate normal vector and collision point for collision
        const collisionData = calculateCollisionNormal(ball, square, grid, gridRenderingParams);
        const normal = collisionData.normal;
        const collisionPoint = collisionData.collisionPoint;
        
        // Check collision based on square state
        if (square.state === SquareState.BLACK_CARVEABLE) {
            return {
                hasCollision: true,
                square: square,
                isEdge: false,
                collisionPoint: collisionPoint,
                normal: normal,
                shouldCarve: true
            };
        } else if (square.state === SquareState.BLACK_PROTECTED) {
            return {
                hasCollision: true,
                square: square,
                isEdge: false,
                collisionPoint: collisionPoint,
                normal: normal,
                shouldBounce: true
            };
        } else if (square.state === SquareState.WHITE_EDGE) {
            // Only bounce off actual grid edges, not all white edge squares
            const isAtGridBoundary = (square.x === 0 || square.x === grid.width - 1 || 
                                    square.y === 0 || square.y === grid.height - 1);
            
            if (isAtGridBoundary) {
                return {
                    hasCollision: true,
                    square: square,
                    isEdge: true,
                    collisionPoint: collisionPoint,
                    normal: normal,
                    shouldBounce: true
                };
            } else {
                // White edge square that's not at boundary - no collision
                return { hasCollision: false };
            }
        } else if (square.state === SquareState.WHITE_CARVED) {
            // White carved squares - no collision, balls pass through
            return { hasCollision: false };
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
function handleBallCollision(ball, collisionResult, grid, gridRenderingParams, animationParameters) {
    try {
        if (!collisionResult.hasCollision) {
            return { success: true, action: 'none' };
        }
        
        const { square, shouldCarve, shouldDestroy, shouldBounce } = collisionResult;
        
        if (shouldCarve) {
            // Carve the square (turn black to white) and bounce
            updateSquareState(grid, square.x, square.y, SquareState.WHITE_CARVED);
            bounceBallOffSquareSmart(ball, collisionResult, grid, gridRenderingParams, animationParameters);
            return { success: true, action: 'carved', square: square };
            
        } else if (shouldBounce) {
            // Bounce the ball - use appropriate bounce function based on collision type
            if (collisionResult.isEdge) {
                bounceBallOffEdgeSmart(ball, collisionResult, grid, gridRenderingParams, animationParameters);
            } else {
                bounceBallOffSquareSmart(ball, collisionResult, grid, gridRenderingParams, animationParameters);
            }
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
function bounceBallOffEdgeSmart(ball, collisionResult, grid, gridRenderingParams, animationParameters) {
    try {
        if (!ball || !collisionResult || !grid) {
            return;
        }
        
        // Get deviation angle from animation parameters
        const deviationAngle = animationParameters ? animationParameters.deviationAngle : 15;
        
        // Use smart ray casting to find optimal bounce angle
        if (typeof findOptimalBounceAngle === 'function') {
            const bounceResult = findOptimalBounceAngle(ball, grid, deviationAngle, collisionResult, gridRenderingParams);
            
            if (bounceResult && bounceResult.isOptimal) {
                // Use the optimal angle found by ray casting
                const speed = ball.getSpeed();
                ball.setVelocityFromAngle(bounceResult.angle, speed);
                return;
            }
        }
        
        // Fallback to simple edge reflection if ray casting fails
        bounceBallOffEdge(ball, collisionResult, grid);
        
    } catch (error) {
        globalErrorHandler.handleError(error, { ball: ball, collisionResult: collisionResult, grid: grid });
        // Fallback to simple bounce
        bounceBallOffEdge(ball, collisionResult, grid);
    }
}

/**
 * Bounce ball off edge with reflection
 * @param {Ball} ball - Ball to bounce
 * @param {Object} collisionResult - Collision result with collision point
 * @param {Grid} grid - Grid object for dimensions
 */
function bounceBallOffEdge(ball, collisionResult, grid) {
    try {
        if (!ball || !collisionResult || !grid) {
            return;
        }
        
        const { collisionPoint, square, normal } = collisionResult;
        
        // Use the pre-calculated normal vector from collision detection
        let normalX = 0, normalY = 0;
        
        if (normal) {
            normalX = normal.x;
            normalY = normal.y;
        } else {
            // Fallback: determine based on ball position relative to collision point
            if (Math.abs(ball.x - collisionPoint.x) > Math.abs(ball.y - collisionPoint.y)) {
                // Hit left or right edge
                normalX = ball.x > collisionPoint.x ? -1 : 1;
            } else {
                // Hit top or bottom edge
                normalY = ball.y > collisionPoint.y ? -1 : 1;
            }
        }
        
        // Calculate reflection: v' = v - 2(v·n)n
        const dotProduct = ball.velocityX * normalX + ball.velocityY * normalY;
        ball.velocityX = ball.velocityX - 2 * dotProduct * normalX;
        ball.velocityY = ball.velocityY - 2 * dotProduct * normalY;
        
        // Add some randomness to prevent balls from getting stuck in patterns
        const randomFactor = 0.1;
        ball.velocityX += (Math.random() - 0.5) * randomFactor;
        ball.velocityY += (Math.random() - 0.5) * randomFactor;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { ball: ball, collisionResult: collisionResult, grid: grid });
    }
}

/**
 * Bounce ball off square with smart ray casting
 * @param {Ball} ball - Ball to bounce
 * @param {Object} collisionResult - Collision result with collision point
 * @param {Grid} grid - Grid object for ray casting
 */
function bounceBallOffSquareSmart(ball, collisionResult, grid, gridRenderingParams, animationParameters) {
    try {
        if (!ball || !collisionResult || !grid) {
            return;
        }
        
        // Get deviation angle from animation parameters
        const deviationAngle = animationParameters ? animationParameters.deviationAngle : 15;
        
        // Use smart ray casting to find optimal bounce angle
        if (typeof findOptimalBounceAngle === 'function') {
            const bounceResult = findOptimalBounceAngle(ball, grid, deviationAngle, collisionResult, gridRenderingParams);
            
            if (bounceResult && bounceResult.isOptimal) {
                // Use the optimal angle found by ray casting
                const speed = ball.getSpeed();
                ball.setVelocityFromAngle(bounceResult.angle, speed);
                return;
            }
        }
        
        // Fallback to simple square reflection if ray casting fails
        bounceBallOffSquare(ball, collisionResult);
        
    } catch (error) {
        globalErrorHandler.handleError(error, { ball: ball, collisionResult: collisionResult, grid: grid });
        // Fallback to simple bounce
        bounceBallOffSquare(ball, collisionResult);
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
        
        const { collisionPoint, square, normal } = collisionResult;
        
        // Use the pre-calculated normal vector from collision detection
        let normalX = 0, normalY = 0;
        
        if (normal) {
            normalX = normal.x;
            normalY = normal.y;
        } else {
            // Fallback: determine which side of the square was hit based on ball position relative to square center
            const squareCenterX = square.x + 0.5; // Assuming square is 1x1 unit
            const squareCenterY = square.y + 0.5;
            
            const deltaX = ball.x - squareCenterX;
            const deltaY = ball.y - squareCenterY;
            
            // Determine which side was hit based on the larger delta
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Hit left or right side
                normalX = deltaX > 0 ? 1 : -1; // Right side: normal points right, Left side: normal points left
            } else {
                // Hit top or bottom side
                normalY = deltaY > 0 ? 1 : -1; // Bottom side: normal points down, Top side: normal points up
            }
        }
        
        // Calculate reflection: v' = v - 2(v·n)n
        const dotProduct = ball.velocityX * normalX + ball.velocityY * normalY;
        ball.velocityX = ball.velocityX - 2 * dotProduct * normalX;
        ball.velocityY = ball.velocityY - 2 * dotProduct * normalY;
        
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
function spawnNewBall(grid, parameters, gridRenderingParams) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        if (!(parameters instanceof AnimationParameters)) {
            throw new Error('Parameters must be an AnimationParameters object');
        }
        
        // Calculate ball diameter in grid units (half of a square)
        const ballDiameter = 0.5;
        
        // Find a random edge position
        const edgePositions = getEdgePositions(grid);
        if (edgePositions.length === 0) {
            return null;
        }
        
        const randomEdge = edgePositions[Math.floor(Math.random() * edgePositions.length)];
        
        // Position ball at center of edge square (grid units)
        const ballX = randomEdge.x + 0.5;
        const ballY = randomEdge.y + 0.5;
        
        // Random initial velocity
        // Speed in grid units per frame
        const speed = 0.5 * parameters.movementSpeed;
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
function spawnInitialBalls(grid, parameters, gridRenderingParams) {
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
            const ball = spawnNewBall(grid, parameters, gridRenderingParams);
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
function updateAllBalls(balls, grid, gridRenderingParams, animationParameters) {
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
            
            // Update ball position with sub-stepping collision detection
            // const collisionResult = updateBallPositionWithSubstepping(ball, grid, gridRenderingParams);
            const collisionResult = updateBallPositionWithSubsteppingAndPreCollisionCheck(ball, grid, gridRenderingParams);
            results.ballsUpdated++;
            
            // Handle collision if one occurred during sub-stepping
            if (collisionResult.hasCollision) {
                const handleResult = handleBallCollision(ball, collisionResult, grid, gridRenderingParams, animationParameters);
                
                if (handleResult.action === 'carved') {
                    results.squaresCarved++;
                } else if (handleResult.action === 'destroyed') {
                    results.ballsDestroyed++;
                } else if (handleResult.action === 'bounce') {
                    results.ballsBounced++;
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
                // Convert grid coordinates to pixel coordinates for rendering
                let pixelX = ball.x;
                let pixelY = ball.y;
                let pixelDiameter = ball.diameter;
                if (typeof window !== 'undefined' && window.gridRenderingParams) {
                    const params = window.gridRenderingParams;
                    const { squareSize, offsetX, offsetY } = params;
                    pixelX = offsetX + ball.x * squareSize;
                    pixelY = offsetY + ball.y * squareSize;
                    pixelDiameter = ball.diameter * squareSize;
                }
                fill(0);
                noStroke();
                ellipse(pixelX, pixelY, pixelDiameter, pixelDiameter);
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
    window.calculateCollisionNormal = calculateCollisionNormal;
    window.findRaySquareIntersection = findRaySquareIntersection;
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
        cleanupInactiveBalls,
        calculateCollisionNormal,
        findRaySquareIntersection
    };
}
