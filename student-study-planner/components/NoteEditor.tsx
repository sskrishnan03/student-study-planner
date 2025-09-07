import React, { useState, useEffect } from 'react';
import { Note, Subject } from '../types';
import RichTextEditor from './RichTextEditor';
import Modal from './Modal';
import { PaperClipIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface NoteEditorProps {
    note: Note | null;
    subjects: Subject[];
    onSave: (data: Omit<Note, 'id' | 'createdAt' | 'lastModified'>) => void;
    onCancel: () => void;
    initialSubjectId?: string;
}

const inputStyles = "w-full px-4 py-2 bg-surface-inset-light dark:bg-surface-inset-dark border border-border-light dark:border-border-dark rounded-lg placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const primaryButtonStyles = "w-full px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryButtonStyles = "w-full px-5 py-2.5 bg-surface-inset-light text-text-primary-light font-semibold rounded-lg hover:bg-border-light dark:bg-surface-inset-dark dark:text-text-primary-dark dark:hover:bg-border-dark transition-colors duration-200 text-sm";

const NoteEditor: React.FC<NoteEditorProps> = ({ note, subjects, onSave, onCancel, initialSubjectId }) => {
    const [formData, setFormData] = useState({
        title: '',
        subjectId: subjects.length > 0 ? subjects[0].id : '',
        topic: '',
        content: '',
        fileDataUrl: undefined as string | undefined,
        fileName: undefined as string | undefined,
        fileType: undefined as string | undefined,
    });
    const [fileToProcess, setFileToProcess] = useState<File | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);

    useEffect(() => {
        if (note) {
            setFormData({
                title: note.title,
                subjectId: note.subjectId,
                topic: note.topic || '',
                content: note.content,
                fileDataUrl: note.fileDataUrl,
                fileName: note.fileName,
                fileType: note.fileType,
            });
        } else {
            setFormData({
                title: '',
                subjectId: initialSubjectId || (subjects.length > 0 ? subjects[0].id : ''),
                topic: '',
                content: '',
                fileDataUrl: undefined,
                fileName: undefined,
                fileType: undefined,
            });
        }
    }, [note, initialSubjectId, subjects]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (content: string) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('File is too large. Maximum size is 5MB.');
                return;
            }
            if (!file.name.endsWith('.docx')) {
                alert('Only .docx (Word) files are supported for text extraction.');
                return;
            }
            setFileToProcess(file);
        }
    };

    const handleRemoveFile = () => {
        setFormData(prev => ({
            ...prev,
            fileDataUrl: undefined,
            fileName: undefined,
            fileType: undefined,
        }));
    };

    const handleAttachOnly = () => {
        if (!fileToProcess) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                fileDataUrl: reader.result as string,
                fileName: fileToProcess.name,
                fileType: fileToProcess.type,
            }));
            setFileToProcess(null); // Close modal
        };
        reader.readAsDataURL(fileToProcess);
    };

    const handleExtractAndAttach = async () => {
        if (!fileToProcess) return;
        setIsExtracting(true);
        let extractedHtml = '';
        try {
            const arrayBuffer = await fileToProcess.arrayBuffer();
            const result = await (window as any).mammoth.convertToHtml({ arrayBuffer });
            extractedHtml = result.value;
        } catch (error) {
            console.error("Error extracting DOCX:", error);
            alert("Could not extract text from the document. It will be attached as a file only.");
        } finally {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    content: prev.content + extractedHtml, // Add extracted content
                    fileDataUrl: reader.result as string, // Attach file
                    fileName: fileToProcess.name,
                    fileType: fileToProcess.type,
                }));
                setIsExtracting(false);
                setFileToProcess(null); // Close modal
            };
            reader.readAsDataURL(fileToProcess);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.subjectId) {
            alert('Please provide a title and select a subject.');
            return;
        }
        onSave(formData);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="p-4 md:p-6 flex flex-col">
                <div className="space-y-4 flex-grow flex flex-col">
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Note Title"
                        required
                        className={`${inputStyles} text-2xl font-bold !p-2 border-0 focus:ring-0`}
                    />
                    <div className="flex gap-4">
                        <select name="subjectId" value={formData.subjectId} onChange={handleChange} required className={inputStyles}>
                            {subjects.length > 0 ? (
                                subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)
                            ) : (
                                <option value="" disabled>Please create a subject first</option>
                            )}
                        </select>
                        <input
                            type="text"
                            name="topic"
                            value={formData.topic}
                            onChange={handleChange}
                            placeholder="Topic (Optional)"
                            className={inputStyles}
                        />
                    </div>
                    <div className="flex-grow">
                        <RichTextEditor value={formData.content} onChange={handleContentChange} />
                    </div>
                     <div>
                        <label className={`${secondaryButtonStyles} cursor-pointer inline-flex items-center gap-2`}>
                            <PaperClipIcon className="h-5 w-5" />
                            <span>{formData.fileName ? 'Change Word Doc' : 'Attach Word Doc'}</span>
                            <input 
                                type="file" 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                            />
                        </label>
                        {formData.fileName && (
                            <div className="mt-2 flex items-center gap-2 p-2 bg-surface-inset-light dark:bg-surface-inset-dark rounded-lg text-sm">
                                <span className="truncate">{formData.fileName}</span>
                                <button type="button" onClick={handleRemoveFile} className="ml-auto text-text-muted-light dark:text-text-muted-dark hover:text-red-500">
                                    <XCircleIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-6 pt-4 flex justify-end gap-3 border-t border-border-light dark:border-border-dark flex-shrink-0">
                    <button type="button" onClick={onCancel} className={secondaryButtonStyles}>Cancel</button>
                    <button type="submit" className={primaryButtonStyles} disabled={!formData.title.trim() || !formData.subjectId}>Save Note</button>
                </div>
            </form>

            {fileToProcess && (
                <Modal isOpen={!!fileToProcess} onClose={() => setFileToProcess(null)} title="Process Word Document" size="md">
                    <div className="space-y-4">
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">
                            You've selected <strong>{fileToProcess.name}</strong>. How would you like to add it to your note?
                        </p>
                        {isExtracting ? (
                            <div className="text-center p-8">
                                <p>Extracting content, please wait...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 pt-2">
                                <button onClick={handleExtractAndAttach} className={primaryButtonStyles}>
                                    Extract Content & Attach File
                                </button>
                                <button onClick={handleAttachOnly} className={secondaryButtonStyles}>
                                    Attach File Only
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </>
    );
};

export default NoteEditor;