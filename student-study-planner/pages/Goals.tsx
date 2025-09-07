import React, { useState } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useData } from '../contexts/DataContext';
import { Goal, GoalStatus } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, TrophyIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import AIGoalGeneratorModal from '../components/AIGoalGeneratorModal';
import AIIcon from '../components/AIIcon';

const inputStyles = "w-full px-4 py-2 bg-surface-inset-light dark:bg-surface-inset-dark border border-border-light dark:border-border-dark rounded-lg placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const primaryButtonStyles = "px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryButtonStyles = "px-5 py-2.5 bg-surface-inset-light text-text-primary-light font-semibold rounded-lg hover:bg-border-light dark:bg-surface-inset-dark dark:text-text-primary-dark dark:hover:bg-border-dark transition-colors duration-200 text-sm";
const pagePrimaryButtonStyles = "w-full sm:w-auto px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";

type GoalFormData = {
    title: string;
    description: string;
    targetDate: string;
    status: GoalStatus;
}

const GoalForm: React.FC<{ goal?: Goal | null, onSave: (goal: any) => void, onCancel: () => void, initialData?: Partial<GoalFormData> }> = ({ goal, onSave, onCancel, initialData }) => {
    const [formData, setFormData] = useState<GoalFormData>({
        title: goal?.title || initialData?.title || '',
        description: goal?.description || initialData?.description || '',
        targetDate: goal?.targetDate || initialData?.targetDate || '',
        status: goal?.status || initialData?.status || GoalStatus.NotStarted
    });
    
    React.useEffect(() => {
        if(initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({...goal, ...formData});
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <input name="title" type="text" value={formData.title} onChange={handleChange} placeholder="Goal Title" required className={inputStyles} />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" rows={4} className={inputStyles}></textarea>
                <div className="relative">
                    <input name="targetDate" type="date" value={formData.targetDate} onChange={handleChange} required className={`${inputStyles} pr-10`} />
                    <CalendarDaysIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted-light dark:text-text-muted-dark pointer-events-none" />
                </div>
                <select name="status" value={formData.status} onChange={handleChange} className={inputStyles}>
                    {Object.values(GoalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
             <div className="mt-8 pt-4 flex justify-end gap-3 border-t border-border-light dark:border-border-dark -mx-6 -mb-6 px-6 pb-6 bg-surface-muted-light dark:bg-surface-muted-dark rounded-b-2xl">
                <button type="button" onClick={onCancel} className={secondaryButtonStyles}>Cancel</button>
                <button type="submit" className={primaryButtonStyles}>Save Goal</button>
            </div>
        </form>
    )
}

const Goals: React.FC = () => {
    const { goals, addGoal, updateGoal, deleteGoal } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
    const [prefilledData, setPrefilledData] = useState<Partial<GoalFormData> | undefined>(undefined);


    const handleSave = (goal: Goal) => {
        if(goal.id) {
            updateGoal(goal);
        } else {
            addGoal(goal);
        }
        setIsModalOpen(false);
        setPrefilledData(undefined);
    };

    const handleEdit = (goal: Goal) => {
        setEditingGoal(goal);
        setPrefilledData(undefined);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingGoal(null);
        setPrefilledData(undefined);
        setIsModalOpen(true);
    }
    
    const handleDelete = (goal: Goal) => {
        setDeletingGoal(goal);
    };
    
    const handleConfirmDelete = () => {
        if (deletingGoal) {
            deleteGoal(deletingGoal.id);
        }
        setDeletingGoal(null);
    }
    
    const handleAIGenerate = (data: Partial<GoalFormData>) => {
        setPrefilledData(data);
        setIsAIGeneratorOpen(false);
        setEditingGoal(null);
        setIsModalOpen(true);
    }

    const getStatusClasses = (status: GoalStatus) => {
       switch(status) {
           case GoalStatus.Completed: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
           case GoalStatus.InProgress: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
           case GoalStatus.NotStarted: return 'bg-gray-100 text-gray-800 dark:bg-gray-600/50 dark:text-gray-200';
       }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">My Goals</h2>
                <div className="flex gap-2">
                     <button onClick={() => setIsAIGeneratorOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary dark:bg-primary/20 dark:text-red-300 font-semibold rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-all duration-300">
                        <AIIcon className="h-5 w-5" />
                        <span>Generate with AI</span>
                    </button>
                    <button onClick={handleAddNew} className={`${pagePrimaryButtonStyles} flex-1 sm:flex-none flex items-center justify-center gap-2`}>
                        <PlusIcon className="h-5 w-5" />
                        Set New Goal
                    </button>
                </div>
            </div>
            {goals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => (
                        <Card key={goal.id} className="flex flex-col">
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">{goal.title}</h3>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(goal.status)}`}>{goal.status}</span>
                                </div>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-2 flex-grow min-h-[4rem]">{goal.description}</p>
                                <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mt-4">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border-light dark:border-border-dark -mb-2">
                                <button onClick={() => handleEdit(goal)} className="p-2 text-text-muted-light dark:text-text-muted-dark hover:bg-surface-inset-light dark:hover:bg-surface-inset-dark rounded-lg"><PencilIcon className="h-5 w-5"/></button>
                                <button onClick={() => handleDelete(goal)} className="p-2 text-text-muted-light dark:text-text-muted-dark hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg"><TrashIcon className="h-5 w-5"/></button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 border-2 border-dashed border-border-light dark:border-border-dark rounded-2xl bg-surface-light dark:bg-surface-dark">
                    <TrophyIcon className="h-12 w-12 mx-auto text-text-muted-light dark:text-text-muted-dark" />
                    <h3 className="text-xl font-semibold mt-4 text-text-primary-light dark:text-text-primary-dark">No Goals Set</h3>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Set a new goal to start tracking your ambitions.</p>
                    <button onClick={handleAddNew} className={`${pagePrimaryButtonStyles} mt-6`}>Set Your First Goal</button>
                </div>
            )}
             <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setPrefilledData(undefined); }} title={editingGoal ? "Edit Goal" : "Add Goal"}>
                <GoalForm goal={editingGoal} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setPrefilledData(undefined); }} initialData={prefilledData} />
            </Modal>
            <AIGoalGeneratorModal 
                isOpen={isAIGeneratorOpen} 
                onClose={() => setIsAIGeneratorOpen(false)}
                onSelectGoal={handleAIGenerate}
            />
            {deletingGoal && (
                <ConfirmationModal
                    isOpen={!!deletingGoal}
                    onClose={() => setDeletingGoal(null)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Goal"
                    message={<>Are you sure you want to delete the goal <strong>{deletingGoal.title}</strong>? This action cannot be undone.</>}
                />
            )}
        </div>
    );
};

export default Goals;