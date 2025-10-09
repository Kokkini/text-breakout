/**
 * Validation Module
 * Comprehensive input validation and error handling
 */

/**
 * Input sanitization utilities
 */
class InputSanitizer {
    /**
     * Sanitize text input
     */
    static sanitizeText(text) {
        try {
            if (typeof text !== 'string') {
                return '';
            }
            
            // Remove any non-alphanumeric characters except spaces
            return text.replace(/[^a-zA-Z0-9\s]/g, '').trim();
            
        } catch (error) {
            globalErrorHandler.handleError(error, { context: 'sanitizeText' });
            return '';
        }
    }
    
    /**
     * Sanitize numeric input
     */
    static sanitizeNumber(value, min = 0, max = Infinity) {
        try {
            const num = parseFloat(value);
            if (isNaN(num)) {
                return min;
            }
            return Math.max(min, Math.min(max, num));
            
        } catch (error) {
            globalErrorHandler.handleError(error, { context: 'sanitizeNumber' });
            return min;
        }
    }
}

/**
 * Boundary checking utilities
 */
class BoundaryChecker {
    /**
     * Check if coordinates are within bounds
     */
    static checkCoordinates(x, y, maxX, maxY) {
        try {
            return x >= 0 && x < maxX && y >= 0 && y < maxY;
            
        } catch (error) {
            globalErrorHandler.handleError(error, { context: 'checkCoordinates' });
            return false;
        }
    }
    
    /**
     * Check if value is within range
     */
    static checkRange(value, min, max) {
        try {
            return value >= min && value <= max;
            
        } catch (error) {
            globalErrorHandler.handleError(error, { context: 'checkRange' });
            return false;
        }
    }
}

// ErrorRecovery class is defined in error-handling.js to avoid duplication

/**
 * User-friendly error messages
 */
class UserFriendlyMessages {
    /**
     * Get user-friendly error message
     */
    static getErrorMessage(error) {
        try {
            const messages = {
                'InvalidTextError': 'Please enter valid text (letters, numbers, and spaces only)',
                'InvalidParameterError': 'Please check your settings values',
                'InvalidCoordinatesError': 'Invalid position detected',
                'AnimationError': 'Animation error occurred. Please restart.',
                'CollisionError': 'Collision detection error. Please try again.',
                'RayCastError': 'Ball targeting error. Please restart.',
                'GridError': 'Grid error occurred. Please reset.',
                'BallError': 'Ball physics error. Please restart.'
            };
            
            return messages[error.constructor.name] || 'An unexpected error occurred. Please try again.';
            
        } catch (error) {
            return 'An error occurred. Please try again.';
        }
    }
    
    /**
     * Get user-friendly success message
     */
    static getSuccessMessage(action) {
        try {
            const messages = {
                'animationStarted': 'Animation started successfully!',
                'animationCompleted': 'Animation completed! Text pattern revealed.',
                'animationStopped': 'Animation stopped.',
                'animationReset': 'Animation reset successfully.',
                'parametersUpdated': 'Settings updated successfully.'
            };
            
            return messages[action] || 'Operation completed successfully.';
            
        } catch (error) {
            return 'Operation completed.';
        }
    }
}

/**
 * Debug mode functionality
 */
class DebugMode {
    constructor() {
        this.enabled = false;
        this.logs = [];
        this.maxLogs = 100;
    }
    
    /**
     * Enable debug mode
     */
    enable() {
        this.enabled = true;
        globalErrorHandler.setDebugMode(true);
        globalEventSystem.setDebugMode(true);
        console.log('Debug mode enabled');
    }
    
    /**
     * Disable debug mode
     */
    disable() {
        this.enabled = false;
        globalErrorHandler.setDebugMode(false);
        globalEventSystem.setDebugMode(false);
        console.log('Debug mode disabled');
    }
    
    /**
     * Log debug message
     */
    log(message, data = {}) {
        if (this.enabled) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                message: message,
                data: data
            };
            
            this.logs.push(logEntry);
            
            // Keep only recent logs
            if (this.logs.length > this.maxLogs) {
                this.logs = this.logs.slice(-this.maxLogs);
            }
            
            console.log('[DEBUG]', message, data);
        }
    }
    
    /**
     * Get debug logs
     */
    getLogs() {
        return [...this.logs];
    }
    
    /**
     * Clear debug logs
     */
    clearLogs() {
        this.logs = [];
    }
}

// Global debug mode instance
const globalDebugMode = new DebugMode();

/**
 * Comprehensive validation function
 */
function validateAllInputs(text, parameters) {
    try {
        const results = {
            isValid: true,
            errors: [],
            sanitized: {}
        };
        
        // Validate text
        try {
            ValidationHelper.validateText(text);
            results.sanitized.text = InputSanitizer.sanitizeText(text);
        } catch (error) {
            results.isValid = false;
            results.errors.push(UserFriendlyMessages.getErrorMessage(error));
        }
        
        // Validate parameters
        if (parameters) {
            try {
                parameters.validate();
                results.sanitized.parameters = parameters;
            } catch (error) {
                results.isValid = false;
                results.errors.push(UserFriendlyMessages.getErrorMessage(error));
            }
        }
        
        return results;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'validateAllInputs' });
        return {
            isValid: false,
            errors: ['Validation error occurred'],
            sanitized: {}
        };
    }
}

// Make classes and functions available globally for browser usage
if (typeof window !== 'undefined') {
    window.InputSanitizer = InputSanitizer;
    window.BoundaryChecker = BoundaryChecker;
    window.UserFriendlyMessages = UserFriendlyMessages;
    window.DebugMode = DebugMode;
    window.globalDebugMode = globalDebugMode;
    window.validateAllInputs = validateAllInputs;
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        InputSanitizer,
        BoundaryChecker,
        UserFriendlyMessages,
        DebugMode,
        globalDebugMode,
        validateAllInputs
    };
}
