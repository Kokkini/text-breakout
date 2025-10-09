# Data Model: Text to Image

**Feature**: 001-text-to-image  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Entities

### Text Input
**Purpose**: Represents user-entered text that will be converted to image

**Attributes**:
- `value`: string - The raw text input from user
- `length`: number - Character count (max 50)
- `isValid`: boolean - Whether input contains only allowed characters
- `isEmpty`: boolean - Whether input is empty or whitespace-only

**Validation Rules**:
- Must contain only alphanumeric characters (a-z, A-Z, 0-9) and spaces
- Maximum length: 50 characters
- Cannot be empty or whitespace-only for conversion

**State Transitions**:
- `empty` → `valid` (user types allowed characters)
- `valid` → `invalid` (user types disallowed characters)
- `invalid` → `valid` (user removes disallowed characters)
- `valid` → `empty` (user clears input)

### Character Image
**Purpose**: Represents individual character image files

**Attributes**:
- `character`: string - The character this image represents (a-z, 0-9)
- `filename`: string - PNG filename (e.g., "a.png", "1.png")
- `path`: string - Full path to image file
- `loaded`: boolean - Whether image has loaded successfully
- `altText`: string - Accessibility description

**Validation Rules**:
- Character must be alphanumeric (a-z, 0-9)
- Filename must match pattern: `{character}.png`
- Image file must exist in chars/ directory

**Relationships**:
- One-to-one with character in Text Input
- Part-of Composite Image

### Composite Image
**Purpose**: Represents the final composed image output

**Attributes**:
- `characters`: Array<CharacterImage> - Individual character images used
- `spacing`: number - Gap between characters in pixels
- `width`: number - Total width of composite image
- `height`: number - Height of composite image (max character height)
- `isGenerated`: boolean - Whether image has been successfully created
- `generationTime`: number - Time taken to generate in milliseconds

**Validation Rules**:
- Must contain at least one valid character image
- Width must be sum of character widths plus spacing
- Height must match tallest character image

**State Transitions**:
- `notGenerated` → `generating` (convert button clicked)
- `generating` → `generated` (successful composition)
- `generating` → `error` (composition failed)
- `generated` → `notGenerated` (new input provided)

## Data Flow

### Input Processing Flow
1. User types in text input field
2. Input validation occurs in real-time
3. Convert button state updates based on validation
4. On convert click, text is processed character by character
5. Each character maps to corresponding Character Image
6. Character Images are composed into Composite Image
7. Composite Image is displayed to user

### Character Mapping
```
Text Input: "hello"
↓
Character Array: ['h', 'e', 'l', 'l', 'o']
↓
Character Images: [h.png, e.png, l.png, l.png, o.png]
↓
Composite Image: [h][e][l][l][o] (with spacing)
```

### Error Handling
- Missing character images are skipped (not included in composition)
- Invalid characters are filtered out during processing
- Empty input prevents conversion (button disabled)
- Failed image loads are handled gracefully

## Storage Requirements

### Static Assets
- 36 character image files (a-z, 0-9) in chars/ directory
- No database or persistent storage required
- All data is transient (in-memory during session)

### Browser Storage
- No localStorage or sessionStorage required
- No cookies needed
- Stateless application design

## Performance Considerations

### Image Loading
- All character images preloaded on page initialization
- Lazy loading not needed due to small number of images
- Total image payload estimated < 100KB

### Memory Usage
- Minimal memory footprint
- Character images cached in browser
- No large data structures required

### Processing Time
- Text processing: < 1ms for 50 characters
- Image composition: < 100ms for typical input
- Total conversion time target: < 3 seconds
