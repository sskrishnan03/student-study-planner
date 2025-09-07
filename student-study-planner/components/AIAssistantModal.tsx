import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import Modal from './Modal';
import { SparklesIcon, DocumentTextIcon, QuestionMarkCircleIcon, LightBulbIcon } from '@heroicons/react/24/outline';

const actionButtonClass = "w-full text-left flex items-center gap-3 p-3 rounded-lg bg-surface-inset-light dark:bg-surface-inset-dark hover:bg-border-light dark:hover:bg-border-dark transition-colors text-text-primary-light dark:text-text-primary-dark";

type AIAction = 'summarize' | 'quiz' | 'explain';

const AIAssistantModal: React.FC<{ isOpen: boolean; onClose: () => void; noteContent: string }> = ({ isOpen, onClose, noteContent }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [error, setError] = useState('');
    
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    const handleAction = async (action: AIAction) => {
        setAiResponse('');
        setError('');
        setIsLoading(true);

        const plainTextContent = noteContent.replace(/<[^>]*>?/gm, '');

        if (!plainTextContent.trim()) {
            setAiResponse('This note appears to be empty and cannot be processed.');
            setIsLoading(false);
            return;
        }

        const prompts: Record<AIAction, string> = {
            summarize: `Please summarize the following note content:\n\n${plainTextContent}`,
            quiz: `Please create a short quiz based on the following note content:\n\n${plainTextContent}`,
            explain: `Please explain the core concepts from the following note content in a simple way:\n\n${plainTextContent}`,
        };
        
        const systemInstructions: Record<AIAction, string> = {
            summarize: "You are an expert academic assistant. Your task is to summarize the provided text accurately and concisely into a few key bullet points. The summary must be based ONLY on the provided text. Do not add any information not present in the text. Format your response in HTML using <ul> and <li> tags.",
            quiz: "You are a teacher creating a study quiz. Based ONLY on the provided text, generate a short, 3-question multiple-choice quiz to test understanding. Format the response in HTML. Provide the questions, options (using <ul> and <li>), and then list the correct answers clearly at the end under a heading 'Correct Answers'.",
            explain: "You are a helpful tutor. Explain the core concepts from the provided text in a simple and easy-to-understand way, as if you were explaining it to a beginner. Your explanation must be based ONLY on the provided text.",
        };

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompts[action],
                config: {
                    systemInstruction: systemInstructions[action],
                }
            });
            setAiResponse(response.text.replace(/\n/g, '<br />'));
        } catch (e) {
            console.error(e);
            setError('An error occurred while communicating with the AI. Please check your API key and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Study Assistant" size="2xl">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 flex flex-col gap-2">
                    <h4 className="font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-1">What do you need?</h4>
                    <button onClick={() => handleAction('summarize')} className={actionButtonClass}>
                        <DocumentTextIcon className="h-6 w-6 text-primary flex-shrink-0" />
                        <span>Summarize Note</span>
                    </button>
                    <button onClick={() => handleAction('quiz')} className={actionButtonClass}>
                        <QuestionMarkCircleIcon className="h-6 w-6 text-primary flex-shrink-0" />
                        <span>Create a Quiz</span>
                    </button>
                    <button onClick={() => handleAction('explain')} className={actionButtonClass}>
                        <LightBulbIcon className="h-6 w-6 text-primary flex-shrink-0" />
                        <span>Explain Concepts</span>
                    </button>
                </div>
                <div className="md:w-2/3 md:border-l md:border-border-light dark:border-border-dark md:pl-6 min-h-[300px] bg-surface-inset-light dark:bg-surface-inset-dark p-4 rounded-lg">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <SparklesIcon className="h-12 w-12 text-primary animate-pulse" />
                            <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">AI is thinking...</p>
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none h-full overflow-y-auto prose-sm">
                            {error && <p className="text-red-500">{error}</p>}
                            {aiResponse ? <div dangerouslySetInnerHTML={{ __html: aiResponse }} /> : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary-light dark:text-text-secondary-dark">
                                    <SparklesIcon className="h-10 w-10 text-text-muted-light dark:text-text-muted-dark mb-2" />
                                    <p>Select an action to get started.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default AIAssistantModal;