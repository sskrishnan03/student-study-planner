import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Card from '../components/Card';
import ConfirmationModal from '../components/ConfirmationModal';
import { Note } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, SparklesIcon, MagnifyingGlassIcon, DocumentPlusIcon, BookmarkIcon, ClockIcon, XCircleIcon, TagIcon, PaperClipIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import NoteEditor from '../components/NoteEditor';
import AIAssistantModal from '../components/AIAssistantModal';
import AIGenerateNoteModal from '../components/AIGenerateNoteModal';
import { useLocation } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import AIIcon from '../components/AIIcon';

const pageInputStyles = "w-full p-2.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg placeholder:text-text-muted-light focus:ring-2 focus:ring-primary focus:border-primary transition";
const pagePrimaryButtonStyles = "w-full sm:w-auto px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";

const Notes: React.FC = () => {
    const { notes, subjects, addNote, updateNote, deleteNote, getSubjectById } = useData();
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newNoteSubjectId, setNewNoteSubjectId] = useState('');
    
    const [deletingNote, setDeletingNote] = useState<Note | null>(null);
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
    const [isAIGenerateModalOpen, setIsAIGenerateModalOpen] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
    const [filterTopic, setFilterTopic] = useState<string>('all');
    const [view, setView] = useState<'notes' | 'topics'>('notes');
    
    const [summary, setSummary] = useState<string>('');
    const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
    
    const location = useLocation();

    const selectedNote = useMemo(() => {
        return notes.find(n => n.id === selectedNoteId) || null;
    }, [selectedNoteId, notes]);
    
    const topicsForSelectedSubject = useMemo(() => {
        if (filterSubjectId === 'all') return { topics: [], hasUncategorized: false };
        const subjectNotes = notes.filter(note => note.subjectId === filterSubjectId);
        const topics = new Set(subjectNotes.map(note => note.topic).filter(Boolean));
        const hasUncategorized = subjectNotes.some(note => !note.topic);
        return { topics: Array.from(topics).sort(), hasUncategorized };
    }, [notes, filterSubjectId]);

    const filteredNotes = useMemo(() => {
        return notes
            .filter(note => {
                const subjectMatch = filterSubjectId === 'all' || note.subjectId === filterSubjectId;
                const topicMatch = filterTopic === 'all' || (filterTopic === '__UNCATEGORIZED__' ? !note.topic : note.topic === filterTopic);
                const searchMatch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.content.replace(/<[^>]*>?/gm, '').toLowerCase().includes(searchTerm.toLowerCase());
                return subjectMatch && topicMatch && searchMatch;
            })
            .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    }, [notes, filterSubjectId, filterTopic, searchTerm]);
    
    useEffect(() => {
        if (location.state?.filterSubjectId) {
            setFilterSubjectId(location.state.filterSubjectId);
            if (location.state.action === 'new') {
                handleNewNote(location.state.filterSubjectId);
            }
            window.history.replaceState({}, document.title)
        }
    }, [location.state]);
    
    useEffect(() => {
        if (filterSubjectId === 'all') {
            setView('notes');
            setFilterTopic('all');
        } else {
            setView('topics');
            setFilterTopic('all');
        }
    }, [filterSubjectId]);

    useEffect(() => {
        if (selectedNoteId && !filteredNotes.find(n => n.id === selectedNoteId)) {
            setSelectedNoteId(null);
            setIsEditing(false);
            setSummary('');
            setIsSummaryLoading(false);
        } else if (!selectedNoteId && !isEditing && view === 'notes' && filteredNotes.length > 0) {
            setSelectedNoteId(filteredNotes[0].id);
        } else if (view === 'topics') {
             setSelectedNoteId(null);
        }
    }, [filteredNotes, selectedNoteId, isEditing, view]);

    const handleNewNote = (subjectId?: string) => {
        if (isEditing && !window.confirm("You have unsaved changes. Are you sure you want to discard them and start a new note?")) {
            return;
        }
        setIsEditing(true);
        setSelectedNoteId(null);
        setSummary('');
    
        const defaultSubjectId = subjectId || (filterSubjectId !== 'all' ? filterSubjectId : (subjects.length > 0 ? subjects[0].id : ''));
        setNewNoteSubjectId(defaultSubjectId);
    };

    const handleSelectNote = (noteId: string) => {
        if (isEditing && !window.confirm("You have unsaved changes. Are you sure you want to switch notes?")) {
            return;
        }
        setIsEditing(false);
        setSelectedNoteId(noteId);
        setSummary('');
        setIsSummaryLoading(false);
    };
    
    const handleEdit = () => {
        if (selectedNote) setIsEditing(true);
    };

    const handleSave = (data: Omit<Note, 'id' | 'createdAt' | 'lastModified'>) => {
        if (selectedNote) {
            updateNote({ ...selectedNote, ...data });
        } else {
            const newNote = addNote(data);
            setSelectedNoteId(newNote.id);
        }
        setIsEditing(false);
        setSummary('');
        
        // After saving, if we were in a specific subject, go back to the notes view for that subject/topic
        if(filterSubjectId !== 'all'){
            setView('notes');
            setFilterTopic(data.topic || (data.topic === undefined ? '__UNCATEGORIZED__' : 'all'));
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (!selectedNoteId && view === 'notes' && filteredNotes.length > 0) {
            setSelectedNoteId(filteredNotes[0].id);
        }
    };

    const handleDelete = () => {
        if (!selectedNote) return;
        setDeletingNote(selectedNote);
    };

    const handleConfirmDelete = () => {
        if (deletingNote) {
            deleteNote(deletingNote.id);
            setDeletingNote(null);
            setSelectedNoteId(null);
            setIsEditing(false);
        }
    };
    
    const handleSummarize = async () => {
        if (!selectedNote) return;

        setIsSummaryLoading(true);
        setSummary('');
        try {
            const plainTextContent = selectedNote.content.replace(/<[^>]*>?/gm, '');
            if (!plainTextContent.trim()) {
                setSummary("This note is empty and cannot be summarized.");
                setIsSummaryLoading(false);
                return;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Please summarize the following note content:\n\n${plainTextContent}`,
                config: {
                    systemInstruction: "You are an expert academic assistant. Your task is to summarize the provided text accurately and concisely. The summary must be based ONLY on the provided text. Format your response in HTML using <ul> and <li> tags for the bullet points.",
                }
            });

            setSummary(response.text);

        } catch (error) {
            console.error("Failed to summarize note:", error);
            setSummary("<p class='text-red-500'>Sorry, I couldn't generate a summary at this time. Please try again later.</p>");
        } finally {
            setIsSummaryLoading(false);
        }
    };
    
    const NoteListItem = ({ note }: { note: Note }) => (
        <div 
            onClick={() => handleSelectNote(note.id)}
            className={`p-3 rounded-lg cursor-pointer transition-colors border-2 ${selectedNoteId === note.id ? 'bg-primary-light border-primary dark:bg-primary/20' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
        >
            <div className="flex justify-between items-start">
                <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate pr-2">{note.title}</h3>
                {note.fileName && <PaperClipIcon className="h-4 w-4 text-text-muted-light dark:text-text-muted-dark flex-shrink-0" />}
            </div>
            <div className="flex items-center justify-between text-xs text-text-muted-light dark:text-text-muted-dark mt-1">
              <span>{new Date(note.lastModified).toLocaleDateString()}</span>
            </div>
        </div>
    );

    const NotepadView = () => (
        <Card className="flex flex-col p-0">
            { isEditing ? (
                 <NoteEditor 
                    note={selectedNote}
                    subjects={subjects}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    initialSubjectId={newNoteSubjectId}
                 />
            ) : (
                selectedNote && (
                 <>
                    <div className="flex justify-between items-center p-4 border-b border-border-light dark:border-border-dark sticky top-0 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm z-10">
                        <div className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark flex-wrap">
                            <span className="flex items-center gap-2"><BookmarkIcon className="h-4 w-4"/> {getSubjectById(selectedNote.subjectId)?.title}</span>
                            {selectedNote.topic && <><span>&middot;</span><span className="flex items-center gap-2"><TagIcon className="h-4 w-4"/> {selectedNote.topic}</span></>}
                            <span>&middot;</span>
                            <span className="flex items-center gap-2"><ClockIcon className="h-4 w-4"/> {new Date(selectedNote.lastModified).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={handleSummarize} className="p-2 rounded-lg hover:bg-surface-inset-light dark:hover:bg-surface-inset-dark" title="Summarize with AI"><AIIcon className="h-5 w-5 text-primary"/></button>
                            <button onClick={() => setIsAIAssistantOpen(true)} className="p-2 rounded-lg hover:bg-surface-inset-light dark:hover:bg-surface-inset-dark" title="AI Assistant"><SparklesIcon className="h-5 w-5 text-purple-500"/></button>
                            <button onClick={handleEdit} className="p-2 rounded-lg hover:bg-surface-inset-light dark:hover:bg-surface-inset-dark" title="Edit Note"><PencilIcon className="h-5 w-5"/></button>
                            <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50" title="Delete Note"><TrashIcon className="h-5 w-5"/></button>
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                         <h1 className="text-3xl font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">{selectedNote.title}</h1>
                         <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedNote.content }} />
                         
                         {selectedNote.fileDataUrl && (
                            <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark">
                                <h2 className="text-xl font-bold mb-4 text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
                                    <PaperClipIcon className="h-6 w-6" /> Attached Document
                                </h2>
                                <div className="p-4 bg-surface-muted-light dark:bg-surface-muted-dark rounded-lg">
                                    <p className="font-semibold">{selectedNote.fileName}</p>
                                    {selectedNote.fileType === 'application/pdf' ? (
                                        <embed src={selectedNote.fileDataUrl} type="application/pdf" width="100%" height="700px" className="rounded-md border border-border-light dark:border-border-dark mt-2" />
                                    ) : (
                                        <div className="mt-2">
                                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Preview is not available for this file type.</p>
                                            <a href={selectedNote.fileDataUrl} download={selectedNote.fileName} className="text-primary font-semibold hover:underline mt-1 inline-block">
                                                Download {selectedNote.fileName}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                         
                         {(isSummaryLoading || summary) && (
                            <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark animate-fade-in">
                                <h2 className="text-xl font-bold mb-4 text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
                                    <AIIcon className="h-6 w-6 text-primary" />
                                    AI Summary
                                </h2>
                                {isSummaryLoading ? (
                                    <div className="space-y-3">
                                        <div className="h-4 bg-surface-inset-light dark:bg-surface-inset-dark rounded w-5/6 animate-pulse"></div>
                                        <div className="h-4 bg-surface-inset-light dark:bg-surface-inset-dark rounded w-full animate-pulse"></div>
                                        <div className="h-4 bg-surface-inset-light dark:bg-surface-inset-dark rounded w-3/4 animate-pulse"></div>
                                    </div>
                                ) : (
                                    <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: summary }}></div>
                                )}
                            </div>
                        )}
                    </div>
                 </>
                )
            )}
        </Card>
    );

    const EmptyState = () => (
        <div className="h-full flex flex-col items-center justify-center text-center bg-surface-muted-light dark:bg-surface-muted-dark rounded-2xl border-2 border-dashed border-border-light dark:border-border-dark min-h-[50vh]">
            <DocumentPlusIcon className="h-16 w-16 text-text-muted-light dark:text-text-muted-dark" />
            <h3 className="text-xl font-semibold mt-4 text-text-primary-light dark:text-text-primary-dark">Select a note</h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Choose a note from the left to view its content, or create a new one.</p>
             <button onClick={() => handleNewNote()} className={`${pagePrimaryButtonStyles} mt-6 flex items-center gap-2`}>
                <PlusIcon className="h-5 w-5" />
                Create New Note
            </button>
        </div>
    );
    
    const TopicSelectionView = () => {
        const { topics, hasUncategorized } = topicsForSelectedSubject;
        
        const handleSelect = (topic: string) => {
            setFilterTopic(topic);
            setView('notes');
        };

        return (
            <div className="p-2">
                <div className="font-semibold text-text-secondary-light dark:text-text-secondary-dark px-2 pb-2 mb-1 border-b border-border-light dark:border-border-dark">
                    Topics for {getSubjectById(filterSubjectId)?.title}
                </div>
                <div className="space-y-1">
                    <button onClick={() => handleSelect('all')} className="w-full text-left p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-semibold">
                        All Notes
                    </button>
                    {topics.map(topic => (
                        <button key={topic} onClick={() => handleSelect(topic)} className="w-full text-left p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            {topic}
                        </button>
                    ))}
                    {hasUncategorized && (
                        <button onClick={() => handleSelect('__UNCATEGORIZED__')} className="w-full text-left p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            Uncategorized
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const NotesListView = () => (
         <div className="p-2 h-full flex flex-col">
            {filterSubjectId !== 'all' && (
                <button onClick={() => setView('topics')} className="flex items-center gap-2 text-sm font-semibold p-2 mb-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark">
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Topics
                </button>
            )}
            <div>
                {filteredNotes.length > 0 ? (
                    <div className="space-y-1">
                        {filteredNotes.map(note => <NoteListItem key={note.id} note={note} />)}
                    </div>
                ) : (
                    <div className="text-center p-8 text-text-secondary-light dark:text-text-secondary-dark h-full flex flex-col justify-center items-center">
                        <XCircleIcon className="h-10 w-10 mx-auto text-text-muted-light dark:text-text-muted-dark mb-2" />
                        <p className="font-semibold">No Notes Found</p>
                        <p className="text-sm">Try adjusting your filters or create a new note.</p>
                    </div>
                )}
            </div>
        </div>
    );
    
    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">My Notes</h2>
                <div className="flex flex-col sm:flex-row gap-2 items-center w-full md:w-auto">
                    <button onClick={() => setIsAIGenerateModalOpen(true)} className="px-4 py-2.5 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60 transition-colors duration-200 flex items-center justify-center gap-2 text-sm flex-grow sm:flex-grow-0 w-full sm:w-auto">
                        <SparklesIcon className="h-5 w-5" />
                        <span>Generate with AI</span>
                    </button>
                    <button onClick={() => handleNewNote()} className={`${pagePrimaryButtonStyles} flex items-center justify-center gap-2 flex-grow sm:flex-grow-0 w-full sm:w-auto`}>
                        <PlusIcon className="h-5 w-5" />
                        <span>New Note</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Left Column: Note List */}
                <div className="w-full md:w-1/3 lg:w-1/4 md:sticky md:top-6">
                    <div className="flex flex-col gap-4">
                        <Card className="p-4">
                            <div className="relative">
                                <MagnifyingGlassIcon className="h-5 w-5 absolute top-1/2 left-3 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark pointer-events-none" />
                                <input 
                                    type="text" 
                                    placeholder="Search notes..." 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    className={`${pageInputStyles} pl-10 !bg-surface-inset-light dark:!bg-surface-inset-dark`} 
                                />
                            </div>
                        </Card>
                        <Card className="p-4">
                             <label htmlFor="subject-filter" className="block text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-2">Filter by Subject</label>
                            <select 
                                id="subject-filter"
                                value={filterSubjectId} 
                                onChange={e => setFilterSubjectId(e.target.value)} 
                                className={`${pageInputStyles} !bg-surface-inset-light dark:!bg-surface-inset-dark`}
                            >
                                <option value="all">All Subjects</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>
                        </Card>
                         
                        <Card className="p-0 flex flex-col">
                           {view === 'topics' ? <TopicSelectionView /> : <NotesListView />}
                        </Card>
                    </div>
                </div>
                {/* Right Column: Notepad View */}
                <div className="w-full md:w-2/3 lg:w-3/4">
                    {selectedNote || isEditing ? <NotepadView /> : <EmptyState />}
                </div>
            </div>
            
            {isAIGenerateModalOpen && <AIGenerateNoteModal isOpen={isAIGenerateModalOpen} onClose={() => setIsAIGenerateModalOpen(false)} />}
            {isAIAssistantOpen && selectedNote && <AIAssistantModal isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} noteContent={selectedNote.content} />}
            {deletingNote && (
                <ConfirmationModal
                    isOpen={!!deletingNote}
                    onClose={() => setDeletingNote(null)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Note"
                    message={<>Are you sure you want to delete the note <strong>{deletingNote.title}</strong>? This action cannot be undone.</>}
                />
            )}
        </div>
    );
};

export default Notes;