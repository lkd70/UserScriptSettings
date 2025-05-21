import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { UserScriptSettings, SettingDefinition, SettingType, SettingsUIConfig, DEFAULT_THEMES } from './settings';

interface SettingsUIProps {
    settings: UserScriptSettings;
    config: SettingsUIConfig;
    className?: string;
}

interface SettingComponentProps<T> {
    setting: SettingDefinition<T>;
    value: T;
    onChange: (value: T) => void;
    theme: typeof DEFAULT_THEMES.light;
}

interface KeyboardShortcut {
    key: string;
    description: string;
    action: () => void;
}

const SettingComponent = <T extends string | number | boolean>({ setting, value, onChange, theme }: SettingComponentProps<T>) => {
    const { type, options } = setting;

    // Helper function to safely convert value to string for display
    const valueToString = (val: T): string => {
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        return String(val);
    };

    switch (type) {
        case SettingType.DROPDOWN:
            return (
                <select
                    value={value as string}
                    onChange={(e) => onChange(e.target.value as T)}
                    style={{
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '4px',
                        padding: theme.spacing.sm,
                        width: '100%'
                    }}
                >
                    {options?.dropdown?.choices.map((choice) => (
                        <option key={choice.value as string} value={choice.value as string}>
                            {choice.label}
                        </option>
                    ))}
                </select>
            );

        case SettingType.RADIO:
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                    {options?.radio?.choices.map((choice) => (
                        <label
                            key={choice.value as string}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: theme.spacing.sm,
                                color: theme.colors.text
                            }}
                        >
                            <input
                                type="radio"
                                checked={value === choice.value}
                                onChange={() => onChange(choice.value)}
                                style={{ accentColor: theme.colors.primary }}
                            />
                            {choice.label}
                        </label>
                    ))}
                </div>
            );

        case SettingType.CHECKBOX:
            return (
                <label
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.sm,
                        color: theme.colors.text
                    }}
                >
                    <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={(e) => onChange(e.target.checked as T)}
                        style={{ accentColor: theme.colors.primary }}
                    />
                    {options?.checkbox?.label}
                </label>
            );

        case SettingType.NUMBER:
            return (
                <input
                    type="number"
                    value={value as number}
                    onChange={(e) => onChange(Number(e.target.value) as T)}
                    min={options?.number?.min}
                    max={options?.number?.max}
                    step={options?.number?.step}
                    style={{
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '4px',
                        padding: theme.spacing.sm,
                        width: '100%'
                    }}
                />
            );

        case SettingType.TEXT:
            return options?.text?.multiline ? (
                <textarea
                    value={value as string}
                    onChange={(e) => onChange(e.target.value as T)}
                    maxLength={options.text.maxLength}
                    placeholder={options.text.placeholder}
                    style={{
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '4px',
                        padding: theme.spacing.sm,
                        width: '100%',
                        minHeight: '100px',
                        resize: 'vertical'
                    }}
                />
            ) : (
                <input
                    type="text"
                    value={value as string}
                    onChange={(e) => onChange(e.target.value as T)}
                    maxLength={options?.text?.maxLength}
                    placeholder={options?.text?.placeholder}
                    style={{
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '4px',
                        padding: theme.spacing.sm,
                        width: '100%'
                    }}
                />
            );

        case SettingType.COLOR:
            return (
                <input
                    type="color"
                    value={value as string}
                    onChange={(e) => onChange(e.target.value as T)}
                    style={{
                        width: '100%',
                        height: '40px',
                        padding: theme.spacing.xs,
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '4px'
                    }}
                />
            );

        case SettingType.SLIDER:
            return (
                <div style={{ width: '100%' }}>
                    <input
                        type="range"
                        value={Number(value)}
                        onChange={(e) => onChange(Number(e.target.value) as T)}
                        min={options?.slider?.min}
                        max={options?.slider?.max}
                        step={options?.slider?.step || 1}
                        style={{
                            width: '100%',
                            accentColor: theme.colors.primary,
                            cursor: 'pointer'
                        }}
                    />
                    {options?.slider?.showValue && (
                        <div style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
                            {valueToString(value)}
                        </div>
                    )}
                </div>
            );

        default:
            return null;
    }
};

export const SettingsUI: React.FC<SettingsUIProps> = ({ settings, config, className }) => {
    const [activeTab, setActiveTab] = useState(config.tabs[0]?.id);
    const [searchQuery, setSearchQuery] = useState('');
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [settingValues, setSettingValues] = useState<Record<string, string | number | boolean>>({});
    const [currentTheme, setCurrentTheme] = useState(config.theme || DEFAULT_THEMES.light);

    // Initialize setting values
    useEffect(() => {
        const values: Record<string, string | number | boolean> = {};
        Object.entries(settings.getAllSettings()).forEach(([key]) => {
            values[key] = settings.getSetting(key);
        });
        setSettingValues(values);

        // Set initial theme
        const themeValue = settings.getSetting('theme');
        const accentColor = settings.getSetting('accentColor');
        setCurrentTheme({
            ...(themeValue === 'dark' ? DEFAULT_THEMES.dark : DEFAULT_THEMES.light),
            colors: {
                ...(themeValue === 'dark' ? DEFAULT_THEMES.dark.colors : DEFAULT_THEMES.light.colors),
                primary: accentColor as string
            }
        });
    }, []);

    // Listen for setting changes
    useEffect(() => {
        const handleSettingChange = (key: string, newValue: string | number | boolean) => {
            setSettingValues(prev => ({ ...prev, [key]: newValue }));
            
            // Update theme if theme setting changes
            if (key === 'theme') {
                const accentColor = settings.getSetting('accentColor');
                setCurrentTheme({
                    ...(newValue === 'dark' ? DEFAULT_THEMES.dark : DEFAULT_THEMES.light),
                    colors: {
                        ...(newValue === 'dark' ? DEFAULT_THEMES.dark.colors : DEFAULT_THEMES.light.colors),
                        primary: accentColor as string
                    }
                });
            }
            // Update accent color if it changes
            else if (key === 'accentColor') {
                setCurrentTheme(prev => ({
                    ...prev,
                    colors: {
                        ...prev.colors,
                        primary: newValue as string
                    }
                }));
            }
        };

        Object.keys(settings.getAllSettings()).forEach(key => {
            settings.onSettingChange(key, (newValue) => handleSettingChange(key, newValue));
        });

        return () => {
            Object.keys(settings.getAllSettings()).forEach(key => {
                settings.removeSettingChangeListener(key, handleSettingChange);
            });
        };
    }, [settings]);

    // Handle setting changes with autoSave
    const handleSettingChange = (key: string, value: string | number | boolean) => {
        settings.setSetting(key, value);
        const autoSave = settings.getSetting('autoSave');
        if (autoSave) {
            // AutoSave is enabled, settings are automatically saved in the setSetting method
            console.log('Auto-saved setting:', key, value);
        }
    };

    // Keyboard shortcuts
    const shortcuts: KeyboardShortcut[] = [
        {
            key: '/',
            description: 'Focus search',
            action: () => {
                const searchInput = document.getElementById('settings-search');
                if (searchInput) searchInput.focus();
            }
        },
        {
            key: 'Escape',
            description: 'Clear search / Close shortcuts guide',
            action: () => {
                setSearchQuery('');
                setShowShortcuts(false);
            }
        },
        {
            key: '?',
            description: 'Show keyboard shortcuts',
            action: () => setShowShortcuts(true)
        }
    ];

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Don't trigger shortcuts if user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }

        const shortcut = shortcuts.find(s => s.key === e.key);
        if (shortcut) {
            e.preventDefault();
            shortcut.action();
        }
    }, [shortcuts]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Filter settings based on search query
    const filterSettings = useCallback((settings: [string, SettingDefinition<string | number | boolean>][]) => {
        if (!searchQuery) return settings;
        
        const query = searchQuery.toLowerCase();
        return settings.filter(([key, setting]) => {
            const searchableText = [
                key,
                setting.description,
                setting.options?.label,
                setting.options?.dropdown?.choices.map(c => c.label).join(' '),
                setting.options?.radio?.choices.map(c => c.label).join(' ')
            ].filter(Boolean).join(' ').toLowerCase();
            
            return searchableText.includes(query);
        });
    }, [searchQuery]);

    // Group settings by tab and then by group
    const groupedSettings = config.tabs.reduce((acc, tab) => {
        const tabSettings = Object.entries(settings.getAllSettings())
            .filter(([_, setting]) => setting.ui?.tab === tab.id && !setting.ui?.hidden)
            .sort((a, b) => (a[1].ui?.order || 0) - (b[1].ui?.order || 0));

        const groups = config.groups?.filter(g => g.tab === tab.id) || [];
        const grouped = groups.reduce((groupAcc, group) => {
            groupAcc[group.id] = filterSettings(tabSettings.filter(([_, setting]) => setting.ui?.group === group.id));
            return groupAcc;
        }, {} as Record<string, [string, SettingDefinition<string | number | boolean>][]>);

        // Add ungrouped settings
        const ungrouped = filterSettings(tabSettings.filter(([_, setting]) => !setting.ui?.group));
        if (ungrouped.length > 0) {
            grouped['ungrouped'] = ungrouped;
        }

        acc[tab.id] = grouped;
        return acc;
    }, {} as Record<string, Record<string, [string, SettingDefinition<string | number | boolean>][]>>);

    if (!isVisible) return null;

    return (
        <div
            className={className}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}
        >
            <div
                style={{
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text,
                    fontFamily: currentTheme.typography.fontFamily,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '80%',
                    width: '80%',
                    maxWidth: '800px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                }}
            >
                {/* Header with search and shortcuts */}
                <div
                    style={{
                        padding: currentTheme.spacing.md,
                        borderBottom: `1px solid ${currentTheme.colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: currentTheme.spacing.md
                    }}
                >
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input
                            id="settings-search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search settings..."
                            style={{
                                width: '100%',
                                padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
                                paddingLeft: '32px',
                                backgroundColor: currentTheme.colors.surface,
                                color: currentTheme.colors.text,
                                border: `1px solid ${currentTheme.colors.border}`,
                                borderRadius: '4px',
                                fontSize: currentTheme.typography.fontSize.md
                            }}
                        />
                        <span
                            style={{
                                position: 'absolute',
                                left: currentTheme.spacing.sm,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: currentTheme.colors.textSecondary
                            }}
                        >
                            🔍
                        </span>
                    </div>
                    <button
                        onClick={() => setShowShortcuts(true)}
                        style={{
                            padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
                            backgroundColor: currentTheme.colors.surface,
                            color: currentTheme.colors.text,
                            border: `1px solid ${currentTheme.colors.border}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: currentTheme.spacing.sm
                        }}
                    >
                        <span>⌨️</span>
                        <span>Keyboard Shortcuts</span>
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        style={{
                            padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
                            backgroundColor: currentTheme.colors.surface,
                            color: currentTheme.colors.text,
                            border: `1px solid ${currentTheme.colors.border}`,
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>

                {/* Tabs */}
                <div
                    style={{
                        display: 'flex',
                        borderBottom: `1px solid ${currentTheme.colors.border}`,
                        padding: currentTheme.spacing.md
                    }}
                >
                    {config.tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: activeTab === tab.id ? currentTheme.colors.primary : currentTheme.colors.textSecondary,
                                padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
                                cursor: 'pointer',
                                borderBottom: activeTab === tab.id ? `2px solid ${currentTheme.colors.primary}` : 'none',
                                fontWeight: activeTab === tab.id ? currentTheme.typography.fontWeight.medium : currentTheme.typography.fontWeight.regular
                            }}
                        >
                            {tab.icon && <span style={{ marginRight: currentTheme.spacing.sm }}>{tab.icon}</span>}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Settings Content */}
                <div style={{ padding: currentTheme.spacing.lg, overflowY: 'auto', flex: 1 }}>
                    {Object.entries(groupedSettings[activeTab] || {}).map(([groupId, groupSettings]) => (
                        <div key={groupId} style={{ marginBottom: currentTheme.spacing.xl }}>
                            {groupId !== 'ungrouped' && (
                                <h3
                                    style={{
                                        color: currentTheme.colors.text,
                                        fontSize: currentTheme.typography.fontSize.lg,
                                        marginBottom: currentTheme.spacing.md
                                    }}
                                >
                                    {config.groups?.find(g => g.id === groupId)?.label}
                                </h3>
                            )}
                            {groupSettings.map(([key, setting]) => (
                                <div
                                    key={key}
                                    style={{
                                        marginBottom: currentTheme.spacing.lg,
                                        padding: currentTheme.spacing.md,
                                        backgroundColor: currentTheme.colors.surface,
                                        borderRadius: '8px'
                                    }}
                                >
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: currentTheme.spacing.sm,
                                            color: currentTheme.colors.text,
                                            fontSize: currentTheme.typography.fontSize.md,
                                            fontWeight: currentTheme.typography.fontWeight.medium
                                        }}
                                    >
                                        {setting.options?.label || key}
                                    </label>
                                    {setting.description && (
                                        <p
                                            style={{
                                                color: currentTheme.colors.textSecondary,
                                                fontSize: currentTheme.typography.fontSize.sm,
                                                marginBottom: currentTheme.spacing.md
                                            }}
                                        >
                                            {setting.description}
                                        </p>
                                    )}
                                    <SettingComponent
                                        setting={setting}
                                        value={settingValues[key] ?? settings.getSetting(key)}
                                        onChange={(value) => handleSettingChange(key, value)}
                                        theme={currentTheme}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Footer with close/save button */}
                <div
                    style={{
                        padding: currentTheme.spacing.md,
                        borderTop: `1px solid ${currentTheme.colors.border}`,
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}
                >
                    <button
                        onClick={() => {
                            // Handle save logic here
                            setIsVisible(false);
                        }}
                        style={{
                            padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
                            backgroundColor: currentTheme.colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Save & Close
                    </button>
                </div>

                {/* Keyboard Shortcuts Modal */}
                {showShortcuts && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}
                        onClick={() => setShowShortcuts(false)}
                    >
                        <div
                            style={{
                                backgroundColor: currentTheme.colors.background,
                                padding: currentTheme.spacing.xl,
                                borderRadius: '8px',
                                maxWidth: '500px',
                                width: '100%',
                                maxHeight: '80vh',
                                overflowY: 'auto'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h2
                                style={{
                                    color: currentTheme.colors.text,
                                    fontSize: currentTheme.typography.fontSize.xl,
                                    marginBottom: currentTheme.spacing.lg
                                }}
                            >
                                Keyboard Shortcuts
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing.md }}>
                                {shortcuts.map((shortcut, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: currentTheme.spacing.sm,
                                            backgroundColor: currentTheme.colors.surface,
                                            borderRadius: '4px'
                                        }}
                                    >
                                        <span style={{ color: currentTheme.colors.text }}>{shortcut.description}</span>
                                        <kbd
                                            style={{
                                                backgroundColor: currentTheme.colors.background,
                                                padding: `${currentTheme.spacing.xs} ${currentTheme.spacing.sm}`,
                                                borderRadius: '4px',
                                                border: `1px solid ${currentTheme.colors.border}`,
                                                color: currentTheme.colors.text,
                                                fontFamily: 'monospace'
                                            }}
                                        >
                                            {shortcut.key}
                                        </kbd>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Add a button to open the settings popup
const openSettingsPopup = () => {
    const popup = window.open('', 'Settings', 'width=600,height=800');
    if (popup) {
        popup.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Settings</title>
                    <style>
                        body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
                    </style>
                </head>
                <body>
                    <div id="root"></div>
                    <script type="module">
                        import React from 'react';
                        import ReactDOM from 'react-dom/client';
                        import { UserScriptSettings, SettingType, SettingsUIConfig, DEFAULT_THEMES } from './settings';
                        import SettingsUI from './settings-ui';

                        const settings = UserScriptSettings.initialize('demo-settings', '1.0.0');
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
                            theme: DEFAULT_THEMES.light
                        };

                        const root = ReactDOM.createRoot(document.getElementById('root'));
                        root.render(
                            <React.StrictMode>
                                <SettingsUI settings={settings} config={uiConfig} />
                            </React.StrictMode>
                        );
                    </script>
                </body>
            </html>
        `);
    }
};

// Render the demo with a button to open the settings popup
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <div>
            <h1>UserScript Settings Demo</h1>
            <button onClick={openSettingsPopup}>Open Settings</button>
        </div>
    </React.StrictMode>
); 