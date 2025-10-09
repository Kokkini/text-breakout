/**
 * Error Handling System for Ball Create Text Animation
 * Custom error classes and error handling utilities
 */

/**
 * Base error class for all custom errors
 */
class BallAnimationError extends Error {
    constructor(message, code = 'BALL_ANIMATION_ERROR') {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.timestamp = new Date().toISOString();
        
        // Maintains proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Validation Errors
 */
class InvalidTextError extends BallAnimationError {
    constructor(message = 'Invalid text input') {
        super(message, 'INVALID_TEXT_ERROR');
    }
}

class InvalidCoordinatesError extends BallAnimationError {
    constructor(message = 'Invalid coordinates') {
        super(message, 'INVALID_COORDINATES_ERROR');
    }
}

class InvalidParameterError extends BallAnimationError {
    constructor(message = 'Invalid parameter value') {
        super(message, 'INVALID_PARAMETER_ERROR');
    }
}

/**
 * Runtime Errors
 */
class AnimationError extends BallAnimationError {
    constructor(message = 'Animation error') {
        super(message, 'ANIMATION_ERROR');
    }
}

class CollisionError extends BallAnimationError {
    constructor(message = 'Collision detection error') {
        super(message, 'COLLISION_ERROR');
    }
}

class RayCastError extends BallAnimationError {
    constructor(message = 'Ray casting error') {
        super(message, 'RAY_CAST_ERROR');
    }
}

class GridError extends BallAnimationError {
    constructor(message = 'Grid operation error') {
        super(message, 'GRID_ERROR');
    }
}

class BallError extends BallAnimationError {
    constructor(message = 'Ball operation error') {
        super(message, 'BALL_ERROR');
    }
}

/**
 * Error Handler Class
 */
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.debugMode = false;
    }
    
    /**
     * Log an error
     */
    logError(error, context = {}) {
        const errorInfo = {
            error: error,
            context: context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errors.push(errorInfo);
        
        // Keep only the most recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }
        
        // Console logging
        if (this.debugMode) {
            console.error('Ball Animation Error:', errorInfo);
        } else {
            console.error('Ball Animation Error:', error.message);
        }
        
        return errorInfo;
    }
    
    /**
     * Handle an error with user-friendly message
     */
    handleError(error, context = {}) {
        this.logError(error, context);
        
        // Return user-friendly error message
        switch (error.constructor) {
            case InvalidTextError:
                return 'Please enter valid text (1-50 characters, letters, numbers, and spaces only)';
            case InvalidCoordinatesError:
                return 'Invalid position detected. Please try again.';
            case InvalidParameterError:
                return 'Invalid setting value. Please check your input.';
            case AnimationError:
                return 'Animation error occurred. Please restart the animation.';
            case CollisionError:
                return 'Collision detection error. Please try again.';
            case RayCastError:
                return 'Ball targeting error. Please restart the animation.';
            case GridError:
                return 'Grid error occurred. Please reset and try again.';
            case BallError:
                return 'Ball physics error. Please restart the animation.';
            default:
                return 'An unexpected error occurred. Please refresh the page and try again.';
        }
    }
    
    /**
     * Get recent errors
     */
    getRecentErrors(count = 10) {
        return this.errors.slice(-count);
    }
    
    /**
     * Clear all errors
     */
    clearErrors() {
        this.errors = [];
    }
    
    /**
     * Enable/disable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
    
    /**
     * Get error statistics
     */
    getErrorStats() {
        const stats = {
            total: this.errors.length,
            byType: {},
            recent: this.errors.slice(-10)
        };
        
        this.errors.forEach(errorInfo => {
            const errorType = errorInfo.error.constructor.name;
            stats.byType[errorType] = (stats.byType[errorType] || 0) + 1;
        });
        
        return stats;
    }
}

/**
 * Validation Helper Functions
 */
class ValidationHelper {
    /**
     * Validate text input
     */
    static validateText(text) {
        if (typeof text !== 'string') {
            throw new InvalidTextError('Text must be a string');
        }
        
        if (text.length === 0) {
            throw new InvalidTextError('Text cannot be empty');
        }
        
        if (text.length > 50) {
            throw new InvalidTextError('Text cannot exceed 50 characters');
        }
        
        // Check for valid characters (alphanumeric and spaces only)
        const validPattern = /^[a-zA-Z0-9\s]+$/;
        if (!validPattern.test(text)) {
            throw new InvalidTextError('Text can only contain letters, numbers, and spaces');
        }
        
        return true;
    }
    
    /**
     * Validate coordinates
     */
    static validateCoordinates(x, y, maxX = Infinity, maxY = Infinity) {
        if (typeof x !== 'number' || !isFinite(x) || x < 0 || x >= maxX) {
            throw new InvalidCoordinatesError(`X coordinate must be a finite number between 0 and ${maxX - 1}`);
        }
        
        if (typeof y !== 'number' || !isFinite(y) || y < 0 || y >= maxY) {
            throw new InvalidCoordinatesError(`Y coordinate must be a finite number between 0 and ${maxY - 1}`);
        }
        
        return true;
    }
    
    /**
     * Validate parameter values
     */
    static validateParameter(value, min, max, name) {
        if (typeof value !== 'number' || !isFinite(value)) {
            throw new InvalidParameterError(`${name} must be a finite number`);
        }
        
        if (value < min || value > max) {
            throw new InvalidParameterError(`${name} must be between ${min} and ${max}`);
        }
        
        return true;
    }
    
    /**
     * Validate ball count
     */
    static validateBallCount(count) {
        return this.validateParameter(count, 1, 100, 'Ball count');
    }
    
    /**
     * Validate deviation angle
     */
    static validateDeviationAngle(angle) {
        return this.validateParameter(angle, 1, 45, 'Deviation angle');
    }
    
    /**
     * Validate movement speed
     */
    static validateMovementSpeed(speed) {
        return this.validateParameter(speed, 0.1, 5.0, 'Movement speed');
    }
}

/**
 * Error Recovery Utilities
 */
class ErrorRecovery {
    /**
     * Attempt to recover from animation errors
     */
    static recoverFromAnimationError(error, animationState) {
        if (error instanceof CollisionError) {
            // Reset ball positions to safe locations
            animationState.balls.forEach(ball => {
                if (ball.isActive) {
                    ball.x = Math.max(0, Math.min(width, ball.x));
                    ball.y = Math.max(0, Math.min(height, ball.y));
                }
            });
            return true;
        }
        
        if (error instanceof RayCastError) {
            // Use random angles as fallback
            animationState.balls.forEach(ball => {
                if (ball.isActive) {
                    const randomAngle = Math.random() * Math.PI * 2;
                    const speed = ball.getSpeed();
                    ball.setVelocityFromAngle(randomAngle, speed);
                }
            });
            return true;
        }
        
        return false;
    }
    
    /**
     * Attempt to recover from grid errors
     */
    static recoverFromGridError(error, grid) {
        if (error instanceof GridError) {
            // Reset grid to safe state
            for (let y = 0; y < grid.height; y++) {
                for (let x = 0; x < grid.width; x++) {
                    const square = grid.getSquare(x, y);
                    if (square && square.state === SquareState.BLACK_CARVEABLE) {
                        // Keep carveable squares as they are
                        continue;
                    }
                }
            }
            return true;
        }
        
        return false;
    }
}

// Global error handler instance
const globalErrorHandler = new ErrorHandler();

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
    const error = new BallAnimationError(event.message, 'UNCAUGHT_ERROR');
    globalErrorHandler.handleError(error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    const error = new BallAnimationError(event.reason, 'UNHANDLED_REJECTION');
    globalErrorHandler.handleError(error, {
        promise: event.promise
    });
});

// Make classes and objects available globally for browser usage
if (typeof window !== 'undefined') {
    window.BallAnimationError = BallAnimationError;
    window.InvalidTextError = InvalidTextError;
    window.InvalidCoordinatesError = InvalidCoordinatesError;
    window.InvalidParameterError = InvalidParameterError;
    window.AnimationError = AnimationError;
    window.CollisionError = CollisionError;
    window.RayCastError = RayCastError;
    window.GridError = GridError;
    window.BallError = BallError;
    window.ErrorHandler = ErrorHandler;
    window.ValidationHelper = ValidationHelper;
    window.ErrorRecovery = ErrorRecovery;
    window.globalErrorHandler = globalErrorHandler;
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BallAnimationError,
        InvalidTextError,
        InvalidCoordinatesError,
        InvalidParameterError,
        AnimationError,
        CollisionError,
        RayCastError,
        GridError,
        BallError,
        ErrorHandler,
        ValidationHelper,
        ErrorRecovery,
        globalErrorHandler
    };
}
