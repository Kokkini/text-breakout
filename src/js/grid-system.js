/**
 * Grid System Module
 * Manages grid creation, square state management, and grid operations
 */

// Define SquareState values locally if not available globally
const SquareState = window.SquareState || {
    BLACK_CARVEABLE: 'BLACK_CARVEABLE',
    BLACK_PROTECTED: 'BLACK_PROTECTED', 
    WHITE_CARVED: 'WHITE_CARVED',
    WHITE_EDGE: 'WHITE_EDGE'
};

// Define SquareType values locally if not available globally
const SquareType = window.SquareType || {
    CARVEABLE: 'CARVEABLE',
    PROTECTED: 'PROTECTED',
    EDGE: 'EDGE'
};

/**
 * Create grid from binary image with padding
 * @param {BlackWhiteImage} blackWhiteImage - Binary image data
 * @param {number} padding - Number of white squares on each side (default: 5)
 * @returns {Grid} Grid object with initialized squares
 */
function createGrid(blackWhiteImage, padding = 5) {
    try {
        // Accept both BlackWhiteImage objects and simple objects with the same structure
        if (!blackWhiteImage || typeof blackWhiteImage !== 'object' || 
            !blackWhiteImage.width || !blackWhiteImage.height || !blackWhiteImage.pixels) {
            throw new Error('Input must be a BlackWhiteImage object or compatible object');
        }
        
        if (!Number.isInteger(padding) || padding < 0) {
            throw new Error('Padding must be a non-negative integer');
        }
        
        const gridWidth = blackWhiteImage.width + (padding * 2);
        const gridHeight = blackWhiteImage.height + (padding * 2);
        const squares = [];
        
        console.log('Grid dimensions:', gridWidth, 'x', gridHeight);
        console.log('Image dimensions:', blackWhiteImage.width, 'x', blackWhiteImage.height);
        console.log('Padding:', padding);
        
        // Initialize grid with edge padding
        for (let y = 0; y < gridHeight; y++) {
            squares[y] = [];
            for (let x = 0; x < gridWidth; x++) {
                let state, type;
                
                if (x < padding || x >= gridWidth - padding || 
                    y < padding || y >= gridHeight - padding) {
                    // Edge padding - always white and edge type
                    state = SquareState.WHITE_EDGE;
                    type = SquareType.EDGE;
                } else {
                    // Image area - determine from binary image
                    const imageX = x - padding;
                    const imageY = y - padding;
                    
                    // Ensure we're within image bounds
                    if (imageX >= 0 && imageX < blackWhiteImage.width && 
                        imageY >= 0 && imageY < blackWhiteImage.height) {
                        
                        const pixelIndex = imageY * blackWhiteImage.width + imageX;
                        const pixelValue = blackWhiteImage.pixels[pixelIndex];
                        const isBlack = pixelValue;
                        // const isBlack = pixelValue < 128; // Black text = 0, White background = 255
                        
                        // Debug: Log some pixel values to understand what we're getting
                        if (x === padding + 5 && y === padding + 5) {
                            console.log('Sample pixel at (5,5):', pixelValue, 'isBlack:', isBlack);
                        }
                        
                        if (isBlack) {
                            // Black pixel = protected text area (should NOT be carved)
                            state = SquareState.BLACK_PROTECTED;
                            type = SquareType.PROTECTED;
                        } else {
                            // White pixel = carveable background area (should be carved)
                            state = SquareState.BLACK_CARVEABLE;
                            type = SquareType.CARVEABLE;
                        }
                    } else {
                        // Out of bounds - treat as edge
                        state = SquareState.WHITE_EDGE;
                        type = SquareType.EDGE;
                    }
                }
                
                squares[y][x] = new Square(x, y, state, type);
            }
        }
        
        // Debug: Count squares by state
        let protectedCount = 0;
        let carveableCount = 0;
        let edgeCount = 0;
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const square = squares[y][x];
                if (square.state === SquareState.BLACK_PROTECTED) protectedCount++;
                else if (square.state === SquareState.BLACK_CARVEABLE) carveableCount++;
                else if (square.state === SquareState.WHITE_EDGE) edgeCount++;
            }
        }
        console.log('Grid square counts - Protected:', protectedCount, 'Carveable:', carveableCount, 'Edge:', edgeCount);
        
        return new Grid(gridWidth, gridHeight, squares, padding);
        
    } catch (error) {
        const handledError = globalErrorHandler.handleError(error, { 
            blackWhiteImage: blackWhiteImage,
            padding: padding
        });
        throw new GridError(handledError);
    }
}

/**
 * Update individual square state
 * @param {Grid} grid - Grid to update
 * @param {number} x - Square X coordinate
 * @param {number} y - Square Y coordinate
 * @param {string} newState - New state for square
 */
/**
 * Check adjacent squares and change BLACK_PROTECTED squares to red when a BLACK_CARVEABLE square is carved
 * @param {Grid} grid - Grid containing the squares
 * @param {number} x - X coordinate of the carved square
 * @param {number} y - Y coordinate of the carved square
 */
function checkAdjacentSquaresForProtected(grid, x, y) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        
        // Check 4 adjacent squares (up, down, left, right)
        const adjacentPositions = [
            { x: x, y: y - 1 },     // Up
            { x: x, y: y + 1 },     // Down
            { x: x - 1, y: y },     // Left
            { x: x + 1, y: y }      // Right
        ];
        
        for (const pos of adjacentPositions) {
            // Check if position is within grid bounds
            if (pos.x >= 0 && pos.x < grid.width && pos.y >= 0 && pos.y < grid.height) {
                const adjacentSquare = grid.getSquare(pos.x, pos.y);
                if (adjacentSquare && adjacentSquare.state === SquareState.BLACK_PROTECTED) {
                    // Change the color to red for this protected square
                    adjacentSquare.color = 'red';
                }
            }
        }
        
    } catch (error) {
        globalErrorHandler.handleError(error, { 
            grid: grid,
            x: x,
            y: y
        });
    }
}

function updateSquareState(grid, x, y, newState) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        
        ValidationHelper.validateCoordinates(x, y, grid.width, grid.height);
        
        if (!Object.values(SquareState).includes(newState)) {
            throw new Error('Invalid square state');
        }
        
        const square = grid.getSquare(x, y);
        if (!square) {
            throw new Error('Square not found at coordinates');
        }
        
        // Validate state transition
        if (!isValidStateTransition(square.state, newState)) {
            throw new Error('Invalid state transition');
        }
        
        // Check if we're carving a BLACK_CARVEABLE square
        if (square.state === SquareState.BLACK_CARVEABLE && newState === SquareState.WHITE_CARVED) {
            // Check adjacent squares and change BLACK_PROTECTED to red
            checkAdjacentSquaresForProtected(grid, x, y);
        }
        
        // Update the square state
        square.state = newState;
        
    } catch (error) {
        const handledError = globalErrorHandler.handleError(error, { 
            grid: grid,
            x: x,
            y: y,
            newState: newState
        });
        throw new GridError(handledError);
    }
}

/**
 * Check if a state transition is valid
 * @param {string} currentState - Current square state
 * @param {string} newState - New square state
 * @returns {boolean} True if transition is valid
 */
function isValidStateTransition(currentState, newState) {
    const validTransitions = {
        [SquareState.BLACK_CARVEABLE]: [SquareState.WHITE_CARVED],
        [SquareState.BLACK_PROTECTED]: [SquareState.BLACK_PROTECTED], // Can't change
        [SquareState.WHITE_CARVED]: [SquareState.WHITE_CARVED], // Can't change
        [SquareState.WHITE_EDGE]: [SquareState.WHITE_EDGE] // Can't change
    };
    
    return validTransitions[currentState] && validTransitions[currentState].includes(newState);
}

/**
 * Get square at pixel coordinates
 * @param {Grid} grid - Grid to search
 * @param {number} pixelX - Pixel X coordinate
 * @param {number} pixelY - Pixel Y coordinate
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @returns {Square|null} Square at coordinates or null
 */
function getSquareAtPixel(grid, pixelX, pixelY, gridRenderingParams) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        
        // Calculate grid coordinates from pixel coordinates
        if (!gridRenderingParams) {
            console.warn('gridRenderingParams is undefined in getSquareAtPixel, using fallback');
            return null;
        }
        const { squareSize, offsetX, offsetY } = gridRenderingParams;
        
        // Adjust pixel coordinates by offset
        const adjustedX = pixelX - offsetX;
        const adjustedY = pixelY - offsetY;
        
        const gridX = Math.floor(adjustedX / squareSize);
        const gridY = Math.floor(adjustedY / squareSize);
        
        return grid.getSquare(gridX, gridY);
        
    } catch (error) {
        globalErrorHandler.handleError(error, { 
            grid: grid,
            pixelX: pixelX,
            pixelY: pixelY,
            canvasWidth: canvasWidth,
            canvasHeight: canvasHeight
        });
        return null;
    }
}

/**
 * Get square at grid coordinates (grid units)
 * @param {Grid} grid - Grid to search
 * @param {number} gridX - Grid X coordinate (can be fractional; floors to index)
 * @param {number} gridY - Grid Y coordinate (can be fractional; floors to index)
 * @returns {Square|null} Square at coordinates or null
 */
function getSquareAtGrid(grid, gridX, gridY) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        const ix = Math.floor(gridX);
        const iy = Math.floor(gridY);
        if (ix < 0 || iy < 0 || ix >= grid.width || iy >= grid.height) {
            return null;
        }
        return grid.getSquare(ix, iy);
    } catch (error) {
        globalErrorHandler.handleError(error, { grid: grid, gridX: gridX, gridY: gridY });
        return null;
    }
}

/**
 * Convert grid coordinates (units) to pixel coordinates using rendering params
 * @param {number} gridX
 * @param {number} gridY
 * @param {Object} gridRenderingParams
 * @returns {{x:number,y:number}}
 */
function gridToPixel(gridX, gridY, gridRenderingParams) {
    if (!gridRenderingParams) return { x: 0, y: 0 };
    const { squareSize, offsetX, offsetY } = gridRenderingParams;
    return {
        x: offsetX + gridX * squareSize,
        y: offsetY + gridY * squareSize
    };
}

/**
 * Convert pixel coordinates to grid coordinates (fractional) using rendering params
 * @param {number} pixelX
 * @param {number} pixelY
 * @param {Object} gridRenderingParams
 * @returns {{x:number,y:number}}
 */
function pixelToGrid(pixelX, pixelY, gridRenderingParams) {
    if (!gridRenderingParams) return { x: 0, y: 0 };
    const { squareSize, offsetX, offsetY } = gridRenderingParams;
    return {
        x: (pixelX - offsetX) / squareSize,
        y: (pixelY - offsetY) / squareSize
    };
}

/**
 * Get pixel coordinates for a square
 * @param {Grid} grid - Grid containing the square
 * @param {number} gridX - Grid X coordinate
 * @param {number} gridY - Grid Y coordinate
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @returns {Object} Pixel coordinates {x, y, width, height}
 */
function getSquarePixelCoordinates(grid, gridX, gridY, gridRenderingParams) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        
        ValidationHelper.validateCoordinates(gridX, gridY, grid.width, grid.height);
        
        if (!gridRenderingParams) {
            console.warn('gridRenderingParams is undefined in getSquarePixelCoordinates, using fallback');
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        const { squareSize, offsetX, offsetY } = gridRenderingParams;
        
        return {
            x: offsetX + (gridX * squareSize),
            y: offsetY + (gridY * squareSize),
            width: squareSize,
            height: squareSize
        };
        
    } catch (error) {
        globalErrorHandler.handleError(error, { 
            grid: grid,
            gridX: gridX,
            gridY: gridY,
            canvasWidth: canvasWidth,
            canvasHeight: canvasHeight
        });
        return { x: 0, y: 0, width: 0, height: 0 };
    }
}

/**
 * Count squares by state
 * @param {Grid} grid - Grid to count
 * @param {string} state - State to count
 * @returns {number} Number of squares with the given state
 */
function countSquaresByState(grid, state) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        
        if (!Object.values(SquareState).includes(state)) {
            throw new Error('Invalid square state');
        }
        
        let count = 0;
        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                const square = grid.getSquare(x, y);
                if (square && square.state === state) {
                    count++;
                }
            }
        }
        
        return count;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { 
            grid: grid,
            state: state
        });
        return 0;
    }
}

/**
 * Check if animation is complete
 * @param {Grid} grid - Grid to check
 * @returns {boolean} True if all carveable squares are white
 */
function isAnimationComplete(grid) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        
        const carveableCount = countSquaresByState(grid, SquareState.BLACK_CARVEABLE);
        return carveableCount === 0;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { grid: grid });
        return false;
    }
}

/**
 * Get carveable squares that are adjacent to protected squares
 * @param {Grid} grid - Grid to search
 * @returns {Array} Array of carveable squares adjacent to protected squares
 */
function getCarveableSquaresAdjacentToProtected(grid) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        
        const adjacentCarveable = [];
        
        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                const square = grid.getSquare(x, y);
                if (square && square.isCarveable()) {
                    // Check if this carveable square is adjacent to a protected square
                    const isAdjacentToProtected = isAdjacentToSquareType(grid, x, y, SquareState.BLACK_PROTECTED);
                    if (isAdjacentToProtected) {
                        adjacentCarveable.push(square);
                    }
                }
            }
        }
        
        return adjacentCarveable;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { grid: grid });
        return [];
    }
}

/**
 * Check if a square is adjacent to squares of a specific state
 * @param {Grid} grid - Grid to check
 * @param {number} x - Square X coordinate
 * @param {number} y - Square Y coordinate
 * @param {string} targetState - State to look for
 * @returns {boolean} True if adjacent to squares with target state
 */
function isAdjacentToSquareType(grid, x, y, targetState) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        
        // Check all 8 directions around the square
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dx, dy] of directions) {
            const checkX = x + dx;
            const checkY = y + dy;
            const adjacentSquare = grid.getSquare(checkX, checkY);
            
            if (adjacentSquare && adjacentSquare.state === targetState) {
                return true;
            }
        }
        
        return false;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { 
            grid: grid,
            x: x,
            y: y,
            targetState: targetState
        });
        return false;
    }
}

/**
 * Mark isolated carveable squares as protected
 * @param {Grid} grid - Grid to process
 */
function markIsolatedCarveableAsProtected(grid) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        
        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                const square = grid.getSquare(x, y);
                if (square && square.isCarveable()) {
                    // Check if all adjacent squares are protected
                    const allAdjacentProtected = isAdjacentToSquareType(grid, x, y, SquareState.BLACK_PROTECTED) &&
                        !isAdjacentToSquareType(grid, x, y, SquareState.BLACK_CARVEABLE) &&
                        !isAdjacentToSquareType(grid, x, y, SquareState.WHITE_EDGE);
                    
                    if (allAdjacentProtected) {
                        square.state = SquareState.BLACK_PROTECTED;
                    }
                }
            }
        }
        
    } catch (error) {
        globalErrorHandler.handleError(error, { grid: grid });
    }
}

/**
 * Get grid rendering parameters that maintain aspect ratio
 * @param {Grid} grid - Grid to render
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @returns {Object} Rendering parameters
 */
function getGridRenderingParams(grid, canvasWidth, canvasHeight) {
    // Calculate aspect ratios
    const gridAspectRatio = grid.width / grid.height;
    const canvasAspectRatio = canvasWidth / canvasHeight;
    
    // Determine square size to maintain aspect ratio
    let squareSize;
    let offsetX = 0;
    let offsetY = 0;
    
    if (gridAspectRatio > canvasAspectRatio) {
        // Grid is wider than canvas - fit to width
        squareSize = canvasWidth / grid.width;
        offsetY = (canvasHeight - (grid.height * squareSize)) / 2;
    } else {
        // Grid is taller than canvas - fit to height
        squareSize = canvasHeight / grid.height;
        offsetX = (canvasWidth - (grid.width * squareSize)) / 2;
    }
    
    return {
        squareSize: squareSize,
        offsetX: offsetX,
        offsetY: offsetY,
        gridWidth: grid.width,
        gridHeight: grid.height
    };
}

/**
 * Draw the grid on the canvas
 * @param {Grid} grid - Grid to draw
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
function drawGrid(grid, canvasWidth, canvasHeight) {
    try {
        if (!(grid instanceof Grid)) {
            throw new Error('Grid must be a Grid object');
        }
        
        // Get rendering parameters that maintain aspect ratio
        const params = getGridRenderingParams(grid, canvasWidth, canvasHeight);
        const { squareSize, offsetX, offsetY } = params;
        
        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                const square = grid.getSquare(x, y);
                if (square) {
                    const pixelX = offsetX + (x * squareSize);
                    const pixelY = offsetY + (y * squareSize);
                    
                    // Set color based on square color property or default state color
                    if (square.color) {
                        // Use custom color if set
                        if (square.color === 'red') {
                            fill(255, 0, 0); // Red
                        } else {
                            fill(square.color); // Use the color string directly
                        }
                    } else {
                        // Use default state-based colors
                        switch (square.state) {
                            case SquareState.BLACK_CARVEABLE:
                                fill(0); // Black - carveable background
                                break;
                            case SquareState.BLACK_PROTECTED:
                                fill(0); // Black - protected text
                                break;
                            case SquareState.WHITE_CARVED:
                                fill(255); // White - carved area
                                break;
                            case SquareState.WHITE_EDGE:
                                fill(255); // White - edge padding
                                break;
                            default:
                                fill(128); // Gray for unknown states
                        }
                    }
                    
                    // Draw the square a bit bigger to avoid pixel imperfection
                    noStroke();
                    rect(pixelX - 1, pixelY - 1, squareSize + 2, squareSize + 2);
                    // rect(pixelX, pixelY, squareSize, squareSize);
                }
            }
        }
        
    } catch (error) {
        globalErrorHandler.handleError(error, { 
            grid: grid,
            canvasWidth: canvasWidth,
            canvasHeight: canvasHeight
        });
    }
}

// Make functions available globally for browser usage
if (typeof window !== 'undefined') {
    window.createGrid = createGrid;
    window.updateSquareState = updateSquareState;
    window.checkAdjacentSquaresForProtected = checkAdjacentSquaresForProtected;
    window.isValidStateTransition = isValidStateTransition;
    window.getSquareAtGrid = getSquareAtGrid;
    window.getSquareAtPixel = getSquareAtPixel;
    window.getSquarePixelCoordinates = getSquarePixelCoordinates;
    window.gridToPixel = gridToPixel;
    window.pixelToGrid = pixelToGrid;
    window.countSquaresByState = countSquaresByState;
    window.isAnimationComplete = isAnimationComplete;
    window.getCarveableSquaresAdjacentToProtected = getCarveableSquaresAdjacentToProtected;
    window.isAdjacentToSquareType = isAdjacentToSquareType;
    window.markIsolatedCarveableAsProtected = markIsolatedCarveableAsProtected;
    window.drawGrid = drawGrid;
    window.getGridRenderingParams = getGridRenderingParams;
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createGrid,
        updateSquareState,
        checkAdjacentSquaresForProtected,
        isValidStateTransition,
        getSquareAtGrid,
        getSquareAtPixel,
        getSquarePixelCoordinates,
        gridToPixel,
        pixelToGrid,
        countSquaresByState,
        isAnimationComplete,
        getCarveableSquaresAdjacentToProtected,
        isAdjacentToSquareType,
        markIsolatedCarveableAsProtected,
        drawGrid,
        getGridRenderingParams
    };
}
