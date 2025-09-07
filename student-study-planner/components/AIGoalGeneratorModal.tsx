import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Modal from './Modal';
import { useData } from '../contexts/DataContext';
import AIIcon from './AIIcon';
import { LightBulbIcon } from '@heroicons/react/24/outline';

const modalInputStyles = "w-full px-4 py-2 bg-surface-inset-light dark:bg-surface-inset-dark border border-border-light dark:border-border-dark rounded-lg placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const modalPrimaryButtonStyles = "px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const modalSecondaryButtonStyles = "px-5 py-2.5 bg-surface-inset-light text-text-primary-light font-semibold rounded-lg hover:bg-border-light dark:bg-surface-inset-dark dark:text-text-primary-dark dark:hover:bg-border-dark transition-colors duration-200 text-sm";

interface AIGoalGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectGoal: (goal: { title: string; description: string; targetDate: string; }) => void;
}

interface GeneratedGoal {
    title: string;
    description: string;
    targetDate: string;
}

const AIGoalGeneratorModal: React.FC<AIGoalGeneratorModalProps> = ({ isOpen, onClose, onSelectGoal }) => {
    const [prompt, setPrompt] = useState('');
    const [suggestions, setSuggestions] = useState<GeneratedGoal[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Please enter a general goal or objective.");
            return;
        }
        setError('');
        setIsLoading(true);
        setSuggestions([]);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Based on the objective "${prompt}", generate 3 distinct SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goal suggestions for a student. For the targetDate, suggest a realistic date from today in YYYY-MM-DD format.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            goals: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                        targetDate: { type: Type.STRING },
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const jsonResponse = JSON.parse(response.text);
            if (jsonResponse.goals) {
                setSuggestions(jsonResponse.goals);
            } else {
                throw new Error("Invalid response format from AI.");
            }

        } catch (e) {
            console.error(e);
            setError("Failed to generate goals. The AI might be busy, or there could be an issue with your API key.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generate Goals with AI" size="2xl">
            <div className="space-y-4">
                <p className="text-text-secondary-light dark:text-text-secondary-dark">Describe a broad objective, and the AI will help you break it down into specific, actionable goals.</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="e.g., 'Improve my grades in Physics' or 'Prepare for final exams'"
                    rows={3}
                    className={modalInputStyles}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                
                <div className="pt-2 flex justify-end">
                    <button onClick={handleGenerate} className={`${modalPrimaryButtonStyles} flex items-center gap-2`} disabled={isLoading}>
                        <AIIcon className="h-5 w-5" />
                        {isLoading ? 'Generating...' : 'Generate Ideas'}
                    </button>
                </div>

                {isLoading && (
                     <div className="flex flex-col items-center justify-center min-h-[150px]">
                        <AIIcon className="h-10 w-10 text-primary animate-pulse" />
                        <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">AI is crafting your goals...</p>
                    </div>
                )}
                
                {!isLoading && suggestions.length > 0 && (
                    <div className="space-y-3 pt-4">
                        <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Here are a few suggestions:</h3>
                        {suggestions.map((goal, index) => (
                            <button key={index} onClick={() => onSelectGoal(goal)} className="w-full text-left p-4 rounded-lg bg-surface-inset-light dark:bg-surface-inset-dark hover:bg-border-light dark:hover:bg-border-dark transition-colors border border-border-light dark:border-border-dark">
                                <p className="font-bold text-primary flex items-center gap-2"><LightBulbIcon className="h-5 w-5"/> {goal.title}</p>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">{goal.description}</p>
                                <p className="text-xs font-semibold text-text-muted-light dark:text-text-muted-dark mt-2">TARGET: {goal.targetDate}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AIGoalGeneratorModal;
