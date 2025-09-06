import React from 'react';
import Card from '../components/Card';
import { useTheme } from '../contexts/ThemeContext';
import ToggleSwitch from '../components/ToggleSwitch';
import SegmentedControl from '../components/SegmentedControl';

const Settings: React.FC = () => {
  const { theme, toggleTheme, fontSize, setFontSize } = useTheme();

  return (
    <div className="space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">Settings</h1>
        
        <Card>
            <h2 className="text-xl font-semibold mb-4 border-b pb-3 border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark">Appearance</h2>
            <div className="space-y-6 pt-2">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-medium text-text-primary-light dark:text-text-primary-dark">Theme</p>
                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Switch between light and dark mode.</p>
                    </div>
                    <ToggleSwitch 
                        labelOn="Dark"
                        labelOff="Light"
                        isOn={theme === 'dark'}
                        onToggle={toggleTheme}
                    />
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-medium text-text-primary-light dark:text-text-primary-dark">Font Size</p>
                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Adjust the application's font size.</p>
                    </div>
                    <SegmentedControl
                      options={[
                        { label: 'Small', value: 'sm' },
                        { label: 'Medium', value: 'base' },
                        { label: 'Large', value: 'lg' }
                      ]}
                      value={fontSize}
                      onChange={(value) => setFontSize(value as 'sm' | 'base' | 'lg')}
                    />
                </div>
            </div>
        </Card>
    </div>
  );
};

export default Settings;