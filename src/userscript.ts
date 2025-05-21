import { UserScriptSettings, SettingType, DEFAULT_THEMES } from './settings';
import { SettingsUI } from './settings-ui';

// Export everything as a global object
(window as any).UserScriptSettings = {
    // Core functionality
    initialize: UserScriptSettings.initialize,
    getInstance: UserScriptSettings.getInstance,

    // Types and constants
    SettingType,
    DEFAULT_THEMES,

    // UI Component
    SettingsUI
};

// Export types for TypeScript users
export {
    UserScriptSettings,
    SettingType,
    DEFAULT_THEMES,
    SettingsUI
}; 