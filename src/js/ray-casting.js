/**
 * Ray Casting Module
 * Handles ray casting algorithms for ball targeting and bounce angle calculation
 */

// Define classes locally if not available globally
const BounceAngle = window.BounceAngle || class {
    constructor(angle, isOptimal, deviation, intersection) {
        this.angle = angle;
        this.isOptimal = isOptimal;
        this.deviation = deviation;
        this.intersection = intersection;
    }
};

const RayCast = window.RayCast || class {
    constructor(startX, startY, angle, maxDistance, intersections) {
        this.startX = startX;
        this.startY = startY;
        this.angle = angle;
        this.maxDistance = maxDistance;
        this.intersections = intersections;
    }
};

/**
 * Cast ray from point at angle to find intersections
 * @param {number} startX - Ray start X coordinate
 * @param {number} startY - Ray start Y coordinate
 * @param {number} angle - Ray angle in radians
 * @param {Grid} grid - Grid to cast against
 * @param {number} maxDistance - Maximum ray distance
 * @returns {RayCast} RayCast object with intersection data
 */
function castRay(startX, startY, angle, grid, maxDistance) {
    try {
        if (typeof startX !== 'number' || !isFinite(startX)) {
            throw new Error('Start X must be a finite number');
        }
        if (typeof startY !== 'number' || !isFinite(startY)) {
            throw new Error('Start Y must be a finite number');
        }
        if (typeof angle !== 'number' || !isFinite(angle)) {
            throw new Error('Angle must be a finite number');
        }
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        if (typeof maxDistance !== 'number' || maxDistance <= 0) {
            throw new Error('Max distance must be a positive number');
        }
        
        const intersections = [];
        
        // Calculate ray direction
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        
        // Step along the ray
        const stepSize = 1; // 1 pixel steps
        let distance = 0;
        
        while (distance < maxDistance) {
            const x = startX + dx * distance;
            const y = startY + dy * distance;
            
            // Get the square at this position
            const square = getSquareAtPixel(grid, x, y, 800, 600); // Assuming 800x600 canvas
            
            if (square) {
                // Found an intersection
                intersections.push({
                    x: x,
                    y: y,
                    distance: distance,
                    square: square
                });
                
                // If we hit a protected square, stop the ray
                if (square.state === 'BLACK_PROTECTED') {
                    break;
                }
            }
            
            distance += stepSize;
        }
        
        const rayCast = new RayCast(startX, startY, angle, maxDistance, intersections);
        return rayCast;
        
    } catch (error) {
        const handledError = globalErrorHandler.handleError(error, { 
            startX: startX,
            startY: startY,
            angle: angle,
            grid: grid,
            maxDistance: maxDistance
        });
        throw new RayCastError(handledError);
    }
}

/**
 * Find optimal bounce angle using ray casting
 * @param {Ball} ball - Ball that is bouncing
 * @param {Grid} grid - Current grid state
 * @param {number} deviationRange - Maximum deviation in degrees
 * @param {Object} collisionResult - Collision result with square and collision info
 * @returns {BounceAngle} BounceAngle object with calculated angle
 */
function findOptimalBounceAngle(ball, grid, deviationRange, collisionResult) {
    try {
        if (!(ball instanceof Ball)) {
            throw new Error('Ball must be a Ball object');
        }
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        if (typeof deviationRange !== 'number' || deviationRange <= 0) {
            throw new Error('Deviation range must be a positive number');
        }
        
        // Get current ball angle and calculate proper reflection
        const currentAngle = ball.getAngle();
        const currentVelocityX = Math.cos(currentAngle);
        const currentVelocityY = Math.sin(currentAngle);
        
        // Use the normal vector from the collision result
        let normalX = 0, normalY = 0;
        
        if (collisionResult && collisionResult.normal) {
            // Use the pre-calculated normal vector from collision detection
            normalX = collisionResult.normal.x;
            normalY = collisionResult.normal.y;
        } else {
            // Fallback: determine normal based on which component of velocity is larger
            if (Math.abs(currentVelocityX) > Math.abs(currentVelocityY)) {
                // Moving more horizontally - assume hitting vertical surface
                normalX = currentVelocityX > 0 ? -1 : 1; // Opposite to movement direction
            } else {
                // Moving more vertically - assume hitting horizontal surface  
                normalY = currentVelocityY > 0 ? -1 : 1; // Opposite to movement direction
            }
        }
        
        // Calculate reflection: v' = v - 2(v·n)n
        const dotProduct = currentVelocityX * normalX + currentVelocityY * normalY;
        const reflectedVelocityX = currentVelocityX - 2 * dotProduct * normalX;
        const reflectedVelocityY = currentVelocityY - 2 * dotProduct * normalY;
        
        // Convert back to angle
        const perfectReflection = Math.atan2(reflectedVelocityY, reflectedVelocityX);
        
        // Convert deviation range to radians
        const deviationRadians = (deviationRange * Math.PI) / 180;
        
        // Start from 0 deviation (perfect reflection) and work outward
        // This ensures more natural reflections are chosen first
        for (let deviation = 0; deviation <= deviationRadians; deviation += Math.PI / 180) { // 1 degree steps
            // Try both positive and negative deviations
            const angles = [
                perfectReflection + deviation,  // Positive deviation
                perfectReflection - deviation   // Negative deviation
            ];
            
            for (const testAngle of angles) {
                // Cast ray at this angle to see what it hits
                const rayResult = castRay(ball.x, ball.y, testAngle, grid, 100);
                
                // Check if this ray hits a carveable square
                if (rayResult.intersections && rayResult.intersections.length > 0) {
                    for (const intersection of rayResult.intersections) {
                        if (intersection.square && intersection.square.state === 'BLACK_CARVEABLE') {
                            // Found a good angle that hits a carveable square
                            const deviationDegrees = (deviation * 180) / Math.PI;
                            return new BounceAngle(testAngle, true, deviationDegrees, intersection);
                        }
                    }
                }
            }
        }
        
        // If no optimal angle found, use random within deviation range
        const randomDeviation = (Math.random() - 0.5) * 2 * deviationRange;
        const randomAngle = perfectReflection + (randomDeviation * Math.PI / 180);
        
        return new BounceAngle(randomAngle, false, randomDeviation, null);
        
    } catch (error) {
        const handledError = globalErrorHandler.handleError(error, { 
            ball: ball,
            grid: grid,
            deviationRange: deviationRange
        });
        throw new RayCastError(handledError);
    }
}

// Make functions available globally for browser usage
if (typeof window !== 'undefined') {
    window.castRay = castRay;
    window.findOptimalBounceAngle = findOptimalBounceAngle;
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        castRay,
        findOptimalBounceAngle
    };
}
