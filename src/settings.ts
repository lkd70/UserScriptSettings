interface SettingDefinition<T> {
    key: string;
    defaultValue: T;
    description?: string;
    validator?: (value: T) => boolean;
    type: SettingType;
    options?: SettingOptions<T>;
    ui?: SettingUIConfig;
}

interface SettingOptions<T> {
    // Common options
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    
    // Type-specific options
    dropdown?: {
        choices: Array<{ value: T; label: string }>;
    };
    radio?: {
        choices: Array<{ value: T; label: string }>;
    };
    checkbox?: {
        label: string;
    };
    number?: {
        min?: number;
        max?: number;
        step?: number;
    };
    text?: {
        multiline?: boolean;
        maxLength?: number;
        placeholder?: string;
    };
    color?: {
        format?: 'hex' | 'rgb' | 'hsl';
    };
    slider?: {
        min: number;
        max: number;
        step?: number;
        showValue?: boolean;
    };
}

interface SettingUIConfig {
    tab: string;
    order?: number;
    group?: string;
    groupOrder?: number;
    hidden?: boolean;
    advanced?: boolean;
}

interface SettingsUIConfig {
    tabs: Array<{
        id: string;
        label: string;
        icon?: string;
        order?: number;
    }>;
    groups?: Array<{
        id: string;
        label: string;
        tab: string;
        order?: number;
    }>;
    theme?: {
        name: string;
        colors: ThemeColors;
        spacing: ThemeSpacing;
        typography: ThemeTypography;
    };
}

interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
}

interface ThemeSpacing {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

interface ThemeTypography {
    fontFamily: string;
    fontSize: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    fontWeight: {
        light: number;
        regular: number;
        medium: number;
        bold: number;
    };
}

const DEFAULT_THEMES = {
    light: {
        name: 'light',
        colors: {
            primary: '#007AFF',
            secondary: '#5856D6',
            background: '#FFFFFF',
            surface: '#F2F2F7',
            text: '#000000',
            textSecondary: '#6C6C70',
            border: '#C6C6C8',
            error: '#FF3B30',
            success: '#34C759',
            warning: '#FF9500',
            info: '#5856D6'
        },
        spacing: {
            xs: '4px',
            sm: '8px',
            md: '16px',
            lg: '24px',
            xl: '32px'
        },
        typography: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: {
                xs: '12px',
                sm: '14px',
                md: '16px',
                lg: '18px',
                xl: '20px'
            },
            fontWeight: {
                light: 300,
                regular: 400,
                medium: 500,
                bold: 700
            }
        }
    },
    dark: {
        name: 'dark',
        colors: {
            primary: '#0A84FF',
            secondary: '#5E5CE6',
            background: '#000000',
            surface: '#1C1C1E',
            text: '#FFFFFF',
            textSecondary: '#8E8E93',
            border: '#38383A',
            error: '#FF453A',
            success: '#32D74B',
            warning: '#FF9F0A',
            info: '#5E5CE6'
        },
        spacing: {
            xs: '4px',
            sm: '8px',
            md: '16px',
            lg: '24px',
            xl: '32px'
        },
        typography: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: {
                xs: '12px',
                sm: '14px',
                md: '16px',
                lg: '18px',
                xl: '20px'
            },
            fontWeight: {
                light: 300,
                regular: 400,
                medium: 500,
                bold: 700
            }
        }
    }
};

enum SettingType {
    DROPDOWN = 'dropdown',
    RADIO = 'radio',
    CHECKBOX = 'checkbox',
    NUMBER = 'number',
    TEXT = 'text',
    COLOR = 'color',
    SLIDER = 'slider',
    CUSTOM = 'custom'
}

interface SettingValue<T> {
    value: T;
    isDefault: boolean;
}

interface SettingsStorage {
    version: string;
    settings: Record<string, any>;
}

type SettingChangeCallback<T extends string | number | boolean> = (newValue: T, oldValue: T) => void;

class UserScriptSettings {
    private static instance: UserScriptSettings;
    private settings: Map<string, SettingValue<string | number | boolean>> = new Map();
    private changeCallbacks: Map<string, Set<SettingChangeCallback<string | number | boolean>>> = new Map();
    private readonly storageKey: string;
    private readonly version: string;
    private readonly defaultSettings: Map<string, string | number | boolean> = new Map();
    private readonly settingDefinitions: Map<string, SettingDefinition<string | number | boolean>> = new Map();

    private constructor(storageKey: string, version: string) {
        this.storageKey = storageKey;
        this.version = version;
        this.loadSettings();
    }

    public static initialize(storageKey: string, version: string): UserScriptSettings {
        if (!UserScriptSettings.instance) {
            UserScriptSettings.instance = new UserScriptSettings(storageKey, version);
        }
        return UserScriptSettings.instance;
    }

    public static getInstance(): UserScriptSettings {
        if (!UserScriptSettings.instance) {
            throw new Error('UserScriptSettings not initialized. Call initialize() first.');
        }
        return UserScriptSettings.instance;
    }

    public defineSetting<T extends string | number | boolean>(definition: SettingDefinition<T>): void {
        this.validateSettingDefinition(definition);
        this.defaultSettings.set(definition.key, definition.defaultValue);
        this.settingDefinitions.set(definition.key, definition as unknown as SettingDefinition<string | number | boolean>);
        
        if (!this.settings.has(definition.key)) {
            this.settings.set(definition.key, {
                value: definition.defaultValue,
                isDefault: true
            });
        }
    }

    private validateSettingDefinition<T>(definition: SettingDefinition<T>): void {
        const { type, options, defaultValue } = definition;

        switch (type) {
            case SettingType.DROPDOWN:
                if (!options?.dropdown?.choices) {
                    throw new Error(`Dropdown setting "${definition.key}" must have choices defined`);
                }
                if (!options.dropdown.choices.some(choice => choice.value === defaultValue)) {
                    throw new Error(`Default value for dropdown setting "${definition.key}" must be one of the defined choices`);
                }
                break;

            case SettingType.RADIO:
                if (!options?.radio?.choices) {
                    throw new Error(`Radio setting "${definition.key}" must have choices defined`);
                }
                if (!options.radio.choices.some(choice => choice.value === defaultValue)) {
                    throw new Error(`Default value for radio setting "${definition.key}" must be one of the defined choices`);
                }
                break;

            case SettingType.NUMBER:
                if (typeof defaultValue !== 'number') {
                    throw new Error(`Number setting "${definition.key}" must have a numeric default value`);
                }
                if (options?.number) {
                    if (options.number.min !== undefined && defaultValue < options.number.min) {
                        throw new Error(`Default value for number setting "${definition.key}" must be >= min value`);
                    }
                    if (options.number.max !== undefined && defaultValue > options.number.max) {
                        throw new Error(`Default value for number setting "${definition.key}" must be <= max value`);
                    }
                }
                break;

            case SettingType.SLIDER:
                if (typeof defaultValue !== 'number') {
                    throw new Error(`Slider setting "${definition.key}" must have a numeric default value`);
                }
                if (!options?.slider) {
                    throw new Error(`Slider setting "${definition.key}" must have slider options defined`);
                }
                if (defaultValue < options.slider.min || defaultValue > options.slider.max) {
                    throw new Error(`Default value for slider setting "${definition.key}" must be between min and max values`);
                }
                break;

            case SettingType.COLOR:
                if (typeof defaultValue !== 'string') {
                    throw new Error(`Color setting "${definition.key}" must have a string default value`);
                }
                break;

            case SettingType.TEXT:
                if (typeof defaultValue !== 'string') {
                    throw new Error(`Text setting "${definition.key}" must have a string default value`);
                }
                if (options?.text?.maxLength && defaultValue.length > options.text.maxLength) {
                    throw new Error(`Default value for text setting "${definition.key}" exceeds maxLength`);
                }
                break;

            case SettingType.CHECKBOX:
                if (typeof defaultValue !== 'boolean') {
                    throw new Error(`Checkbox setting "${definition.key}" must have a boolean default value`);
                }
                break;
        }
    }

    public getSetting<T extends string | number | boolean>(key: string): T {
        const setting = this.settings.get(key);
        if (!setting) {
            throw new Error(`Setting "${key}" not found`);
        }
        return setting.value as T;
    }

    public setSetting<T extends string | number | boolean>(key: string, value: T): void {
        const oldSetting = this.settings.get(key);
        if (!oldSetting) {
            throw new Error(`Setting "${key}" not found`);
        }

        const defaultValue = this.defaultSettings.get(key);
        const isDefault = JSON.stringify(value) === JSON.stringify(defaultValue);

        const newSetting: SettingValue<T> = {
            value,
            isDefault
        };

        this.settings.set(key, newSetting);
        this.saveSettings();

        // Trigger change callbacks
        if (this.changeCallbacks.has(key)) {
            const callbacks = this.changeCallbacks.get(key)!;
            callbacks.forEach(callback => callback(value, oldSetting.value as T));
        }
    }

    public resetToDefault(key: string): void {
        const defaultValue = this.defaultSettings.get(key);
        if (defaultValue === undefined) {
            throw new Error(`Setting "${key}" not found`);
        }
        this.setSetting(key, defaultValue);
    }

    public resetAllToDefaults(): void {
        this.defaultSettings.forEach((defaultValue, key) => {
            this.setSetting(key, defaultValue);
        });
    }

    public onSettingChange<T extends string | number | boolean>(key: string, callback: SettingChangeCallback<T>): void {
        if (!this.changeCallbacks.has(key)) {
            this.changeCallbacks.set(key, new Set());
        }
        this.changeCallbacks.get(key)!.add(callback as SettingChangeCallback<string | number | boolean>);
    }

    public removeSettingChangeListener<T extends string | number | boolean>(key: string, callback: SettingChangeCallback<T>): void {
        const callbacks = this.changeCallbacks.get(key);
        if (callbacks) {
            callbacks.delete(callback as SettingChangeCallback<string | number | boolean>);
        }
    }

    public isDefault(key: string): boolean {
        const setting = this.settings.get(key);
        return setting?.isDefault ?? true;
    }

    public getAllSettings(): Record<string, SettingDefinition<string | number | boolean>> {
        const result: Record<string, SettingDefinition<string | number | boolean>> = {};
        for (const [key, definition] of this.settingDefinitions.entries()) {
            result[key] = definition;
        }
        return result;
    }

    private getSettingType(key: string): SettingType {
        // This is a simplified version - you might want to store the type in the settings map
        const value = this.settings.get(key)?.value;
        if (typeof value === 'boolean') return SettingType.CHECKBOX;
        if (typeof value === 'number') return SettingType.NUMBER;
        return SettingType.TEXT;
    }

    private getSettingOptions(key: string): SettingOptions<string | number | boolean> | undefined {
        // This is a simplified version - you might want to store the options in the settings map
        return undefined;
    }

    private loadSettings(): void {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (storedData) {
                const data: SettingsStorage = JSON.parse(storedData);
                
                // Version check and migration logic can be added here
                if (data.version !== this.version) {
                    // Handle version mismatch - for now, just reset to defaults
                    this.resetAllToDefaults();
                    return;
                }

                // Load stored settings
                Object.entries(data.settings).forEach(([key, value]) => {
                    this.settings.set(key, value);
                });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.resetAllToDefaults();
        }
    }

    private saveSettings(): void {
        try {
            const data: SettingsStorage = {
                version: this.version,
                settings: Object.fromEntries(this.settings)
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
}

export {
    UserScriptSettings,
    SettingType,
    DEFAULT_THEMES
};

export type {
    SettingDefinition,
    SettingValue,
    SettingChangeCallback,
    SettingOptions,
    SettingUIConfig,
    SettingsUIConfig,
    ThemeColors,
    ThemeSpacing,
    ThemeTypography
};

export interface TabConfig {
    id: string;
    label: string;
    icon?: string;
    order?: number;
}

export interface GroupConfig {
    id: string;
    label: string;
    tab: string;
    order?: number;
}

export interface ThemeConfig {
    name: string;
    colors: ThemeColors;
    spacing: ThemeSpacing;
    typography: ThemeTypography;
} 