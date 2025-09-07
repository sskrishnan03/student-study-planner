import React, { useState, useRef, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { Subject, SubjectType } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, BookOpenIcon, ArrowRightIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

const inputStyles = "w-full px-4 py-2 bg-surface-inset-light dark:bg-surface-inset-dark border border-border-light dark:border-border-dark rounded-lg placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const primaryButtonStyles = "px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryButtonStyles = "px-5 py-2.5 bg-surface-inset-light text-text-primary-light font-semibold rounded-lg hover:bg-border-light dark:bg-surface-inset-dark dark:text-text-primary-dark dark:hover:bg-border-dark transition-colors duration-200 text-sm";
const pagePrimaryButtonStyles = "w-full sm:w-auto px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";

const SubjectForm: React.FC<{ subject?: Subject | null; onSave: (subject: any) => void; onCancel: () => void }> = ({ subject, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: subject?.title || '',
        instructor: subject?.instructor || '',
        semester: subject?.semester || '',
        type: subject?.type || SubjectType.Theory,
        progress: subject?.progress || 0,
        color: subject?.color || '#ef4444',
    });
    
    const colorInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'progress' ? parseInt(value, 10) : value 
        }));
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, color: e.target.value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...subject, ...formData });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Subject Title" required className={inputStyles} />
                <input type="text" name="instructor" value={formData.instructor} onChange={handleChange} placeholder="Instructor (Optional)" className={inputStyles} />
                <input type="text" name="semester" value={formData.semester} onChange={handleChange} placeholder="Semester (Optional)" className={inputStyles} />
                <select name="type" value={formData.type} onChange={handleChange} className={inputStyles}>
                    {Object.values(SubjectType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                
                <div>
                    <label htmlFor="progress" className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2 block flex justify-between">
                        <span>Progress</span>
                        <span className="font-bold text-primary">{formData.progress}%</span>
                    </label>
                    <input
                        id="progress"
                        type="range"
                        name="progress"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={handleChange}
                        className="w-full h-2 bg-surface-inset-light dark:bg-surface-inset-dark rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2 block">Color</label>
                     <div className="relative flex items-center bg-surface-inset-light dark:bg-surface-inset-dark border border-border-light dark:border-border-dark rounded-lg">
                        <div className="pl-3 pr-2 cursor-pointer" onClick={() => colorInputRef.current?.click()}>
                            <div className="w-6 h-6 rounded-md border border-border-light dark:border-border-dark" style={{ backgroundColor: formData.color }}></div>
                            <input ref={colorInputRef} type="color" value={formData.color} onChange={handleColorChange} className="absolute w-0 h-0 opacity-0" />
                        </div>
                        <input type="text" name="color" value={formData.color} onChange={handleColorChange} className={`w-full pr-4 py-2 bg-transparent font-mono focus:outline-none ${inputStyles} border-0 focus:ring-0`} placeholder="#ef4444" />
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-4 flex justify-end gap-3 border-t border-border-light dark:border-border-dark -mx-6 -mb-6 px-6 pb-6 bg-surface-muted-light dark:bg-surface-muted-dark rounded-b-2xl">
                <button type="button" onClick={onCancel} className={secondaryButtonStyles}>Cancel</button>
                <button type="submit" className={primaryButtonStyles}>Save Subject</button>
            </div>
        </form>
    );
};

const SubjectDetailModal: React.FC<{ subject: Subject; onClose: () => void; onDelete: (subject: Subject) => void; }> = ({ subject, onClose, onDelete }) => {
    const { updateSubject, getNotesBySubject } = useData();
    const navigate = useNavigate();
    const [isEditingSubject, setIsEditingSubject] = useState(false);
    
    const subjectNotes = getNotesBySubject(subject.id).sort((a,b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

    const handleSubjectSave = (updatedSubject: Subject) => {
        updateSubject(updatedSubject);
        setIsEditingSubject(false);
    };
    
    const navigateToNotes = (action: 'view' | 'new' = 'view') => {
        navigate('/notes', { state: { filterSubjectId: subject.id, action } });
        onClose();
    }

    return (
        <Modal isOpen={!!subject} onClose={onClose} title={isEditingSubject ? "Edit Subject" : subject.title} size="lg">
            {isEditingSubject ? (
                <SubjectForm subject={subject} onSave={handleSubjectSave} onCancel={() => setIsEditingSubject(false)} />
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                             {subject.instructor && <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg">Prof. {subject.instructor}</p>}
                            <div className="flex items-center gap-4 text-sm mt-2">
                                {subject.semester && <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">Semester: {subject.semester}</span>}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsEditingSubject(true)} className="p-2.5 bg-surface-inset-light dark:bg-surface-inset-dark rounded-lg hover:bg-border-light dark:hover:bg-border-dark transition-colors"><PencilIcon className="h-5 w-5" /></button>
                            <button onClick={() => onDelete(subject)} className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"><TrashIcon className="h-5 w-5" /></button>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-text-primary-light dark:text-text-primary-dark">Recent Notes</h4>
                        <div className="space-y-2">
                            {subjectNotes.length > 0 ? (
                                <>
                                    {subjectNotes.slice(0, 3).map(note => (
                                        <div key={note.id} className="p-4 bg-surface-inset-light dark:bg-surface-inset-dark rounded-lg flex justify-between items-center group cursor-pointer hover:bg-primary-light dark:hover:bg-primary/20 transition-colors" onClick={() => navigateToNotes('view')}>
                                            <div>
                                                <p className="font-semibold">{note.title}</p>
                                                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Last modified: {new Date(note.lastModified).toLocaleDateString()}</p>
                                            </div>
                                            <ArrowRightIcon className="h-5 w-5 text-text-muted-light dark:text-text-muted-dark group-hover:text-primary transition-colors" />
                                        </div>
                                    ))}
                                    <button onClick={() => navigateToNotes('view')} className={`${pagePrimaryButtonStyles} w-full mt-4 !py-2`}>
                                        Manage All Notes
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg border-border-light dark:border-border-dark">
                                    <p className="text-text-secondary-light dark:text-text-secondary-dark">No notes for this subject yet.</p>
                                    <button onClick={() => navigateToNotes('new')} className="text-primary font-semibold hover:underline mt-2">Create a note</button>

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

const Subjects: React.FC = () => {
    const { subjects, addSubject, updateSubject, deleteSubject, getNotesBySubject } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [viewingSubject, setViewingSubject] = useState<Subject | null>(null);
    const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
    const [activeFilter, setActiveFilter] = useState<'All' | SubjectType>('All');

    const filteredSubjects = useMemo(() => {
        const sortedSubjects = [...subjects].sort((a, b) => a.title.localeCompare(b.title));
        if (activeFilter === 'All') {
            return sortedSubjects;
        }
        return sortedSubjects.filter(subject => subject.type === activeFilter);
    }, [subjects, activeFilter]);


    const handleAdd = () => {
        setEditingSubject(null);
        setIsModalOpen(true);
    };

    const handleSave = (subject: Subject) => {
        if(subject.id) {
            updateSubject(subject);
        } else {
            addSubject(subject);
        }
        setIsModalOpen(false);
    };

    const handleDeleteClick = (subject: Subject) => {
        setViewingSubject(null);
        setDeletingSubject(subject);
    };

    const handleConfirmDelete = () => {
        if (deletingSubject) {
            deleteSubject(deletingSubject.id);
        }
        setDeletingSubject(null);
    };
    
    const renderSubjectGrid = (subjectList: Subject[]) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectList.map(subject => {
                const noteCount = getNotesBySubject(subject.id).length;
                return (
                    <Card key={subject.id} className="flex flex-col group hover:border-primary/50" onClick={() => setViewingSubject(subject)}>
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark group-hover:text-primary transition-colors">{subject.title}</h3>
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${subject.type === SubjectType.Theory ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'}`}>{subject.type}</span>
                            </div>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">{subject.instructor ? `Prof. ${subject.instructor}` : <>&nbsp;</> }</p>
                            <div className="mt-4">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">Progress</span>
                                    <span className="text-sm font-bold" style={{color: subject.color}}>{subject.progress}%</span>
                                </div>
                                <div className="w-full bg-surface-inset-light rounded-full h-2.5 dark:bg-surface-inset-dark">
                                    <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${subject.progress}%`, backgroundColor: subject.color || '#EF4444' }}></div>
                                </div>
                            </div>
                        </div>
                         <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-between text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            <div className="flex items-center">
                                <PencilSquareIcon className="h-4 w-4 mr-2"/>
                                <span>{noteCount} {noteCount === 1 ? 'Note' : 'Notes'}</span>
                            </div>
                            <ArrowRightIcon className="h-5 w-5 text-text-muted-light dark:text-text-muted-dark group-hover:text-primary transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </Card>
                );
            })}
        </div>
    );
    
    const FilterButton = ({ filterType, label }: { filterType: 'All' | SubjectType, label: string }) => (
         <button 
            onClick={() => setActiveFilter(filterType)} 
            className={`px-4 py-2 text-sm font-semibold rounded-md flex-1 text-center transition-colors duration-200 ${activeFilter === filterType ? 'bg-surface-light dark:bg-surface-dark shadow-sm text-text-primary-light dark:text-text-primary-dark' : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">Subjects</h2>
                <button onClick={handleAdd} className={`${pagePrimaryButtonStyles} flex items-center gap-2`}>
                    <PlusIcon className="h-5 w-5" />
                    Add Subject
                </button>
            </div>
            
            <div className="mb-6">
                <div className="inline-flex rounded-lg bg-surface-inset-light dark:bg-surface-inset-dark p-1 border border-border-light dark:border-border-dark">
                    <FilterButton filterType="All" label="All" />
                    <FilterButton filterType={SubjectType.Theory} label="Theory" />
                    <FilterButton filterType={SubjectType.Practical} label="Practical" />
                </div>
            </div>

            {subjects.length > 0 ? (
                filteredSubjects.length > 0 ? (
                    renderSubjectGrid(filteredSubjects)
                ) : (
                    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 min-h-[calc(100vh-280px)] flex flex-col items-center justify-center text-center border border-border-light dark:border-border-dark">
                        <BookOpenIcon className="h-12 w-12 mx-auto text-text-muted-light dark:text-text-muted-dark" />
                        <h3 className="text-xl font-bold mt-4 text-text-primary-light dark:text-text-primary-dark">No Subjects Found</h3>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">There are no subjects matching the "{activeFilter}" filter.</p>
                    </div>
                )
            ) : (
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 min-h-[calc(100vh-280px)] flex flex-col items-center justify-center text-center border-2 border-dashed border-border-light dark:border-border-dark">
                    <BookOpenIcon className="h-12 w-12 mx-auto text-text-muted-light dark:text-text-muted-dark" />
                    <h3 className="text-xl font-bold mt-4 text-text-primary-light dark:text-text-primary-dark">No Subjects Yet</h3>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2 max-w-sm">Add your subjects to get started with your study plan.</p>
                    <button onClick={handleAdd} className={`${pagePrimaryButtonStyles} mt-6`}>
                        Add a New Subject
                    </button>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSubject ? "Edit Subject" : "Add New Subject"}>
                <SubjectForm subject={editingSubject} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
            {viewingSubject && <SubjectDetailModal subject={viewingSubject} onClose={() => setViewingSubject(null)} onDelete={handleDeleteClick} />}
            {deletingSubject && (
                <ConfirmationModal
                    isOpen={!!deletingSubject}
                    onClose={() => setDeletingSubject(null)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Subject"
                    message={<>Are you sure you want to delete <strong>{deletingSubject.title}</strong>? This will also delete all associated tasks, exams, and notes. This action cannot be undone.</>}
                />
            )}
        </div>
    );
};

export default Subjects;