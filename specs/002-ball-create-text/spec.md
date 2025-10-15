# Feature Specification: Ball Create Text

**Feature Branch**: `002-ball-create-text`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "ball create text: after creating the image, don't show the image immediately but create a grid of black squares. The number of squares should be equal to the number of resolution of the image. Add 5 white squares to each side of the grid to create white edges. Initialize N black balls around the edge of the grid and let them start bouncing around. Every time the black ball hit the outer edge of the grid it will bounce off. If it hits a black square, the square will turn white. The black balls can move freely on white squares. The goal is for the ball to gradually carve out the text message on the grid. To make this easier, every time a ball bounce, it does not need to be a perfect reflection, it has the freedom to deviate X degree so that the next thing it hits is a black square that needs to be carved and not a black square that belong to the final text. So, the priority from high to low is black squares that need to be carved, grid's edges, black square that should not be carved. If the ball collides with a square that must not be carved, don't turn the square into a white square, but destroy the ball instead and create a new ball at the edge and aim it at a square that needs to be carved. You can choose where to spawn on the edge to spawn the new ball so that it can hit the square that needs to be hit."

## Clarifications

### Session 2025-01-27

- Q: How should ball trajectory be controlled during flight? → A: Ball trajectory remains constant during flight; only changes during bounces
- Q: How should optimal bounce angles be determined? → A: Use ray casting at integer angles from -X to +X degrees to find closest intersection with carveable squares
- Q: What happens when no optimal bounce angle is found? → A: Use random angle within -X to +X degree range from perfect reflection
- Q: How are carveable vs protected squares determined? → A: Original grayscale image (black text on white background) is converted to black and white; protected squares correspond to black pixels (text), carveable squares correspond to white pixels (background)
- Q: What should be the size of the balls relative to the grid squares? → A: Ball diameter should be half the edge length of each grid square
- Q: What should be the default number of balls and maximum deviation angle? → A: Default 20 balls, 20 degree deviation, but allow user customization
- Q: How should ball movement speed be controlled? → A: Pick a default speed but let user customize
- Q: What should happen when all balls get destroyed and no new balls can spawn effectively? → A: Ray cast from remaining carveable squares to see if any ray hits an edge before hitting a protected square
- Q: How should new ball spawn position and angle be determined? → A: Ray cast from remaining carveable squares to find edge intersections, use intersection point as spawn location and ray direction as spawn angle
- Q: How should the system determine when the animation is complete? → A: Check each frame if any carveable black squares remain
- Q: How should performance issues be handled? → A: Remove performance requirement
- Q: How should isolated carveable squares be handled? → A: If all squares adjacent to that square is protected, then mark it as protected. Else, the text image already ensures that the square is reachable
- Q: How should the application structure be organized? → A: Use a single index.html at the root that integrates both text-to-image conversion and ball animation functionality, building upon existing application structure rather than creating parallel systems
- Q: What font should be used for text rendering in the animation? → A: Use the Eutopia font located in assets/Eutopia/Eutopia.otf for consistent typography with the custom character images
- Q: How should the user workflow be simplified? → A: Remove the convert to image step; users input text and directly start animation, with text rendering handled internally using the Eutopia font
- Q: How should the canvas size be determined for text rendering? → A: Canvas size should be dynamically calculated based on the actual text dimensions to maintain proper aspect ratio and prevent text distortion
- Q: How should white space around text be minimized? → A: Canvas should have minimal padding around the text to maximize text visibility and reduce unnecessary white space
- Q: What should happen when balls hit protected squares (text)? → A: Balls should bounce off protected squares normally without being destroyed, maintaining the text pattern as a solid obstacle that deflects balls
- Q: How should users share their custom animations with others? → A: Implement URL parameter support with a "Share" button that generates shareable URLs containing all configuration (viewer mode, ball count, deviation, speed, font size, text)
- Q: What display modes should be supported for shared URLs? → A: Support viewer mode (`viewer=true`) for clean presentation with auto-start and a "Create your own" button, and editor mode (`viewer=false` or omitted) with full controls visible
- Q: How should the transition from viewer to editor mode work? → A: Clicking "Create your own" reveals controls without reloading the page or stopping the animation, providing seamless transition

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ball Animation System (Priority: P1)

A user wants to see an animated ball carving effect that gradually reveals text by bouncing balls that turn black squares white.

**Why this priority**: This is the core visual effect that delivers the primary entertainment value and demonstrates the text carving concept.

**Independent Test**: Can be fully tested by entering text and starting animation, then watching the ball animation carve out the text pattern through bouncing and collision mechanics.

**Acceptance Scenarios**:

1. **Given** a user has entered text, **When** the animation starts, **Then** they see a grid of black squares with white edges and bouncing balls
2. **Given** balls are bouncing in the animation, **When** a ball hits a black square, **Then** the square turns white
3. **Given** balls are bouncing in the animation, **When** a ball hits the grid edge, **Then** the ball bounces off with some deviation angle
4. **Given** the animation is running, **When** balls move across white squares, **Then** they pass through freely without changing the squares

---

### User Story 2 - Smart Ball Targeting (Priority: P2)

The system needs to intelligently guide balls to carve out the correct text pattern while avoiding protected areas.

**Why this priority**: This enables the core functionality by ensuring balls target the right squares and avoid destroying the final text pattern.

**Independent Test**: Can be fully tested by observing that balls prioritize carving non-text black squares and avoid hitting text-pattern black squares.

**Acceptance Scenarios**:

1. **Given** balls are bouncing in the animation, **When** a ball bounces off an edge, **Then** the bounce angle is calculated using ray casting to find optimal trajectory toward carveable squares
2. **Given** balls are bouncing in the animation, **When** a ball hits a black square that should not be carved (protected text), **Then** the ball bounces off normally without being destroyed
3. **Given** balls are bouncing in the animation, **When** a ball hits a protected square, **Then** the ball uses smart ray casting to determine the optimal bounce angle

---

### User Story 3 - Animation Completion and Display (Priority: P3)

Users need to see the final result and understand when the text carving is complete.

**Why this priority**: This provides closure and satisfaction by showing the completed text pattern and allowing users to interact with the result.

**Independent Test**: Can be fully tested by waiting for the animation to complete and verifying the final text pattern matches the original input.

**Acceptance Scenarios**:

1. **Given** the animation is running, **When** all carveable black squares have been turned white, **Then** the animation stops and shows the final text pattern
2. **Given** the animation has completed, **When** a user wants to try different text, **Then** they can clear and start a new conversion
3. **Given** the animation is running, **When** a user wants to skip the animation, **Then** they can stop the animation and see the final result immediately

---

### User Story 4 - Animation Customization (Priority: P4)

Users want to customize the animation parameters to control the carving speed and visual effect.

**Why this priority**: This provides user control and personalization options for the animation experience.

**Independent Test**: Can be fully tested by adjusting ball count and deviation angle settings and observing the resulting animation behavior.

**Acceptance Scenarios**:

1. **Given** a user has entered text, **When** they want to customize the animation, **Then** they can adjust the number of balls, deviation angle, and movement speed before starting
2. **Given** a user has customized animation settings, **When** the animation starts, **Then** it uses the specified number of balls, deviation angle, and movement speed
3. **Given** a user wants to reset to defaults, **When** they click a reset button, **Then** the settings return to default values for all parameters

---

### User Story 5 - Configuration Sharing (Priority: P5)

Users want to share their custom animations with others via URL parameters, with options for clean viewer mode or editable configurations.

**Why this priority**: This enables social sharing and collaboration, allowing users to showcase their creations and let others remix them.

**Independent Test**: Can be fully tested by generating a shareable URL, opening it in a new browser window, and verifying the configuration is applied correctly.

**Acceptance Scenarios**:

1. **Given** a user has configured animation settings and text, **When** they click the "Share" button, **Then** a URL with all configuration parameters is copied to their clipboard
2. **Given** a user opens a shared URL with `viewer=true`, **When** the page loads, **Then** the title changes to "You've got a message", only the animation canvas and title are visible, and a "Create your own" button is displayed below the canvas
3. **Given** a user is in viewer mode, **When** they click "Create your own", **Then** the title restores to the original text and controls appear without reloading the page while the animation continues
4. **Given** a user opens a shared URL with `viewer=false`, **When** the page loads, **Then** all controls are visible with the shared configuration pre-loaded
5. **Given** a user opens a URL with configuration parameters, **When** the page loads, **Then** the animation settings are applied from URL parameters (balls, deviation, speed, fontSize, text)

### Edge Cases

- What happens when all balls get destroyed and no new balls can spawn effectively? → Use ray casting from remaining carveable squares to find viable spawn positions
- What happens if the text pattern has isolated black squares that are hard to reach? → Mark as protected if all adjacent squares are protected, otherwise assume reachable
- What happens when URL parameters contain invalid values? → Validate all parameters and fall back to default values for any invalid or out-of-range parameters
- What happens when a URL has configuration parameters but no viewer parameter? → Show full interface with controls, pre-loading the configuration from URL parameters
- What happens if clipboard access is denied when clicking "Share"? → Use fallback method (document.execCommand) and show appropriate error notification if both methods fail 

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST generate a text image using the Eutopia font from user input text
- **FR-002**: System MUST convert the generated text image to a black and white image for grid creation
- **FR-003**: System MUST create a grid of squares matching the resolution of the converted black and white image
- **FR-004**: System MUST initialize grid squares as black where the black and white image has black pixels (protected text areas)
- **FR-005**: System MUST initialize grid squares as black where the black and white image has white pixels (carveable background areas)
- **FR-006**: System MUST add 5 white squares as padding on all sides of the grid to create edges
- **FR-007**: System MUST initialize multiple black balls around the grid edges with diameter equal to half the edge length of each grid square (default 20 balls, user customizable)
- **FR-008**: System MUST animate balls bouncing around the grid with physics-based movement (default speed user customizable)
- **FR-009**: System MUST turn black squares white when balls collide with them
- **FR-010**: System MUST allow balls to move freely through white squares without changing them
- **FR-011**: System MUST make balls bounce off grid edges with calculated optimal angles using ray casting
- **FR-012**: System MUST use ray casting at integer angles from -X to +X degrees to find closest intersection with carveable squares (default 20 degrees, user customizable)
- **FR-013**: System MUST use random angle within -X to +X degree range when no optimal bounce angle is found (default 20 degrees, user customizable)
- **FR-014**: System MUST prioritize ball targeting: carveable black squares > grid edges > protected black squares
- **FR-015**: System MUST make balls bounce off protected black squares (text pattern squares) without destroying them
- **FR-016**: System MUST use smart ray casting to determine optimal bounce angles when balls hit protected squares
- **FR-017**: System MUST maintain protected squares as solid obstacles that deflect balls while preserving the text pattern
- **FR-018**: System MUST check each frame if any carveable black squares remain and stop animation when none are found
- **FR-019**: System MUST display the final text pattern when animation completes
- **FR-020**: System MUST allow users to skip or stop the animation to see final result
- **FR-021**: System MUST provide user controls to customize number of balls, deviation angle, and movement speed before starting animation
- **FR-022**: System MUST use ray casting from remaining carveable squares to find viable spawn positions when all balls are destroyed
- **FR-023**: System MUST mark isolated carveable squares as protected if all adjacent squares are protected, otherwise assume they are reachable
- **FR-024**: System MUST integrate ball animation functionality into the existing single-page application structure, using a single index.html at the root that combines text input and animation features
- **FR-025**: System MUST use the Eutopia font (assets/Eutopia/Eutopia.otf) for text rendering in the animation to maintain consistent typography
- **FR-026**: System MUST provide a simplified user workflow where users input text and directly start animation without a separate convert step
- **FR-027**: System MUST dynamically calculate canvas dimensions based on actual text measurements to maintain proper aspect ratio and prevent text distortion
- **FR-028**: System MUST minimize white space around text by using minimal padding to maximize text visibility and reduce unnecessary canvas area
- **FR-029**: System MUST support URL parameters for configuration sharing, including: viewer mode (`viewer`), ball count (`balls`/`ballCount`/`numBalls`), deviation angle (`deviation`/`deviationAngle`/`angle`), movement speed (`speed`/`movementSpeed`), font size (`fontSize`/`textResolution`/`resolution`), and text content (`text`)
- **FR-030**: System MUST provide a "Share" button that generates a shareable URL with `viewer=true` and current configuration parameters, copying it to the user's clipboard
- **FR-031**: System MUST enter viewer mode when `viewer=true` is present in URL parameters, changing the title to "You've got a message", hiding all controls, and showing only the animation canvas, title, and a "Create your own" button below the canvas
- **FR-032**: System MUST auto-start the animation when in viewer mode with the configuration from URL parameters
- **FR-033**: System MUST reveal all controls and restore the original title when the "Create your own" button is clicked in viewer mode, without reloading the page or stopping the animation
- **FR-034**: System MUST show all controls with pre-loaded configuration when `viewer=false` is in URL parameters or when URL parameters are present without a viewer parameter
- **FR-035**: System MUST validate URL parameter values and ignore invalid parameters, falling back to defaults for missing or invalid values
- **FR-036**: System MUST support multiple naming conventions for URL parameters (e.g., `balls`, `ballCount`, `numBalls`) for user convenience

### Key Entities *(include if feature involves data)*

- **Text Input**: User-entered text that gets rendered using the Eutopia font
- **Text Measurement**: Process of calculating actual text dimensions using font metrics to determine proper canvas size
- **Minimal Padding**: Minimal white space around text to maximize text visibility and reduce unnecessary canvas area
- **Generated Text Image**: Text image created from user input using the Eutopia font with dynamically calculated dimensions and minimal padding
- **Black and White Image**: Converted binary image used to determine grid square types
- **Grid**: 2D array of squares representing the converted image resolution with padding
- **Ball**: Animated object with position, velocity, collision detection, and diameter equal to half the grid square edge length
- **Square**: Individual grid cell that can be black (carveable), black (protected), or white (carved/edge)
- **Ray Cast**: Line projection from bounce point or carveable square at specific angle to find intersection with grid squares or edges
- **Bounce Angle**: Calculated angle for ball reflection, either optimal (via ray casting) or random within deviation range
- **Animation State**: Current progress of the carving process and ball management
- **Animation Parameters**: User-configurable settings including ball count (default 20), deviation angle (default 20 degrees), and movement speed (default customizable)
- **Eutopia Font**: Custom font file (assets/Eutopia/Eutopia.otf) used for text rendering to maintain consistent typography with character images
- **URL Configuration**: Configuration data encoded in URL parameters for sharing animations (viewer mode, ball count, deviation angle, movement speed, font size, text content)
- **Viewer Mode**: Display mode controlled by `viewer=true` URL parameter that shows only animation with a "Create your own" button, hiding all controls initially
- **Editor Mode**: Display mode when `viewer=false` or viewer parameter is omitted, showing full interface with controls pre-loaded from URL parameters
- **Share Button**: UI control that generates a shareable URL with `viewer=true` and current configuration, copying it to clipboard with visual feedback

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Balls successfully carve out 95% of non-text black squares while bouncing off protected text squares
- **SC-002**: Users can successfully view the final carved text pattern 100% of the time
- **SC-003**: Protected text squares remain intact and visible throughout the animation, serving as solid obstacles that deflect balls
- **SC-004**: Application maintains unified user experience with single entry point (index.html) that seamlessly integrates text input and ball animation functionality
- **SC-005**: Text rendering in animation uses Eutopia font consistently, maintaining visual consistency
- **SC-006**: Users can successfully start animation directly from text input without requiring a separate convert step
- **SC-007**: Canvas dimensions are dynamically calculated to maintain proper text aspect ratio without distortion for any text length or content
- **SC-008**: Text canvas has minimal white space around the text to maximize text visibility and reduce unnecessary canvas area
- **SC-009**: Users can successfully generate and copy shareable URLs with their custom configurations 100% of the time
- **SC-010**: Shared URLs with `viewer=true` successfully load in viewer mode (clean view without controls) and auto-start the animation
- **SC-011**: Clicking "Create your own" in viewer mode reveals controls without page reload or animation interruption 100% of the time
- **SC-012**: URL parameter configurations are accurately applied to animation settings with proper validation and fallback to defaults for invalid values