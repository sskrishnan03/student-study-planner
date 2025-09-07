import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import Modal from './Modal';
import { useData } from '../contexts/DataContext';
import AIIcon from './AIIcon';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import TypingEffect from './TypingEffect';

interface ChatbotModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Message = {
    sender: 'user' | 'ai';
    text: string;
};

const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose }) => {
    const { subjects, tasks, exams, notes, goals, events } = useData();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                { sender: 'ai', text: "Hello! I'm your AI study assistant. Ask me anything about your schedule, tasks, or notes." }
            ]);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const dataContext = JSON.stringify({
                subjects,
                tasks,
                exams,
                notes: notes.map(n => ({ id: n.id, title: n.title, subjectId: n.subjectId })), // Prevent sending full note content
                goals,
                events,
                currentDate: new Date().toISOString()
            });

            const prompt = `You are a helpful student assistant integrated into a study planner app. Your responses must be concise and directly answer the user's question based on the provided JSON data. Do not mention that you are an AI.
            
            Here is the user's data context:
            ${dataContext}
            
            User's question: "${input}"
            
            Your answer:`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            const aiMessage: Message = { sender: 'ai', text: response.text };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: Message = { sender: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Study Assistant" size="lg">
            <div className="flex flex-col max-h-[80vh]">
                <div className="overflow-y-auto pr-4 -mr-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                    <AIIcon className="h-5 w-5 text-white" />
                                </div>
                            )}
                            <div className={`max-w-md p-3 rounded-2xl ${msg.sender === 'ai' ? 'bg-surface-inset-light dark:bg-surface-inset-dark text-text-primary-light dark:text-text-primary-dark' : 'bg-primary text-white'}`}>
                                {msg.sender === 'ai' && index === messages.length - 1 && !isLoading ? (
                                    <TypingEffect text={msg.text} />
                                ) : (
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                    <AIIcon className="h-5 w-5 text-white animate-pulse" />
                            </div>
                            <div className="max-w-md p-3 rounded-2xl bg-surface-inset-light dark:bg-surface-inset-dark">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 bg-text-muted-light dark:bg-text-muted-dark rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="h-2 w-2 bg-text-muted-light dark:bg-text-muted-dark rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="h-2 w-2 bg-text-muted-light dark:bg-text-muted-dark rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="e.g., 'What's due this week?'"
                            className="w-full pl-4 pr-12 py-3 bg-surface-inset-light dark:bg-surface-inset-dark text-text-primary-light dark:text-text-primary-dark border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleSendMessage} 
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-white hover:bg-primary-dark disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-all"
                        >
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ChatbotModal;