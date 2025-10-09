/**
 * Event System Module
 * Handles custom events for animation lifecycle
 */

/**
 * Custom event classes for animation lifecycle
 */
class AnimationEvent extends Event {
    constructor(type, detail = {}) {
        super(type, { bubbles: true, cancelable: true });
        this.detail = detail;
        this.timestamp = new Date().toISOString();
    }
}

class BallEvent extends AnimationEvent {
    constructor(type, ball, detail = {}) {
        super(type, { ...detail, ball: ball });
        this.ball = ball;
    }
}

class SquareEvent extends AnimationEvent {
    constructor(type, square, detail = {}) {
        super(type, { ...detail, square: square });
        this.square = square;
    }
}

/**
 * Event System Manager
 */
class EventSystem {
    constructor() {
        this.listeners = new Map();
        this.debugMode = false;
    }
    
    /**
     * Add event listener
     */
    addEventListener(type, listener, options = {}) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        this.listeners.get(type).push({ listener, options });
        
        if (this.debugMode) {
            console.log(`Added listener for ${type}`);
        }
    }
    
    /**
     * Remove event listener
     */
    removeEventListener(type, listener) {
        if (this.listeners.has(type)) {
            const listeners = this.listeners.get(type);
            const index = listeners.findIndex(l => l.listener === listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }
    
    /**
     * Dispatch custom event
     */
    dispatchEvent(event) {
        if (this.debugMode) {
            console.log(`Dispatching event: ${event.type}`, event.detail);
        }
        
        if (this.listeners.has(event.type)) {
            const listeners = this.listeners.get(event.type);
            listeners.forEach(({ listener, options }) => {
                try {
                    listener(event);
                } catch (error) {
                    console.error(`Error in event listener for ${event.type}:`, error);
                }
            });
        }
    }
    
    /**
     * Set debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
}

// Global event system instance
const globalEventSystem = new EventSystem();

/**
 * Dispatch animation started event
 */
function dispatchAnimationStarted(animationState) {
    try {
        const event = new AnimationEvent('animationStarted', {
            animationState: animationState,
            timestamp: new Date().toISOString()
        });
        globalEventSystem.dispatchEvent(event);
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'dispatchAnimationStarted' });
    }
}

/**
 * Dispatch animation completed event
 */
function dispatchAnimationCompleted(animationState) {
    try {
        const event = new AnimationEvent('animationCompleted', {
            animationState: animationState,
            timestamp: new Date().toISOString()
        });
        globalEventSystem.dispatchEvent(event);
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'dispatchAnimationCompleted' });
    }
}

/**
 * Dispatch ball spawned event
 */
function dispatchBallSpawned(ball) {
    try {
        const event = new BallEvent('ballSpawned', ball, {
            timestamp: new Date().toISOString()
        });
        globalEventSystem.dispatchEvent(event);
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'dispatchBallSpawned' });
    }
}

/**
 * Dispatch ball destroyed event
 */
function dispatchBallDestroyed(ball) {
    try {
        const event = new BallEvent('ballDestroyed', ball, {
            timestamp: new Date().toISOString()
        });
        globalEventSystem.dispatchEvent(event);
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'dispatchBallDestroyed' });
    }
}

/**
 * Dispatch square carved event
 */
function dispatchSquareCarved(square) {
    try {
        const event = new SquareEvent('squareCarved', square, {
            timestamp: new Date().toISOString()
        });
        globalEventSystem.dispatchEvent(event);
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'dispatchSquareCarved' });
    }
}

// Make classes and functions available globally for browser usage
if (typeof window !== 'undefined') {
    window.AnimationEvent = AnimationEvent;
    window.BallEvent = BallEvent;
    window.SquareEvent = SquareEvent;
    window.EventSystem = EventSystem;
    window.globalEventSystem = globalEventSystem;
    window.dispatchAnimationStarted = dispatchAnimationStarted;
    window.dispatchAnimationCompleted = dispatchAnimationCompleted;
    window.dispatchBallSpawned = dispatchBallSpawned;
    window.dispatchBallDestroyed = dispatchBallDestroyed;
    window.dispatchSquareCarved = dispatchSquareCarved;
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AnimationEvent,
        BallEvent,
        SquareEvent,
        EventSystem,
        globalEventSystem,
        dispatchAnimationStarted,
        dispatchAnimationCompleted,
        dispatchBallSpawned,
        dispatchBallDestroyed,
        dispatchSquareCarved
    };
}
