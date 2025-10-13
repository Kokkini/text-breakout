/**
 * Data Models for Ball Create Text Animation
 * Core data structures and enums from the data model specification
 */

// Enums
const SquareState = {
    BLACK_CARVEABLE: 'BLACK_CARVEABLE',
    BLACK_PROTECTED: 'BLACK_PROTECTED', 
    WHITE_CARVED: 'WHITE_CARVED',
    WHITE_EDGE: 'WHITE_EDGE'
};

const SquareType = {
    CARVEABLE: 'CARVEABLE',
    PROTECTED: 'PROTECTED',
    EDGE: 'EDGE'
};

/**
 * GrayscaleImage - Original text image with black text on white background
 */
class GrayscaleImage {
    constructor(width, height, pixels, text) {
        this.width = width;
        this.height = height;
        this.pixels = pixels; // Uint8Array of grayscale values (0-255)
        this.text = text;
        
        this.validate();
    }
    
    validate() {
        if (!Number.isInteger(this.width) || this.width <= 0) {
            throw new Error('Width must be a positive integer');
        }
        if (!Number.isInteger(this.height) || this.height <= 0) {
            throw new Error('Height must be a positive integer');
        }
        if (!(this.pixels instanceof Uint8Array)) {
            throw new Error('Pixels must be a Uint8Array');
        }
        if (this.pixels.length !== this.width * this.height) {
            throw new Error('Pixels array length must equal width * height');
        }
        if (typeof this.text !== 'string') {
            throw new Error('Text must be a string');
        }
    }
}

/**
 * BlackWhiteImage - Converted binary image used to determine grid square types
 */
class BlackWhiteImage {
    constructor(width, height, pixels) {
        this.width = width;
        this.height = height;
        this.pixels = pixels; // boolean[] where true = black/protected, false = white/carveable
        
        this.validate();
    }
    
    validate() {
        if (!Number.isInteger(this.width) || this.width <= 0) {
            throw new Error('Width must be a positive integer');
        }
        if (!Number.isInteger(this.height) || this.height <= 0) {
            throw new Error('Height must be a positive integer');
        }
        if (!Array.isArray(this.pixels)) {
            throw new Error('Pixels must be an array');
        }
        if (this.pixels.length !== this.width * this.height) {
            throw new Error('Pixels array length must equal width * height');
        }
        if (!this.pixels.every(pixel => typeof pixel === 'boolean')) {
            throw new Error('All pixel values must be boolean');
        }
    }
}

/**
 * Square - Individual grid cell that can be black (carveable), black (protected), or white (carved/edge)
 */
class Square {
    constructor(x, y, state, type, color = null) {
        this.x = x;
        this.y = y;
        this.state = state;
        this.type = type;
        this.color = color; // Custom color for rendering (null = use default state color)
        
        this.validate();
    }
    
    validate() {
        if (!Number.isInteger(this.x) || this.x < 0) {
            throw new Error('X coordinate must be a non-negative integer');
        }
        if (!Number.isInteger(this.y) || this.y < 0) {
            throw new Error('Y coordinate must be a non-negative integer');
        }
        if (!Object.values(SquareState).includes(this.state)) {
            throw new Error('Invalid square state');
        }
        if (!Object.values(SquareType).includes(this.type)) {
            throw new Error('Invalid square type');
        }
        if (this.color !== null && typeof this.color !== 'string') {
            throw new Error('Color must be null or a string');
        }
    }
    
    isCarveable() {
        return this.state === SquareState.BLACK_CARVEABLE;
    }
    
    isProtected() {
        return this.state === SquareState.BLACK_PROTECTED;
    }
    
    isWhite() {
        return this.state === SquareState.WHITE_CARVED || this.state === SquareState.WHITE_EDGE;
    }
    
    canBeCarved() {
        return this.state === SquareState.BLACK_CARVEABLE;
    }
}

/**
 * Grid - 2D array of squares representing the converted image resolution with padding
 */
class Grid {
    constructor(width, height, squares, padding) {
        this.width = width;
        this.height = height;
        this.squares = squares; // Square[][]
        this.padding = padding;
        
        this.validate();
    }
    
    validate() {
        if (!Number.isInteger(this.width) || this.width <= 0) {
            throw new Error('Width must be a positive integer');
        }
        if (!Number.isInteger(this.height) || this.height <= 0) {
            throw new Error('Height must be a positive integer');
        }
        if (!Array.isArray(this.squares)) {
            throw new Error('Squares must be an array');
        }
        if (this.squares.length !== this.height) {
            throw new Error('Squares array height must match grid height');
        }
        if (!this.squares.every(row => Array.isArray(row) && row.length === this.width)) {
            throw new Error('All square rows must have length equal to grid width');
        }
        if (!Number.isInteger(this.padding) || this.padding < 0) {
            throw new Error('Padding must be a non-negative integer');
        }
    }
    
    getSquare(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return this.squares[y][x];
    }
    
    setSquare(x, y, square) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            throw new Error('Coordinates out of bounds');
        }
        this.squares[y][x] = square;
    }
    
    getCarveableSquares() {
        const carveable = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const square = this.squares[y][x];
                if (square.isCarveable()) {
                    carveable.push(square);
                }
            }
        }
        return carveable;
    }
    
    getProtectedSquares() {
        const protected = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const square = this.squares[y][x];
                if (square.isProtected()) {
                    protected.push(square);
                }
            }
        }
        return protected;
    }
}

/**
 * Ball - Animated object with position, velocity, collision detection, and diameter equal to half the grid square edge length
 */
class Ball {
    constructor(id, x, y, velocityX, velocityY, diameter) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.diameter = diameter;
        this.isActive = true;
        this.initialSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        console.log('Initial speed: ', this.initialSpeed);
        
        this.validate();
    }
    
    validate() {
        if (typeof this.id !== 'string' || this.id.length === 0) {
            throw new Error('ID must be a non-empty string');
        }
        if (typeof this.x !== 'number' || !isFinite(this.x)) {
            throw new Error('X position must be a finite number');
        }
        if (typeof this.y !== 'number' || !isFinite(this.y)) {
            throw new Error('Y position must be a finite number');
        }
        if (typeof this.velocityX !== 'number' || !isFinite(this.velocityX)) {
            throw new Error('X velocity must be a finite number');
        }
        if (typeof this.velocityY !== 'number' || !isFinite(this.velocityY)) {
            throw new Error('Y velocity must be a finite number');
        }
        if (typeof this.diameter !== 'number' || this.diameter <= 0) {
            throw new Error('Diameter must be a positive number');
        }
        if (typeof this.isActive !== 'boolean') {
            throw new Error('IsActive must be a boolean');
        }
    }
    
    updatePosition() {
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
    
    getSpeed() {
        return Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
    }
    
    getAngle() {
        return Math.atan2(this.velocityY, this.velocityX);
    }
    
    setVelocity(velocityX, velocityY) {
        this.velocityX = velocityX;
        this.velocityY = velocityY;
    }
    
    setVelocityFromAngle(angle, speed) {
        this.velocityX = Math.cos(angle) * speed;
        this.velocityY = Math.sin(angle) * speed;
    }
}

/**
 * Intersection - Point where ray intersects with grid element
 */
class Intersection {
    constructor(x, y, distance, square, isEdge) {
        this.x = x;
        this.y = y;
        this.distance = distance;
        this.square = square;
        this.isEdge = isEdge;
        
        this.validate();
    }
    
    validate() {
        if (typeof this.x !== 'number' || !isFinite(this.x)) {
            throw new Error('X coordinate must be a finite number');
        }
        if (typeof this.y !== 'number' || !isFinite(this.y)) {
            throw new Error('Y coordinate must be a finite number');
        }
        if (typeof this.distance !== 'number' || this.distance < 0) {
            throw new Error('Distance must be a non-negative number');
        }
        if (!(this.square instanceof Square)) {
            throw new Error('Square must be a Square object');
        }
        if (typeof this.isEdge !== 'boolean') {
            throw new Error('IsEdge must be a boolean');
        }
    }
}

/**
 * RayCast - Line projection from bounce point or carveable square at specific angle to find intersection with grid squares or edges
 */
class RayCast {
    constructor(startX, startY, angle, maxDistance, intersections) {
        this.startX = startX;
        this.startY = startY;
        this.angle = angle;
        this.maxDistance = maxDistance;
        this.intersections = intersections || [];
        
        this.validate();
    }
    
    validate() {
        if (typeof this.startX !== 'number' || !isFinite(this.startX)) {
            throw new Error('Start X must be a finite number');
        }
        if (typeof this.startY !== 'number' || !isFinite(this.startY)) {
            throw new Error('Start Y must be a finite number');
        }
        if (typeof this.angle !== 'number' || !isFinite(this.angle)) {
            throw new Error('Angle must be a finite number');
        }
        if (typeof this.maxDistance !== 'number' || this.maxDistance <= 0) {
            throw new Error('Max distance must be a positive number');
        }
        if (!Array.isArray(this.intersections)) {
            throw new Error('Intersections must be an array');
        }
    }
    
    addIntersection(intersection) {
        if (!(intersection instanceof Intersection)) {
            throw new Error('Intersection must be an Intersection object');
        }
        this.intersections.push(intersection);
    }
    
    getClosestIntersection() {
        if (this.intersections.length === 0) {
            return null;
        }
        return this.intersections.reduce((closest, current) => 
            current.distance < closest.distance ? current : closest
        );
    }
}

/**
 * BounceAngle - Calculated angle for ball reflection, either optimal (via ray casting) or random within deviation range
 */
class BounceAngle {
    constructor(angle, isOptimal, deviation, targetSquare) {
        this.angle = angle;
        this.isOptimal = isOptimal;
        this.deviation = deviation;
        this.targetSquare = targetSquare;
        
        this.validate();
    }
    
    validate() {
        if (typeof this.angle !== 'number' || !isFinite(this.angle)) {
            throw new Error('Angle must be a finite number');
        }
        if (typeof this.isOptimal !== 'boolean') {
            throw new Error('IsOptimal must be a boolean');
        }
        if (typeof this.deviation !== 'number' || !isFinite(this.deviation)) {
            throw new Error('Deviation must be a finite number');
        }
        if (this.targetSquare !== null && !(this.targetSquare instanceof Square)) {
            throw new Error('Target square must be null or a Square object');
        }
    }
}

/**
 * AnimationState - Current progress of the carving process and ball management
 */
class AnimationState {
    constructor(isRunning, isComplete, frameCount, carveableSquaresRemaining, ballsActive, totalBallsSpawned) {
        this.isRunning = isRunning;
        this.isComplete = isComplete;
        this.frameCount = frameCount;
        this.carveableSquaresRemaining = carveableSquaresRemaining;
        this.ballsActive = ballsActive;
        this.totalBallsSpawned = totalBallsSpawned;
        this.balls = []; // Array of Ball objects
        
        this.validate();
    }
    
    validate() {
        if (typeof this.isRunning !== 'boolean') {
            throw new Error('IsRunning must be a boolean');
        }
        if (typeof this.isComplete !== 'boolean') {
            throw new Error('IsComplete must be a boolean');
        }
        if (!Number.isInteger(this.frameCount) || this.frameCount < 0) {
            throw new Error('Frame count must be a non-negative integer');
        }
        if (!Number.isInteger(this.carveableSquaresRemaining) || this.carveableSquaresRemaining < 0) {
            throw new Error('Carveable squares remaining must be a non-negative integer');
        }
        if (!Number.isInteger(this.ballsActive) || this.ballsActive < 0) {
            throw new Error('Balls active must be a non-negative integer');
        }
        if (!Number.isInteger(this.totalBallsSpawned) || this.totalBallsSpawned < 0) {
            throw new Error('Total balls spawned must be a non-negative integer');
        }
    }
    
    addBall(ball) {
        if (!(ball instanceof Ball)) {
            throw new Error('Ball must be a Ball object');
        }
        this.balls.push(ball);
        this.ballsActive = this.balls.filter(b => b.isActive).length;
        this.totalBallsSpawned++;
    }
    
    removeBall(ballId) {
        this.balls = this.balls.filter(b => b.id !== ballId);
        this.ballsActive = this.balls.filter(b => b.isActive).length;
    }
    
    getActiveBalls() {
        return this.balls.filter(b => b.isActive);
    }
}

/**
 * AnimationParameters - User-configurable settings including ball count (default 20), deviation angle (default 20 degrees), and movement speed (default customizable)
 */
class AnimationParameters {
    constructor(ballCount = 30, deviationAngle = 15, movementSpeed = 1.0, enableCustomization = true) {
        this.ballCount = ballCount;
        this.deviationAngle = deviationAngle;
        this.movementSpeed = movementSpeed;
        this.enableCustomization = enableCustomization;
        
        this.validate();
    }
    
    validate() {
        if (!Number.isInteger(this.ballCount) || this.ballCount < 1 || this.ballCount > 100) {
            throw new Error('Ball count must be an integer between 1 and 100');
        }
        if (typeof this.deviationAngle !== 'number' || this.deviationAngle < 1 || this.deviationAngle > 45) {
            throw new Error('Deviation angle must be a number between 1 and 45 degrees');
        }
        if (typeof this.movementSpeed !== 'number' || this.movementSpeed < 0.1 || this.movementSpeed > 5.0) {
            throw new Error('Movement speed must be a number between 0.1 and 5.0');
        }
        if (typeof this.enableCustomization !== 'boolean') {
            throw new Error('Enable customization must be a boolean');
        }
    }
    
    resetToDefaults() {
        this.ballCount = 30;
        this.deviationAngle = 15;
        this.movementSpeed = 1.0;
    }
}

// Make classes available globally for browser usage
if (typeof window !== 'undefined') {
    window.SquareState = SquareState;
    window.SquareType = SquareType;
    window.GrayscaleImage = GrayscaleImage;
    window.BlackWhiteImage = BlackWhiteImage;
    window.Square = Square;
    window.Grid = Grid;
    window.Ball = Ball;
    window.Intersection = Intersection;
    window.RayCast = RayCast;
    window.BounceAngle = BounceAngle;
    window.AnimationState = AnimationState;
    window.AnimationParameters = AnimationParameters;
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SquareState,
        SquareType,
        GrayscaleImage,
        BlackWhiteImage,
        Square,
        Grid,
        Ball,
        Intersection,
        RayCast,
        BounceAngle,
        AnimationState,
        AnimationParameters
    };
}
