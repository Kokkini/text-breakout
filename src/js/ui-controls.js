/**
 * UI Controls Module
 * Handles user interface controls and parameter management
 */

/**
 * Check if viewer mode is enabled via URL parameter
 */
function isViewerMode() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const viewerParam = urlParams.get('viewer');
        return viewerParam === 'true' || viewerParam === '1';
    } catch (error) {
        console.error('Error checking viewer mode:', error);
        return false;
    }
}

/**
 * Enter viewer mode (hide controls, show only animation)
 */
function enterViewerMode() {
    try {
        // Hide the form
        const form = document.getElementById('text-form');
        if (form) {
            form.style.display = 'none';
        }
        
        // Hide the subtitle
        const subtitle = document.querySelector('.subtitle');
        if (subtitle) {
            subtitle.style.display = 'none';
        }
        
        // Change the h1 title to "You've got a message"
        const title = document.querySelector('h1');
        if (title) {
            // Store original title for restoration
            if (!title.dataset.originalText) {
                title.dataset.originalText = title.textContent;
            }
            title.textContent = "You've got a message";
        }
        
        // Create and show "Create your own" button below the canvas
        const animationContainer = document.querySelector('.animation-container');
        if (animationContainer && !document.getElementById('create-own-btn')) {
            const createOwnBtn = document.createElement('button');
            createOwnBtn.id = 'create-own-btn';
            createOwnBtn.type = 'button';
            createOwnBtn.textContent = 'Create your own';
            createOwnBtn.className = 'create-own-button';
            createOwnBtn.addEventListener('click', exitViewerMode);
            
            // Insert after the animation container
            if (animationContainer.nextSibling) {
                animationContainer.parentNode.insertBefore(createOwnBtn, animationContainer.nextSibling);
            } else {
                animationContainer.parentNode.appendChild(createOwnBtn);
            }
        }
        
        console.log('Entered viewer mode');
        
    } catch (error) {
        console.error('Error entering viewer mode:', error);
    }
}

/**
 * Exit viewer mode (show controls without reloading)
 */
function exitViewerMode() {
    try {
        // Show the form
        const form = document.getElementById('text-form');
        if (form) {
            form.style.display = 'block';
        }
        
        // Show the subtitle
        const subtitle = document.querySelector('.subtitle');
        if (subtitle) {
            subtitle.style.display = 'block';
        }
        
        // Restore original title
        const title = document.querySelector('h1');
        if (title && title.dataset.originalText) {
            title.textContent = title.dataset.originalText;
            delete title.dataset.originalText;
        }
        
        // Remove "Create your own" button
        const createOwnBtn = document.getElementById('create-own-btn');
        if (createOwnBtn) {
            createOwnBtn.remove();
        }
        
        // Animation continues running - no need to stop it
        
        console.log('Exited viewer mode - controls now visible');
        
    } catch (error) {
        console.error('Error exiting viewer mode:', error);
    }
}

/**
 * Load configuration from URL parameters
 */
function loadConfigFromURL() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Parse URL parameters (support multiple naming conventions)
        const config = {
            ballCount: urlParams.get('ballCount') || urlParams.get('balls') || urlParams.get('numBalls'),
            deviationAngle: urlParams.get('deviationAngle') || urlParams.get('deviation') || urlParams.get('angle'),
            movementSpeed: urlParams.get('movementSpeed') || urlParams.get('speed'),
            fontSize: urlParams.get('fontSize') || urlParams.get('textResolution') || urlParams.get('resolution'),
            text: urlParams.get('text')
        };
        
        // Check if we should enter viewer mode
        const viewerMode = isViewerMode();
        
        // Apply parameters if they exist and are valid
        let paramsApplied = false;
        
        // Ball count
        if (config.ballCount) {
            const ballCount = parseInt(config.ballCount);
            if (!isNaN(ballCount) && ballCount >= 1 && ballCount <= 50) {
                const ballCountSlider = document.getElementById('ball-count');
                if (ballCountSlider) {
                    ballCountSlider.value = ballCount;
                    if (animationParameters) {
                        animationParameters.ballCount = ballCount;
                    }
                    paramsApplied = true;
                }
            }
        }
        
        // Deviation angle
        if (config.deviationAngle) {
            const deviationAngle = parseInt(config.deviationAngle);
            if (!isNaN(deviationAngle) && deviationAngle >= 1 && deviationAngle <= 45) {
                const deviationAngleSlider = document.getElementById('deviation-angle');
                if (deviationAngleSlider) {
                    deviationAngleSlider.value = deviationAngle;
                    if (animationParameters) {
                        animationParameters.deviationAngle = deviationAngle;
                    }
                    paramsApplied = true;
                }
            }
        }
        
        // Movement speed
        if (config.movementSpeed) {
            const movementSpeed = parseFloat(config.movementSpeed);
            if (!isNaN(movementSpeed) && movementSpeed >= 0.1 && movementSpeed <= 5.0) {
                const movementSpeedSlider = document.getElementById('movement-speed');
                if (movementSpeedSlider) {
                    movementSpeedSlider.value = movementSpeed;
                    if (animationParameters) {
                        animationParameters.movementSpeed = movementSpeed;
                    }
                    paramsApplied = true;
                }
            }
        }
        
        // Font size
        if (config.fontSize) {
            const fontSize = parseInt(config.fontSize);
            if (!isNaN(fontSize) && fontSize >= 8 && fontSize <= 120) {
                const fontSizeSlider = document.getElementById('font-size');
                if (fontSizeSlider) {
                    fontSizeSlider.value = fontSize;
                    paramsApplied = true;
                }
            }
        }
        
        // Text input
        if (config.text) {
            const textInput = document.getElementById('text-input');
            if (textInput) {
                textInput.value = decodeURIComponent(config.text);
                paramsApplied = true;
            }
        }
        
        // Update displays if any parameters were applied
        if (paramsApplied) {
            updateParameterDisplays();
            console.log('Configuration loaded from URL parameters');
        }
        
        // Enter viewer mode if viewer=true parameter is set
        if (viewerMode) {
            enterViewerMode();
            
            // Auto-start animation after a short delay to ensure everything is loaded
            setTimeout(() => {
                // Trigger the start animation using the global onAnimate function
                if (typeof window.onAnimate === 'function') {
                    window.onAnimate();
                } else {
                    // Fallback: click the start button programmatically
                    const startBtn = document.getElementById('start-new-btn');
                    if (startBtn) {
                        startBtn.click();
                    }
                }
            }, 1600); // Wait a bit longer to ensure fonts are loaded
        }
        
    } catch (error) {
        console.error('Error loading config from URL:', error);
        // Don't throw - just continue with defaults
    }
}

/**
 * Generate URL with current configuration
 */
function generateConfigURL() {
    try {
        const baseUrl = window.location.origin + window.location.pathname;
        const params = new URLSearchParams();
        
        // Add viewer=true for clean sharing experience
        params.set('viewer', 'true');
        
        // Add current parameter values
        const ballCountSlider = document.getElementById('ball-count');
        if (ballCountSlider) {
            params.set('balls', ballCountSlider.value);
        }
        
        const deviationAngleSlider = document.getElementById('deviation-angle');
        if (deviationAngleSlider) {
            params.set('deviation', deviationAngleSlider.value);
        }
        
        const movementSpeedSlider = document.getElementById('movement-speed');
        if (movementSpeedSlider) {
            params.set('speed', movementSpeedSlider.value);
        }
        
        const fontSizeSlider = document.getElementById('font-size');
        if (fontSizeSlider) {
            params.set('fontSize', fontSizeSlider.value);
        }
        
        const textInput = document.getElementById('text-input');
        if (textInput && textInput.value.trim()) {
            params.set('text', encodeURIComponent(textInput.value.trim()));
        }
        
        return `${baseUrl}?${params.toString()}`;
        
    } catch (error) {
        console.error('Error generating config URL:', error);
        return window.location.href;
    }
}

/**
 * Copy sharable URL to clipboard
 */
function copyConfigURL() {
    try {
        const url = generateConfigURL();
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                console.log('Sharable URL copied to clipboard');
                // Optionally show a notification to the user
                showNotification('Sharable URL copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy URL:', err);
                fallbackCopyURL(url);
            });
        } else {
            fallbackCopyURL(url);
        }
        
    } catch (error) {
        console.error('Error copying sharable URL:', error);
    }
}

/**
 * Fallback method to copy URL
 */
function fallbackCopyURL(url) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            console.log('Sharable URL copied to clipboard (fallback method)');
            showNotification('Sharable URL copied to clipboard!');
        } catch (err) {
            console.error('Fallback copy failed:', err);
            showNotification('Failed to copy URL. Please copy manually: ' + url);
        }
        
        document.body.removeChild(textArea);
        
    } catch (error) {
        console.error('Error in fallback copy:', error);
    }
}

/**
 * Show a notification to the user
 */
function showNotification(message, duration = 3000) {
    try {
        // Remove existing notification
        const existingNotification = document.querySelector('.url-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'url-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #4CAF50;
            color: white;
            padding: 16px 24px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            font-size: 14px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

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
        
        // Load configuration from URL parameters
        loadConfigFromURL();
        
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
        
        // Share config button
        const shareConfigBtn = document.getElementById('share-config-btn');
        if (shareConfigBtn) {
            shareConfigBtn.addEventListener('click', copyConfigURL);
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
                // const validPattern = /[a-zA-Z0-9\s]/;
                const validPattern = /^[\s\S]*$/;
                
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
        // const validPattern = /^[a-zA-Z0-9\s]*$/;
        const validPattern = /^[\s\S]*$/;

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
                ballCount: 30,
                deviationAngle: 15,
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
            ballCount: 30,
            deviationAngle: 15,
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
        showParameterTooltips,
        loadConfigFromURL,
        generateConfigURL,
        copyConfigURL,
        showNotification,
        isViewerMode,
        enterViewerMode,
        exitViewerMode
    };
}
