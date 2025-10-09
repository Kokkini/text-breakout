# Data Model: Ball Create Text Animation

**Feature**: Ball Create Text Animation  
**Date**: 2025-01-27

## Core Entities

### GrayscaleImage
**Purpose**: Original text image with black text on white background  
**Fields**:
- `width: number` - Image width in pixels
- `height: number` - Image height in pixels
- `pixels: Uint8Array` - Grayscale pixel data (0-255 values)
- `text: string` - Original input text

**Validation Rules**:
- Width and height must be positive integers
- Pixels array length must equal width * height
- Text must be alphanumeric with spaces only

### BlackWhiteImage
**Purpose**: Converted binary image used to determine grid square types  
**Fields**:
- `width: number` - Image width in pixels
- `height: number` - Image height in pixels
- `pixels: boolean[]` - Binary pixel data (true = black/protected, false = white/carveable)

**Validation Rules**:
- Width and height must match source GrayscaleImage
- Pixels array length must equal width * height
- All values must be boolean

### Grid
**Purpose**: 2D array of squares representing the converted image resolution with padding  
**Fields**:
- `width: number` - Grid width in squares (image width + 10 for padding)
- `height: number` - Grid height in squares (image height + 10 for padding)
- `squares: Square[][]` - 2D array of grid squares
- `padding: number` - Number of white squares on each side (default: 5)

**Validation Rules**:
- Width and height must be positive integers
- Squares array dimensions must match width * height
- Padding must be non-negative integer

### Square
**Purpose**: Individual grid cell that can be black (carveable), black (protected), or white (carved/edge)  
**Fields**:
- `x: number` - Grid X coordinate
- `y: number` - Grid Y coordinate
- `state: SquareState` - Current state of the square
- `type: SquareType` - Original type (carveable, protected, edge)

**Validation Rules**:
- X and Y must be within grid bounds
- State must be valid SquareState enum value
- Type must be valid SquareType enum value

### SquareState (Enum)
- `BLACK_CARVEABLE` - Black square that can be carved (turned white)
- `BLACK_PROTECTED` - Black square that should not be carved (text pattern)
- `WHITE_CARVED` - White square that has been carved
- `WHITE_EDGE` - White square that is part of the edge padding

### SquareType (Enum)
- `CARVEABLE` - Originally carveable background area
- `PROTECTED` - Originally protected text area
- `EDGE` - Edge padding area

### Ball
**Purpose**: Animated object with position, velocity, collision detection, and diameter equal to half the grid square edge length  
**Fields**:
- `id: string` - Unique identifier
- `x: number` - Current X position in pixels
- `y: number` - Current Y position in pixels
- `velocityX: number` - X velocity in pixels per frame
- `velocityY: number` - Y velocity in pixels per frame
- `diameter: number` - Ball diameter in pixels (half of square edge length)
- `isActive: boolean` - Whether ball is currently active in animation

**Validation Rules**:
- ID must be unique string
- Position must be within canvas bounds
- Velocity must be finite numbers
- Diameter must be positive number
- IsActive must be boolean

### RayCast
**Purpose**: Line projection from bounce point or carveable square at specific angle to find intersection with grid squares or edges  
**Fields**:
- `startX: number` - Starting X coordinate
- `startY: number` - Starting Y coordinate
- `angle: number` - Ray angle in radians
- `maxDistance: number` - Maximum ray distance
- `intersections: Intersection[]` - Array of intersection points

**Validation Rules**:
- Start coordinates must be within bounds
- Angle must be valid radian value
- MaxDistance must be positive number

### Intersection
**Purpose**: Point where ray intersects with grid element  
**Fields**:
- `x: number` - Intersection X coordinate
- `y: number` - Intersection Y coordinate
- `distance: number` - Distance from ray start
- `square: Square` - Intersected square
- `isEdge: boolean` - Whether intersection is with grid edge

**Validation Rules**:
- Coordinates must be within bounds
- Distance must be non-negative
- Square must be valid Square object

### BounceAngle
**Purpose**: Calculated angle for ball reflection, either optimal (via ray casting) or random within deviation range  
**Fields**:
- `angle: number` - Reflection angle in radians
- `isOptimal: boolean` - Whether angle was calculated via ray casting
- `deviation: number` - Deviation from perfect reflection in degrees
- `targetSquare: Square | null` - Target square if optimal

**Validation Rules**:
- Angle must be valid radian value
- Deviation must be within specified range (default: ±20 degrees)
- IsOptimal must be boolean

### AnimationState
**Purpose**: Current progress of the carving process and ball management  
**Fields**:
- `isRunning: boolean` - Whether animation is currently running
- `isComplete: boolean` - Whether animation has completed
- `frameCount: number` - Current frame number
- `carveableSquaresRemaining: number` - Count of remaining carveable squares
- `ballsActive: number` - Number of currently active balls
- `totalBallsSpawned: number` - Total balls spawned during animation

**Validation Rules**:
- FrameCount must be non-negative integer
- CarveableSquaresRemaining must be non-negative integer
- BallsActive must be non-negative integer
- TotalBallsSpawned must be non-negative integer

### AnimationParameters
**Purpose**: User-configurable settings including ball count (default 20), deviation angle (default 20 degrees), and movement speed (default customizable)  
**Fields**:
- `ballCount: number` - Number of balls to spawn (default: 20)
- `deviationAngle: number` - Maximum deviation angle in degrees (default: 20)
- `movementSpeed: number` - Ball movement speed multiplier (default: 1.0)
- `enableCustomization: boolean` - Whether user can modify parameters

**Validation Rules**:
- BallCount must be positive integer (1-100)
- DeviationAngle must be positive number (1-45 degrees)
- MovementSpeed must be positive number (0.1-5.0)
- EnableCustomization must be boolean

## State Transitions

### Square State Transitions
1. `BLACK_CARVEABLE` → `WHITE_CARVED` (when ball collides)
2. `BLACK_PROTECTED` → `BLACK_PROTECTED` (unchanged, ball destroyed)
3. `WHITE_EDGE` → `WHITE_EDGE` (unchanged, ball bounces)
4. `WHITE_CARVED` → `WHITE_CARVED` (unchanged, ball passes through)

### Ball Lifecycle
1. **Spawn**: Ball created at edge position with calculated velocity
2. **Active**: Ball moves and collides with grid elements
3. **Destroyed**: Ball hits protected square or goes out of bounds
4. **Respawn**: New ball spawned to replace destroyed ball

### Animation State Transitions
1. **Initialized**: Animation parameters set, grid created
2. **Running**: Balls active, grid being carved
3. **Complete**: All carveable squares turned white
4. **Stopped**: User manually stops animation

## Relationships

### Grid ↔ Square
- One-to-many: Grid contains multiple Square objects
- Grid manages square positions and states

### Ball ↔ Square
- Many-to-many: Balls can interact with multiple squares
- Squares can be hit by multiple balls

### RayCast ↔ Intersection
- One-to-many: RayCast can have multiple intersections
- Intersection belongs to one RayCast

### AnimationState ↔ Ball
- One-to-many: AnimationState tracks multiple Ball objects
- Ball belongs to one AnimationState

### AnimationParameters ↔ AnimationState
- One-to-one: Parameters control animation behavior
- State reflects current parameter values
