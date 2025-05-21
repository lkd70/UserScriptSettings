import {
  UserScriptSettings as BaseUserScriptSettings,
  SettingType,
  SettingDefinition,
  SettingValue,
  SettingChangeCallback,
  DEFAULT_THEMES
} from './settings';

declare global {
  interface Window {
    UserScriptSettings: typeof BaseUserScriptSettings;
    React: typeof import('react');
    ReactDOM: typeof import('react-dom');
  }
}

// Export types for use in UserScripts
export type {
  SettingDefinition,
  SettingValue,
  SettingChangeCallback
};

// Export constants for use in UserScripts
export {
  SettingType,
  DEFAULT_THEMES
};

// Export the base class for type checking
export { BaseUserScriptSettings as UserScriptSettings }; 