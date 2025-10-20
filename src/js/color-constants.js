/**
 * Color Constants Module
 * Centralized color definitions for the text breakout animation
 */

// Color constants for easy modification
const COLORS = {
    // Primary colors
    BLACK: 32,          // Softer near-black for text and carveable areas
    WHITE: 245,         // Softer off-white for background and carved areas
    GRAY: 128,          // Gray color for unknown states
    
    // Background colors
    BACKGROUND_ANIMATING: 0,    // Black background during animation
    BACKGROUND_STATIC: 255,     // White background when not animating
    
    // Text colors
    TEXT_BLACK: '#000000',       // Black text color
    TEXT_WHITE: '#ffffff',       // White background color
    
    // Special effect colors
    FLASH_COLOR: '#FFD700',      // Gold/yellow flash color
    PROTECTED_COLOR: '#ff8c00',  // Orange color for protected squares
    RED_COLOR: 'red',            // Red color for completed protected squares
    BALL_COLOR: 32,               // Black color for balls
    WELCOME_TEXT: 100           // Gray color for welcome text
};

// Make colors available globally
if (typeof window !== 'undefined') {
    window.COLORS = COLORS;
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = COLORS;
}
