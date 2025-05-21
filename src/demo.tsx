import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { UserScriptSettings, SettingType, SettingsUIConfig, DEFAULT_THEMES, SettingDefinition } from './settings';
import SettingsUI from './settings-ui';

// Initialize settings
const settings = UserScriptSettings.initialize('demo-settings', '1.0.0');

// Define UI configuration
const uiConfig: SettingsUIConfig = {
    tabs: [
        { id: 'general', label: 'General', icon: '⚙️', order: 1 },
        { id: 'appearance', label: 'Appearance', icon: '🎨', order: 2 },
        { id: 'advanced', label: 'Advanced', icon: '🔧', order: 3 }
    ],
    groups: [
        { id: 'general-basic', label: 'Basic Settings', tab: 'general', order: 1 },
        { id: 'general-advanced', label: 'Advanced Settings', tab: 'general', order: 2 },
        { id: 'appearance-theme', label: 'Theme Settings', tab: 'appearance', order: 1 },
        { id: 'appearance-layout', label: 'Layout Settings', tab: 'appearance', order: 2 }
    ],
    theme: DEFAULT_THEMES.dark
};

// Define settings
const settingDefinitions: SettingDefinition<string | number | boolean>[] = [
    {
        key: 'theme',
        type: SettingType.DROPDOWN,
        defaultValue: 'light',
        description: 'The theme to use for the UI',
        options: {
            dropdown: {
                choices: [
                    { value: 'light', label: 'Light Theme' },
                    { value: 'dark', label: 'Dark Theme' },
                    { value: 'system', label: 'System Default' }
                ]
            }
        },
        ui: {
            tab: 'appearance',
            group: 'appearance-theme',
            order: 1
        }
    },
    {
        key: 'autoSave',
        type: SettingType.CHECKBOX,
        defaultValue: true,
        description: 'Whether to automatically save changes',
        options: {
            checkbox: {
                label: 'Enable Auto-Save'
            }
        },
        ui: {
            tab: 'general',
            group: 'general-basic',
            order: 1
        }
    },
    {
        key: 'refreshInterval',
        type: SettingType.SLIDER,
        defaultValue: 5000,
        description: 'How often to refresh data (in milliseconds)',
        options: {
            slider: {
                min: 1000,
                max: 30000,
                step: 1000,
                showValue: true
            }
        },
        ui: {
            tab: 'general',
            group: 'general-advanced',
            order: 1
        }
    },
    {
        key: 'notificationSound',
        type: SettingType.RADIO,
        defaultValue: 'beep',
        description: 'Sound to play for notifications',
        options: {
            radio: {
                choices: [
                    { value: 'beep', label: 'Beep' },
                    { value: 'chime', label: 'Chime' },
                    { value: 'none', label: 'No Sound' }
                ]
            }
        },
        ui: {
            tab: 'general',
            group: 'general-basic',
            order: 2
        }
    },
    {
        key: 'accentColor',
        type: SettingType.COLOR,
        defaultValue: '#007AFF',
        description: 'Accent color for the UI',
        options: {
            color: {
                format: 'hex'
            }
        },
        ui: {
            tab: 'appearance',
            group: 'appearance-theme',
            order: 2
        }
    },
    {
        key: 'maxResults',
        type: SettingType.NUMBER,
        defaultValue: 50,
        description: 'Maximum number of results to display',
        options: {
            number: {
                min: 10,
                max: 200,
                step: 10
            }
        },
        ui: {
            tab: 'advanced',
            order: 1
        }
    },
    {
        key: 'customMessage',
        type: SettingType.TEXT,
        defaultValue: '',
        description: 'Custom message to display',
        options: {
            text: {
                multiline: true,
                maxLength: 500,
                placeholder: 'Enter your custom message here...'
            }
        },
        ui: {
            tab: 'advanced',
            order: 2
        }
    }
];

// Register settings
settingDefinitions.forEach(def => settings.defineSetting(def));

// Render the demo with a button to toggle the settings UI
const Demo = () => {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div>
            <h1>UserScript Settings Demo</h1>
            <button onClick={() => setShowSettings(!showSettings)}>
                {showSettings ? 'Close Settings' : 'Open Settings'}
            </button>
            {showSettings && (
                <div style={{ marginTop: '20px' }}>
                    <SettingsUI settings={settings} config={uiConfig} />
                </div>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <Demo />
    </React.StrictMode>
); 