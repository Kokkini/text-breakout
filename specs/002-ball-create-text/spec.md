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

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ball Animation System (Priority: P1)

A user wants to see an animated ball carving effect that gradually reveals text by bouncing balls that turn black squares white.

**Why this priority**: This is the core visual effect that delivers the primary entertainment value and demonstrates the text carving concept.

**Independent Test**: Can be fully tested by converting text to image, then watching the ball animation carve out the text pattern through bouncing and collision mechanics.

**Acceptance Scenarios**:

1. **Given** a user has converted text to image, **When** the animation starts, **Then** they see a grid of black squares with white edges and bouncing balls
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
2. **Given** balls are bouncing in the animation, **When** a ball hits a black square that should not be carved, **Then** the ball is destroyed and a new ball spawns aimed at a carveable square
3. **Given** a ball is destroyed, **When** a new ball spawns, **Then** it appears at an edge position determined by ray casting from carveable squares and aims in the ray direction

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

1. **Given** a user has converted text to image, **When** they want to customize the animation, **Then** they can adjust the number of balls, deviation angle, and movement speed before starting
2. **Given** a user has customized animation settings, **When** the animation starts, **Then** it uses the specified number of balls, deviation angle, and movement speed
3. **Given** a user wants to reset to defaults, **When** they click a reset button, **Then** the settings return to default values for all parameters

### Edge Cases

- What happens when all balls get destroyed and no new balls can spawn effectively? → Use ray casting from remaining carveable squares to find viable spawn positions
- What happens if the text pattern has isolated black squares that are hard to reach? → Mark as protected if all adjacent squares are protected, otherwise assume reachable 

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST convert the original grayscale text image (black text on white background) to a black and white image
- **FR-002**: System MUST create a grid of squares matching the resolution of the converted black and white image
- **FR-003**: System MUST initialize grid squares as black where the black and white image has black pixels (protected text areas)
- **FR-004**: System MUST initialize grid squares as black where the black and white image has white pixels (carveable background areas)
- **FR-005**: System MUST add 5 white squares as padding on all sides of the grid to create edges
- **FR-006**: System MUST initialize multiple black balls around the grid edges with diameter equal to half the edge length of each grid square (default 20 balls, user customizable)
- **FR-007**: System MUST animate balls bouncing around the grid with physics-based movement (default speed user customizable)
- **FR-008**: System MUST turn black squares white when balls collide with them
- **FR-009**: System MUST allow balls to move freely through white squares without changing them
- **FR-010**: System MUST make balls bounce off grid edges with calculated optimal angles using ray casting
- **FR-011**: System MUST use ray casting at integer angles from -X to +X degrees to find closest intersection with carveable squares (default 20 degrees, user customizable)
- **FR-012**: System MUST use random angle within -X to +X degree range when no optimal bounce angle is found (default 20 degrees, user customizable)
- **FR-013**: System MUST prioritize ball targeting: carveable black squares > grid edges > protected black squares
- **FR-014**: System MUST destroy balls that hit protected black squares (text pattern squares)
- **FR-015**: System MUST spawn new balls at edge positions when balls are destroyed using ray casting from carveable squares to find viable spawn locations
- **FR-016**: System MUST aim new balls using ray direction from carveable squares to edge intersections as the spawn angle
- **FR-017**: System MUST check each frame if any carveable black squares remain and stop animation when none are found
- **FR-018**: System MUST display the final text pattern when animation completes
- **FR-019**: System MUST allow users to skip or stop the animation to see final result
- **FR-021**: System MUST provide user controls to customize number of balls, deviation angle, and movement speed before starting animation
- **FR-022**: System MUST use ray casting from remaining carveable squares to find viable spawn positions when all balls are destroyed
- **FR-023**: System MUST mark isolated carveable squares as protected if all adjacent squares are protected, otherwise assume they are reachable
- **FR-024**: System MUST integrate ball animation functionality into the existing single-page application structure, using a single index.html at the root that combines text-to-image conversion and animation features
- **FR-025**: System MUST use the Eutopia font (assets/Eutopia/Eutopia.otf) for text rendering in the animation to maintain consistent typography with custom character images

### Key Entities *(include if feature involves data)*

- **Grayscale Image**: Original text image with black text on white background
- **Black and White Image**: Converted binary image used to determine grid square types
- **Grid**: 2D array of squares representing the converted image resolution with padding
- **Ball**: Animated object with position, velocity, collision detection, and diameter equal to half the grid square edge length
- **Square**: Individual grid cell that can be black (carveable), black (protected), or white (carved/edge)
- **Ray Cast**: Line projection from bounce point or carveable square at specific angle to find intersection with grid squares or edges
- **Bounce Angle**: Calculated angle for ball reflection, either optimal (via ray casting) or random within deviation range
- **Animation State**: Current progress of the carving process and ball management
- **Animation Parameters**: User-configurable settings including ball count (default 20), deviation angle (default 20 degrees), and movement speed (default customizable)
- **Eutopia Font**: Custom font file (assets/Eutopia/Eutopia.otf) used for text rendering to maintain consistent typography with character images

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Balls successfully carve out 95% of non-text black squares without destroying text pattern
- **SC-002**: Users can successfully view the final carved text pattern 100% of the time
- **SC-003**: Ball targeting accuracy results in less than 5% of balls hitting protected text squares
- **SC-004**: Application maintains unified user experience with single entry point (index.html) that seamlessly integrates text-to-image conversion and ball animation functionality
- **SC-005**: Text rendering in animation uses Eutopia font consistently, maintaining visual consistency with custom character images