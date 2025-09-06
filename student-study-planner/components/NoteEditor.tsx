import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { useData } from '../contexts/DataContext';
import RichTextEditor from './RichTextEditor';

const modalInputStyles = "w-full px-4 py-2 bg-surface-inset-light dark:bg-surface-inset-dark border border-border-light dark:border-border-dark rounded-lg placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const primaryButtonStyles = "px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryButtonStyles = "px-4 py-2 bg-surface-inset-light text-text-primary-light font-semibold rounded-lg hover:bg-border-light dark:bg-surface-inset-dark dark:text-text-primary-dark dark:hover:bg-border-dark transition-colors duration-200 text-sm";

interface NoteEditorProps {
    note: Note | null;
    subjects: ReturnType<typeof useData>['subjects'];
    onSave: (data: { title: string; content: string; subjectId: string; }) => void;
    onCancel: () => void;
    initialSubjectId?: string;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, subjects, onSave, onCancel, initialSubjectId }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [subjectId, setSubjectId] = useState('');

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setSubjectId(note.subjectId);
        } else {
            // For a new note
            setTitle('');
            setContent('');
            setSubjectId(initialSubjectId || (subjects.length > 0 ? subjects[0].id : ''));
        }
    }, [note, subjects, initialSubjectId]);

    const handleSaveClick = () => {
        if (!title.trim() || !subjectId) {
            alert("Note title and subject are required.");
            return;
        }
        onSave({ title, content, subjectId });
    };

    return (
        <>
            <div className="flex justify-between items-center p-4 border-b border-border-light dark:border-border-dark">
                <h3 className="text-lg font-semibold">{note ? 'Edit Note' : 'New Note'}</h3>
                <div className="flex gap-2">
                    <button onClick={onCancel} className={secondaryButtonStyles}>Cancel</button>
                    <button onClick={handleSaveClick} className={primaryButtonStyles} disabled={subjects.length === 0}>Save Note</button>
                </div>
            </div>
            <div className="p-6 space-y-4">
                <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Note Title" 
                    className={modalInputStyles} 
                />
                <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className={modalInputStyles} disabled={subjects.length === 0}>
                    {subjects.length > 0 ? (
                       subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)
                    ) : (
                        <option>Please create a subject first</option>
                    )}
                </select>
                <div className="min-h-[50vh] bg-surface-inset-light dark:bg-surface-inset-dark rounded-xl">
                    <RichTextEditor value={content} onChange={setContent} />
                </div>
            </div>
        </>
    );
};

export default NoteEditor;
