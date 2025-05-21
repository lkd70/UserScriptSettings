# Using UserScript Settings in Your UserScript

This guide explains how to integrate and use the UserScript Settings library in your UserScript.

## Basic Setup

1. Add the required dependencies to your UserScript metadata:

```javascript
// ==UserScript==
// @name         My UserScript
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  My awesome UserScript
// @author       Your Name
// @match        *://*/*
// @grant        none
// @require      https://unpkg.com/react@18/umd/react.production.min.js
// @require      https://unpkg.com/react-dom@18/umd/react-dom.production.min.js
// @require      https://raw.githubusercontent.com/yourusername/userscript-settings/main/dist/userscript-settings.user.js
// ==/UserScript==
```

2. Create a settings container in your UserScript:

```javascript
(function() {
    'use strict';
    
    // Create a container for the settings UI
    const container = document.createElement('div');
    container.id = 'my-script-settings';
    document.body.appendChild(container);
    
    // Initialize settings
    const settings = UserScriptSettings.initialize('my-script', '1.0.0');
    
    // Define your settings
    settings.defineSetting('refreshInterval', {
        type: SettingType.NUMBER,
        defaultValue: 5000,
        description: 'How often to refresh the data (in milliseconds)',
        ui: {
            tab: 'general',
            group: 'basic',
            order: 1,
            options: {
                number: {
                    min: 1000,
                    max: 30000,
                    step: 1000
                }
            }
        }
    });
    
    // Configure the UI
    const uiConfig = {
        tabs: [
            { id: 'general', label: 'General', icon: '⚙️' }
        ],
        groups: [
            { id: 'basic', label: 'Basic Settings', tab: 'general' }
        ],
        theme: DEFAULT_THEMES.light
    };
    
    // Render the settings UI
    const root = ReactDOM.createRoot(container);
    root.render(
        React.createElement(SettingsUI, {
            settings: settings,
            config: uiConfig
        })
    );
})();
```

## TypeScript Support

If you're using TypeScript in your UserScript, you can get full type support:

1. Install the type definitions:
```bash
npm install --save-dev userscript-settings
```

2. Create a `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "jsx": "react",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["userscript-settings"]
  }
}
```

3. Use TypeScript in your UserScript:
```typescript
// ==UserScript==
// @name         My UserScript
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  My awesome UserScript
// @author       Your Name
// @match        *://*/*
// @grant        none
// @require      https://unpkg.com/react@18/umd/react.production.min.js
// @require      https://unpkg.com/react-dom@18/umd/react-dom.production.min.js
// @require      https://raw.githubusercontent.com/yourusername/userscript-settings/main/dist/userscript-settings.user.js
// ==/UserScript==

import { SettingType, DEFAULT_THEMES } from 'userscript-settings';

(function() {
    'use strict';
    
    // Your TypeScript code here...
})();
```

## Best Practices

1. **Namespace Your Settings**
   - Use a unique namespace for your settings to avoid conflicts with other UserScripts
   - Example: `my-script-settings` instead of just `settings`

2. **Version Control**
   - Always specify a version when initializing settings
   - Update the version when making breaking changes to your settings structure

3. **Error Handling**
   ```javascript
   try {
       const settings = UserScriptSettings.initialize('my-script', '1.0.0');
       // ... rest of your code
   } catch (error) {
       console.error('Failed to initialize settings:', error);
   }
   ```

4. **Cleanup**
   ```javascript
   // Clean up when the UserScript is uninstalled
   window.addEventListener('unload', () => {
       // Remove the settings UI
       const container = document.getElementById('my-script-settings');
       if (container) {
           container.remove();
       }
   });
   ```

## Advanced Usage

### Custom Theme

```javascript
const customTheme = {
    ...DEFAULT_THEMES.light,
    colors: {
        ...DEFAULT_THEMES.light.colors,
        primary: '#FF0000', // Custom primary color
    }
};

const uiConfig = {
    // ... other config
    theme: customTheme
};
```

### Listening for Setting Changes

```javascript
settings.onSettingChange('refreshInterval', (newValue, oldValue) => {
    console.log(`Refresh interval changed from ${oldValue} to ${newValue}`);
    // Update your script's behavior
    updateRefreshInterval(newValue);
});
```

### Conditional Settings

```javascript
settings.defineSetting('advancedMode', {
    type: SettingType.BOOLEAN,
    defaultValue: false,
    description: 'Enable advanced features',
    ui: {
        tab: 'general',
        group: 'basic',
        order: 1
    }
});

// Only show advanced settings when advanced mode is enabled
if (settings.getSetting('advancedMode')) {
    settings.defineSetting('advancedOption', {
        // ... advanced setting definition
    });
}
```

### Persisting Settings Between Sessions

The library automatically persists settings to localStorage. You can access the raw settings if needed:

```javascript
// Get all settings
const allSettings = settings.getAllSettings();

// Check if a setting is at its default value
const isDefault = settings.isDefault('refreshInterval');

// Reset a setting to its default value
settings.resetSetting('refreshInterval');

// Reset all settings
settings.resetAllSettings();
```

## Troubleshooting

1. **Settings Not Saving**
   - Check if localStorage is available and not full
   - Verify that the settings namespace is unique
   - Ensure the version matches your script version

2. **UI Not Rendering**
   - Verify that React and ReactDOM are loaded before the settings library
   - Check the browser console for errors
   - Ensure the container element exists in the DOM

3. **Type Errors in TypeScript**
   - Make sure you've installed the type definitions
   - Verify your tsconfig.json is properly configured
   - Check that you're importing types correctly

## Security Considerations

1. **Data Validation**
   - Always validate setting values before using them
   - Use the built-in validation options (min/max for numbers, etc.)
   - Sanitize any user input

2. **Storage Limits**
   - Be mindful of localStorage size limits
   - Don't store sensitive information in settings
   - Consider using compression for large settings objects

## Performance Tips

1. **Lazy Loading**
   - Only initialize settings when needed
   - Consider lazy loading the settings UI

2. **Memory Management**
   - Remove event listeners when no longer needed
   - Clean up the UI when the script is uninstalled
   - Use weak references for large objects

3. **Caching**
   - Cache frequently accessed settings
   - Use the change event to update caches
   - Consider using a debounced save for frequent changes 