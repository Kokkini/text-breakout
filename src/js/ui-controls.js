/**
 * UI Controls Module
 * Handles user interface controls and parameter management
 */

/**
 * Initialize UI controls and event listeners
 */
function initializeUIControls() {
    try {
        // Set up parameter controls
        setupParameterControls();
        
        // Set up button controls
        setupButtonControls();
        
        // Set up text input validation
        setupTextInputValidation();
        
        // Initialize parameter displays
        updateParameterDisplays();
        
        console.log('UI controls initialized successfully');
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'initializeUIControls' });
    }
}

/**
 * Set up parameter control sliders
 */
function setupParameterControls() {
    try {
        // Ball count slider
        const ballCountSlider = document.getElementById('ball-count');
        const ballCountValue = document.getElementById('ball-count-value');
        
        if (ballCountSlider && ballCountValue) {
            ballCountSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                ballCountValue.textContent = value;
                if (animationParameters) {
                    animationParameters.ballCount = value;
                }
            });
        }
        
        // Deviation angle slider
        const deviationAngleSlider = document.getElementById('deviation-angle');
        const deviationAngleValue = document.getElementById('deviation-angle-value');
        
        if (deviationAngleSlider && deviationAngleValue) {
            deviationAngleSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                deviationAngleValue.textContent = value + '°';
                if (animationParameters) {
                    animationParameters.deviationAngle = value;
                }
            });
        }
        
        // Movement speed slider
        const movementSpeedSlider = document.getElementById('movement-speed');
        const movementSpeedValue = document.getElementById('movement-speed-value');
        
        if (movementSpeedSlider && movementSpeedValue) {
            movementSpeedSlider.addEventListener('input', function() {
                const value = parseFloat(this.value);
                movementSpeedValue.textContent = value.toFixed(1) + 'x';
                if (animationParameters) {
                    animationParameters.movementSpeed = value;
                }
            });
        }
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'setupParameterControls' });
    }
}

/**
 * Set up button controls
 */
function setupButtonControls() {
    try {
        // Start button - handled by app.js, no need to duplicate here
        
        // Stop button
        const stopBtn = document.getElementById('stop-btn');
        if (stopBtn) {
            stopBtn.addEventListener('click', stopAnimation);
        }
        
        // Skip button
        const skipBtn = document.getElementById('skip-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', skipAnimation);
        }
        
        // Reset button
        const resetBtn = document.getElementById('clear-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetAnimation);
        }
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'setupButtonControls' });
    }
}

/**
 * Set up text input validation
 */
function setupTextInputValidation() {
    try {
        const textInput = document.getElementById('text-input');
        if (textInput) {
            // Real-time validation
            textInput.addEventListener('input', function() {
                validateTextInput(this);
            });
            
            // Prevent invalid characters
            textInput.addEventListener('keypress', function(e) {
                const char = String.fromCharCode(e.which);
                const validPattern = /[a-zA-Z0-9\s]/;
                
                if (!validPattern.test(char) && e.which !== 8 && e.which !== 13) {
                    e.preventDefault();
                }
            });
            
            // Handle Enter key - handled by app.js, no need to duplicate here
        }
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'setupTextInputValidation' });
    }
}

/**
 * Validate text input
 */
function validateTextInput(inputElement) {
    try {
        const text = inputElement.value;
        const maxLength = 50;
        
        // Check length
        if (text.length > maxLength) {
            inputElement.value = text.substring(0, maxLength);
            showInputError('Text cannot exceed 50 characters');
            return false;
        }
        
        // Check for valid characters
        const validPattern = /^[a-zA-Z0-9\s]*$/;
        if (!validPattern.test(text)) {
            showInputError('Text can only contain letters, numbers, and spaces');
            return false;
        }
        
        // Clear any previous errors
        clearInputError();
        return true;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'validateTextInput' });
        return false;
    }
}

/**
 * Show input error message
 */
function showInputError(message) {
    try {
        // Remove existing error message
        clearInputError();
        
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'input-error';
        errorElement.textContent = message;
        errorElement.style.color = '#f44336';
        errorElement.style.fontSize = '0.8em';
        errorElement.style.marginTop = '4px';
        
        // Insert after text input
        const textInput = document.getElementById('text-input');
        if (textInput && textInput.parentNode) {
            textInput.parentNode.insertBefore(errorElement, textInput.nextSibling);
        }
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'showInputError' });
    }
}

/**
 * Clear input error message
 */
function clearInputError() {
    try {
        const existingError = document.querySelector('.input-error');
        if (existingError) {
            existingError.remove();
        }
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'clearInputError' });
    }
}

/**
 * Update parameter display values
 */
function updateParameterDisplays() {
    try {
        if (!animationParameters) {
            return;
        }
        
        // Update ball count display
        const ballCountValue = document.getElementById('ball-count-value');
        if (ballCountValue) {
            ballCountValue.textContent = animationParameters.ballCount;
        }
        
        // Update deviation angle display
        const deviationAngleValue = document.getElementById('deviation-angle-value');
        if (deviationAngleValue) {
            deviationAngleValue.textContent = animationParameters.deviationAngle + '°';
        }
        
        // Update movement speed display
        const movementSpeedValue = document.getElementById('movement-speed-value');
        if (movementSpeedValue) {
            movementSpeedValue.textContent = animationParameters.movementSpeed.toFixed(1) + 'x';
        }
        
        // Update slider values
        const ballCountSlider = document.getElementById('ball-count');
        if (ballCountSlider) {
            ballCountSlider.value = animationParameters.ballCount;
        }
        
        const deviationAngleSlider = document.getElementById('deviation-angle');
        if (deviationAngleSlider) {
            deviationAngleSlider.value = animationParameters.deviationAngle;
        }
        
        const movementSpeedSlider = document.getElementById('movement-speed');
        if (movementSpeedSlider) {
            movementSpeedSlider.value = animationParameters.movementSpeed;
        }
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'updateParameterDisplays' });
    }
}

/**
 * Update parameters from UI controls
 */
function updateParametersFromUI() {
    try {
        // Get values from UI controls
        const ballCountSlider = document.getElementById('ball-count');
        const deviationAngleSlider = document.getElementById('deviation-angle');
        const movementSpeedSlider = document.getElementById('movement-speed');
        
        if (!animationParameters) {
            animationParameters = new AnimationParameters();
        }
        
        if (ballCountSlider) {
            animationParameters.ballCount = parseInt(ballCountSlider.value);
        }
        
        if (deviationAngleSlider) {
            animationParameters.deviationAngle = parseInt(deviationAngleSlider.value);
        }
        
        if (movementSpeedSlider) {
            animationParameters.movementSpeed = parseFloat(movementSpeedSlider.value);
        }
        
        // Validate parameters
        animationParameters.validate();
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'updateParametersFromUI' });
    }
}

/**
 * Reset parameters to defaults
 */
function resetParametersToDefaults() {
    try {
        if (!animationParameters) {
            animationParameters = new AnimationParameters();
        }
        animationParameters.resetToDefaults();
        updateParameterDisplays();
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'resetParametersToDefaults' });
    }
}

/**
 * Enable/disable parameter controls
 */
function setParameterControlsEnabled(enabled) {
    try {
        const controls = [
            'ball-count',
            'deviation-angle', 
            'movement-speed'
        ];
        
        controls.forEach(controlId => {
            const control = document.getElementById(controlId);
            if (control) {
                control.disabled = !enabled;
            }
        });
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'setParameterControlsEnabled' });
    }
}

/**
 * Show/hide advanced controls
 */
function toggleAdvancedControls(show) {
    try {
        const advancedControls = document.querySelectorAll('.advanced-control');
        advancedControls.forEach(control => {
            control.style.display = show ? 'block' : 'none';
        });
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'toggleAdvancedControls' });
    }
}

/**
 * Create parameter presets
 */
function createParameterPresets() {
    try {
        const presets = {
            'fast': { ballCount: 30, deviationAngle: 30, movementSpeed: 2.0 },
            'slow': { ballCount: 10, deviationAngle: 10, movementSpeed: 0.5 },
            'precise': { ballCount: 15, deviationAngle: 5, movementSpeed: 1.0 },
            'chaotic': { ballCount: 40, deviationAngle: 45, movementSpeed: 3.0 }
        };
        
        return presets;
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'createParameterPresets' });
        return {};
    }
}

/**
 * Apply parameter preset
 */
function applyParameterPreset(presetName) {
    try {
        const presets = createParameterPresets();
        const preset = presets[presetName];
        
        if (preset) {
            animationParameters.ballCount = preset.ballCount;
            animationParameters.deviationAngle = preset.deviationAngle;
            animationParameters.movementSpeed = preset.movementSpeed;
            
            updateParameterDisplays();
            
            console.log('Applied preset:', presetName);
        }
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'applyParameterPreset' });
    }
}

/**
 * Get current parameter values
 */
function getCurrentParameters() {
    try {
        if (!animationParameters) {
            return {
                ballCount: 20,
                deviationAngle: 20,
                movementSpeed: 1.0
            };
        }
        
        return {
            ballCount: animationParameters.ballCount,
            deviationAngle: animationParameters.deviationAngle,
            movementSpeed: animationParameters.movementSpeed
        };
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'getCurrentParameters' });
        return {
            ballCount: 20,
            deviationAngle: 20,
            movementSpeed: 1.0
        };
    }
}

/**
 * Set parameter values programmatically
 */
function setParameters(ballCount, deviationAngle, movementSpeed) {
    try {
        if (!animationParameters) {
            animationParameters = new AnimationParameters();
        }
        
        if (ballCount !== undefined) {
            ValidationHelper.validateBallCount(ballCount);
            animationParameters.ballCount = ballCount;
        }
        
        if (deviationAngle !== undefined) {
            ValidationHelper.validateDeviationAngle(deviationAngle);
            animationParameters.deviationAngle = deviationAngle;
        }
        
        if (movementSpeed !== undefined) {
            ValidationHelper.validateMovementSpeed(movementSpeed);
            animationParameters.movementSpeed = movementSpeed;
        }
        
        updateParameterDisplays();
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'setParameters' });
    }
}

/**
 * Show parameter tooltips
 */
function showParameterTooltips() {
    try {
        const tooltips = {
            'ballCount': 'Number of balls in the animation (1-50)',
            'deviationAngle': 'Maximum angle deviation for ball bounces (1-45°)',
            'movementSpeed': 'Speed multiplier for ball movement (0.1-5.0x)'
        };
        
        Object.keys(tooltips).forEach(controlId => {
            const control = document.getElementById(controlId);
            if (control) {
                control.title = tooltips[controlId];
            }
        });
        
    } catch (error) {
        globalErrorHandler.handleError(error, { context: 'showParameterTooltips' });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeUIControls,
        setupParameterControls,
        setupButtonControls,
        setupTextInputValidation,
        validateTextInput,
        showInputError,
        clearInputError,
        updateParameterDisplays,
        updateParametersFromUI,
        resetParametersToDefaults,
        setParameterControlsEnabled,
        toggleAdvancedControls,
        createParameterPresets,
        applyParameterPreset,
        getCurrentParameters,
        setParameters,
        showParameterTooltips
    };
}
