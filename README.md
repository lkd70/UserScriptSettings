[![Build Status](https://github.com/yourusername/userscript-settings/actions/workflows/build.yml/badge.svg)](https://github.com/yourusername/userscript-settings/actions/workflows/build.yml)

# UserScript Settings

A powerful and flexible settings management library for UserScripts, with a beautiful React-based UI.

## Features

- 🎨 Beautiful, modern UI with dark/light theme support
- ⚡ Real-time setting updates
- 🔒 Type-safe with TypeScript support
- 🎯 Easy to integrate with any UserScript
- 📱 Responsive design
- ⌨️ Keyboard shortcuts
- 🎯 Comprehensive documentation

## Installation

### As a UserScript

Add the following to your UserScript metadata:

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

Then in your UserScript code:

```javascript
// Initialize settings
const settings = UserScriptSettings.initialize('my-script', '1.0.0');

// Define a setting
settings.defineSetting('refreshInterval', {
    type: UserScriptSettings.SettingType.NUMBER,
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
    theme: UserScriptSettings.DEFAULT_THEMES.light
};

// Render the settings UI
const container = document.createElement('div');
document.body.appendChild(container);
const root = ReactDOM.createRoot(container);
root.render(
    React.createElement(UserScriptSettings.SettingsUI, {
        settings: settings,
        config: uiConfig
    })
);
```

For detailed UserScript integration instructions, see our [UserScript Guide](docs/USERSCRIPT_GUIDE.md).

### As an NPM Package

```bash
npm install userscript-settings
```

## Basic Usage

```typescript
import { UserScriptSettings, SettingType, DEFAULT_THEMES } from 'userscript-settings';

// Initialize settings
const settings = UserScriptSettings.initialize('my-script', '1.0.0');

// Define a setting
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
```

## API Reference

### Setting Types

- `SettingType.TEXT` - Text input
- `SettingType.NUMBER` - Number input
- `SettingType.BOOLEAN` - Checkbox
- `SettingType.SELECT` - Dropdown
- `SettingType.COLOR` - Color picker
- `SettingType.SLIDER` - Slider

### Methods

- `initialize(namespace: string, version: string)` - Initialize settings
- `defineSetting(key: string, config: SettingConfig)` - Define a new setting
- `getSetting(key: string)` - Get a setting value
- `setSetting(key: string, value: any)` - Set a setting value
- `resetSetting(key: string)` - Reset a setting to its default value
- `resetAllSettings()` - Reset all settings to their default values
- `onSettingChange(key: string, callback: (newValue: any, oldValue: any) => void)` - Listen for setting changes

### UI Configuration

```typescript
interface UIConfig {
    tabs: Array<{
        id: string;
        label: string;
        icon?: string;
    }>;
    groups: Array<{
        id: string;
        label: string;
        tab: string;
    }>;
    theme: Theme;
}
```

## Theme Customization

The library comes with built-in light and dark themes, but you can customize them:

```typescript
const customTheme = {
    ...DEFAULT_THEMES.light,
    colors: {
        ...DEFAULT_THEMES.light.colors,
        primary: '#FF0000', // Custom primary color
    }
};
```

## Keyboard Shortcuts

- `Ctrl + ,` - Open/close settings
- `Esc` - Close settings
- `Tab` - Navigate between settings
- `Enter` - Toggle boolean settings
- `Space` - Toggle boolean settings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 