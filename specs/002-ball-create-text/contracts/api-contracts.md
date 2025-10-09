# API Contracts: Ball Create Text Animation

**Feature**: Ball Create Text Animation  
**Date**: 2025-01-27  
**Type**: Client-side JavaScript API (no server endpoints)

## Core API Functions

### Text to Image Conversion

#### `convertTextToImage(text: string): GrayscaleImage`
**Purpose**: Convert input text to grayscale image  
**Parameters**:
- `text: string` - Input text (alphanumeric with spaces only)

**Returns**: `GrayscaleImage` object with pixel data

**Validation**:
- Text must be 1-50 characters
- Text must contain only alphanumeric characters and spaces
- Throws error for invalid input

**Example**:
```javascript
const image = convertTextToImage("Hello World");
// Returns GrayscaleImage with black text on white background
```

#### `convertToBlackWhite(grayscaleImage: GrayscaleImage): BlackWhiteImage`
**Purpose**: Convert grayscale image to binary black/white image  
**Parameters**:
- `grayscaleImage: GrayscaleImage` - Source grayscale image

**Returns**: `BlackWhiteImage` object with binary pixel data

**Validation**:
- Input must be valid GrayscaleImage
- Returns binary array where true = black (protected), false = white (carveable)

### Grid Management

#### `createGrid(blackWhiteImage: BlackWhiteImage, padding: number = 5): Grid`
**Purpose**: Create grid from binary image with padding  
**Parameters**:
- `blackWhiteImage: BlackWhiteImage` - Binary image data
- `padding: number` - Number of white squares on each side (default: 5)

**Returns**: `Grid` object with initialized squares

**Validation**:
- Padding must be non-negative integer
- Grid dimensions = image dimensions + (padding * 2)

#### `updateSquareState(grid: Grid, x: number, y: number, newState: SquareState): void`
**Purpose**: Update individual square state  
**Parameters**:
- `grid: Grid` - Grid to update
- `x: number` - Square X coordinate
- `y: number` - Square Y coordinate
- `newState: SquareState` - New state for square

**Validation**:
- Coordinates must be within grid bounds
- State transition must be valid

### Ball Management

#### `createBall(x: number, y: number, velocityX: number, velocityY: number, diameter: number): Ball`
**Purpose**: Create new ball object  
**Parameters**:
- `x: number` - Initial X position
- `y: number` - Initial Y position
- `velocityX: number` - Initial X velocity
- `velocityY: number` - Initial Y velocity
- `diameter: number` - Ball diameter

**Returns**: `Ball` object with unique ID

**Validation**:
- Position must be within canvas bounds
- Velocity must be finite numbers
- Diameter must be positive

#### `updateBallPosition(ball: Ball): void`
**Purpose**: Update ball position based on velocity  
**Parameters**:
- `ball: Ball` - Ball to update

**Side Effects**:
- Modifies ball position
- Checks for out-of-bounds conditions

#### `checkBallCollision(ball: Ball, grid: Grid): CollisionResult`
**Purpose**: Check if ball collides with grid elements  
**Parameters**:
- `ball: Ball` - Ball to check
- `grid: Grid` - Grid to check against

**Returns**: `CollisionResult` object with collision information

**CollisionResult**:
```javascript
{
  hasCollision: boolean,
  square: Square | null,
  isEdge: boolean,
  collisionPoint: {x: number, y: number}
}
```

### Ray Casting

#### `castRay(startX: number, startY: number, angle: number, grid: Grid, maxDistance: number): RayCast`
**Purpose**: Cast ray from point at angle to find intersections  
**Parameters**:
- `startX: number` - Ray start X coordinate
- `startY: number` - Ray start Y coordinate
- `angle: number` - Ray angle in radians
- `grid: Grid` - Grid to cast against
- `maxDistance: number` - Maximum ray distance

**Returns**: `RayCast` object with intersection data

#### `findOptimalBounceAngle(ball: Ball, grid: Grid, deviationRange: number): BounceAngle`
**Purpose**: Find optimal bounce angle using ray casting  
**Parameters**:
- `ball: Ball` - Ball that is bouncing
- `grid: Grid` - Current grid state
- `deviationRange: number` - Maximum deviation in degrees

**Returns**: `BounceAngle` object with calculated angle

**Algorithm**:
1. Cast rays at integer angles from -deviationRange to +deviationRange
2. Find closest intersection with carveable square
3. If no carveable square found, use random angle within range

### Animation Control

#### `startAnimation(grid: Grid, parameters: AnimationParameters): AnimationState`
**Purpose**: Start the ball carving animation  
**Parameters**:
- `grid: Grid` - Grid to animate
- `parameters: AnimationParameters` - Animation settings

**Returns**: `AnimationState` object for tracking progress

#### `updateAnimation(animationState: AnimationState): void`
**Purpose**: Update animation state for one frame  
**Parameters**:
- `animationState: AnimationState` - Current animation state

**Side Effects**:
- Updates ball positions
- Handles collisions
- Updates grid states
- Manages ball spawning/destruction

#### `stopAnimation(animationState: AnimationState): void`
**Purpose**: Stop the animation  
**Parameters**:
- `animationState: AnimationState` - Animation to stop

**Side Effects**:
- Sets isRunning to false
- Preserves current state

#### `isAnimationComplete(animationState: AnimationState): boolean`
**Purpose**: Check if animation is complete  
**Parameters**:
- `animationState: AnimationState` - Animation to check

**Returns**: `boolean` - true if all carveable squares are white

### User Interface

#### `createUIControls(container: HTMLElement): void`
**Purpose**: Create user interface controls  
**Parameters**:
- `container: HTMLElement` - DOM element to attach controls to

**Creates**:
- Ball count slider
- Deviation angle slider
- Movement speed slider
- Start/Stop buttons
- Reset button

#### `updateParametersFromUI(parameters: AnimationParameters): void`
**Purpose**: Update parameters from UI controls  
**Parameters**:
- `parameters: AnimationParameters` - Parameters to update

**Side Effects**:
- Reads values from UI controls
- Updates parameter object

## Error Handling

### Validation Errors
- `InvalidTextError`: Text input validation failed
- `InvalidCoordinatesError`: Coordinates out of bounds
- `InvalidParameterError`: Parameter value out of range

### Runtime Errors
- `AnimationError`: Animation state inconsistency
- `CollisionError`: Collision detection failure
- `RayCastError`: Ray casting algorithm failure

## Event System

### Custom Events
- `animationStarted`: Fired when animation begins
- `animationCompleted`: Fired when animation finishes
- `ballSpawned`: Fired when new ball is created
- `ballDestroyed`: Fired when ball is destroyed
- `squareCarved`: Fired when square changes from black to white

### Event Listeners
```javascript
// Example event handling
document.addEventListener('animationCompleted', (event) => {
  console.log('Animation finished!');
  showFinalResult();
});
```

## Performance Considerations

### Optimization Functions
- `optimizeGridLookup(grid: Grid): void` - Optimize grid access patterns
- `limitRayCasting(angleCount: number): number` - Limit ray casting for performance
- `batchBallUpdates(balls: Ball[]): void` - Batch ball position updates

### Memory Management
- `cleanupCompletedAnimation(animationState: AnimationState): void` - Free resources
- `reuseBallObjects(): Ball[]` - Reuse ball objects to reduce garbage collection
