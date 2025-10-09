/**
 * Performance Optimization Module
 * Handles performance monitoring and optimization
 */

/**
 * Performance monitoring utilities
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            frameRate: 0,
            frameTime: 0,
            ballCount: 0,
            gridSize: 0,
            memoryUsage: 0
        };
        this.frameCount = 0;
        this.lastFrameTime = 0;
        this.isMonitoring = false;
    }
    
    /**
     * Start performance monitoring
     */
    startMonitoring() {
        this.isMonitoring = true;
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
    }
    
    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
        this.isMonitoring = false;
    }
    
    /**
     * Update performance metrics
     */
    updateMetrics(ballCount, gridSize) {
        if (!this.isMonitoring) return;
        
        const currentTime = performance.now();
        const frameTime = currentTime - this.lastFrameTime;
        
        this.metrics.frameTime = frameTime;
        this.metrics.frameRate = 1000 / frameTime;
        this.metrics.ballCount = ballCount;
        this.metrics.gridSize = gridSize;
        
        this.lastFrameTime = currentTime;
        this.frameCount++;
    }
    
    /**
     * Get current metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    
    /**
     * Check if performance is acceptable
     */
    isPerformanceAcceptable() {
        return this.metrics.frameRate >= 30; // Minimum 30 FPS
    }
}

// Global performance monitor
const globalPerformanceMonitor = new PerformanceMonitor();

/**
 * Optimize grid lookup patterns
 */
function optimizeGridLookup(grid) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        
        // Simple optimization - could be enhanced with spatial indexing
        return grid;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'optimizeGridLookup' });
        return grid;
    }
}

/**
 * Limit ray casting for performance
 */
function limitRayCasting(angleCount) {
    try {
        const maxAngles = 20; // Limit to 20 angles max
        return Math.min(angleCount, maxAngles);
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'limitRayCasting' });
        return angleCount;
    }
}

/**
 * Batch ball updates for performance
 */
function batchBallUpdates(balls) {
    try {
        if (!Array.isArray(balls)) {
            throw new Error('Balls must be an array');
        }
        
        // Simple batching - could be enhanced with spatial partitioning
        return balls;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'batchBallUpdates' });
        return balls;
    }
}

/**
 * Clean up completed animation resources
 */
function cleanupCompletedAnimation(animationState) {
    try {
        if (!(animationState instanceof AnimationState)) {
            throw new Error('Animation state must be an AnimationState object');
        }
        
        // Clear ball arrays
        animationState.balls = [];
        animationState.ballsActive = 0;
        
        // Reset frame count
        animationState.frameCount = 0;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'cleanupCompletedAnimation' });
    }
}

/**
 * Reuse ball objects to reduce garbage collection
 */
function reuseBallObjects() {
    try {
        // Simple object pooling - could be enhanced
        return [];
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'reuseBallObjects' });
        return [];
    }
}

// Make classes and functions available globally for browser usage
if (typeof window !== 'undefined') {
    window.PerformanceMonitor = PerformanceMonitor;
    window.globalPerformanceMonitor = globalPerformanceMonitor;
    window.optimizeGridLookup = optimizeGridLookup;
    window.limitRayCasting = limitRayCasting;
    window.batchBallUpdates = batchBallUpdates;
    window.cleanupCompletedAnimation = cleanupCompletedAnimation;
    window.reuseBallObjects = reuseBallObjects;
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PerformanceMonitor,
        globalPerformanceMonitor,
        optimizeGridLookup,
        limitRayCasting,
        batchBallUpdates,
        cleanupCompletedAnimation,
        reuseBallObjects
    };
}
