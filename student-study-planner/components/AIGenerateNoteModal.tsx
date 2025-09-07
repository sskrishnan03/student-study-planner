import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import Modal from './Modal';
import RichTextEditor from './RichTextEditor';
import { useData } from '../contexts/DataContext';
import { SparklesIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const modalInputStyles = "w-full px-4 py-2 bg-surface-inset-light dark:bg-surface-inset-dark border border-border-light dark:border-border-dark rounded-lg placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const modalPrimaryButtonStyles = "px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const modalSecondaryButtonStyles = "px-5 py-2.5 bg-surface-inset-light text-text-primary-light font-semibold rounded-lg hover:bg-border-light dark:bg-surface-inset-dark dark:text-text-primary-dark dark:hover:bg-border-dark transition-colors duration-200 text-sm";


const AIGenerateNoteModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { subjects, addNote } = useData();
    const [stage, setStage] = useState<'prompt' | 'review'>('prompt');
    const [prompt, setPrompt] = useState('');
    const [subjectId, setSubjectId] = useState(subjects.length > 0 ? subjects[0].id : '');
    
    // State for the AI's direct output
    const [generatedTitle, setGeneratedTitle] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    
    // State for user edits in the review stage
    const [editedTitle, setEditedTitle] = useState('');
    const [editedContent, setEditedContent] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    // When moving to review stage, populate the editable fields
    useEffect(() => {
        if (stage === 'review') {
            setEditedTitle(generatedTitle);
            setEditedContent(generatedContent);
        }
    }, [stage, generatedTitle, generatedContent]);

    const handleClose = () => {
        setStage('prompt');
        setPrompt('');
        setGeneratedTitle('');
        setGeneratedContent('');
        setEditedTitle('');
        setEditedContent('');
        setError('');
        setIsLoading(false);
        onClose();
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || !subjectId) {
            setError("Please enter a topic and select a subject.");
            return;
        }
        setError('');
        setIsLoading(true);

        const fullPrompt = `Generate a detailed, well-structured study note about "${prompt}". The note should be formatted in HTML, using headings (like <h2> and <h3>), lists (<ul>, <ol>, <li>), and bold text (<b> or <strong>) to organize the information clearly for a student. Start the note with an <h1> tag containing a suitable title for the topic. Do not include any other text before the initial <h1> tag.`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
            });

            const htmlContent = response.text;
            
            const titleMatch = htmlContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
            let title = prompt;
            let content = htmlContent;

            if (titleMatch && titleMatch[1]) {
                title = titleMatch[1].trim();
                content = htmlContent.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
            }

            setGeneratedTitle(title);
            setGeneratedContent(content);
            setStage('review');

        } catch (e) {
            console.error(e);
            setError("Failed to generate note. Please check your API key or try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = () => {
        if (!editedTitle.trim() || !subjectId) return;
        addNote({
            title: editedTitle,
            content: editedContent,
            subjectId: subjectId
        });
        handleClose();
    };

    const renderPromptStage = () => (
        <div className="space-y-4">
            <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Enter a topic, e.g., 'The basics of calculus' or 'Key events of the Cold War'"
                rows={4}
                className={modalInputStyles}
            />
            <select
                value={subjectId}
                onChange={e => setSubjectId(e.target.value)}
                className={modalInputStyles}
                disabled={subjects.length === 0}
            >
                {subjects.length > 0 ? (
                    subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)
                ) : (
                    <option>Please create a subject first</option>
                )}
            </select>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="mt-8 pt-4 flex justify-end gap-3 border-t border-border-light dark:border-border-dark -mx-6 -mb-6 px-6 pb-6 bg-surface-muted-light dark:bg-surface-muted-dark rounded-b-2xl">
                <button type="button" onClick={handleClose} className={modalSecondaryButtonStyles}>Cancel</button>
                <button onClick={handleGenerate} className={`${modalPrimaryButtonStyles} flex items-center gap-2`} disabled={isLoading || subjects.length === 0}>
                    <SparklesIcon className="h-5 w-5" />
                    {isLoading ? 'Generating...' : 'Generate Note'}
                </button>
            </div>
        </div>
    );
    
    const renderReviewStage = () => (
        <div className="space-y-4">
            <input
                type="text"
                value={editedTitle}
                onChange={e => setEditedTitle(e.target.value)}
                placeholder="Note Title"
                className={modalInputStyles}
            />
            <div className="bg-surface-inset-light dark:bg-surface-inset-dark rounded-xl">
                 <RichTextEditor value={editedContent} onChange={setEditedContent} />
            </div>
             <div className="mt-8 pt-4 flex justify-between items-center border-t border-border-light dark:border-border-dark -mx-6 -mb-6 px-6 pb-6 bg-surface-muted-light dark:bg-surface-muted-dark rounded-b-2xl">
                <button type="button" onClick={() => setStage('prompt')} className={`${modalSecondaryButtonStyles} flex items-center gap-2`}>
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back
                </button>
                <div className="flex gap-3">
                    <button type="button" onClick={handleClose} className={modalSecondaryButtonStyles}>Discard</button>
                    <button onClick={handleSave} className={modalPrimaryButtonStyles}>Save Note</button>
                </div>
            </div>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={stage === 'prompt' ? "Generate Note with AI" : "Review Generated Note"} size="2xl">
            {isLoading && stage === 'prompt' ? (
                <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <SparklesIcon className="h-12 w-12 text-primary animate-pulse" />
                    <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">Generating your notes, please wait...</p>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">This may take a moment.</p>
                </div>
            ) : (
                stage === 'prompt' ? renderPromptStage() : renderReviewStage()
            )}
        </Modal>
    );
};

export default AIGenerateNoteModal;