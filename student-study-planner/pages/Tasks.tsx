import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Task, TaskStatus, Priority } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, FireIcon, CalendarDaysIcon, XCircleIcon, BookOpenIcon, TagIcon } from '@heroicons/react/24/outline';

const inputStyles = "w-full px-4 py-2 bg-surface-inset-light dark:bg-surface-inset-dark border border-border-light dark:border-border-dark rounded-lg placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const primaryButtonStyles = "px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryButtonStyles = "px-5 py-2.5 bg-surface-inset-light text-text-primary-light font-semibold rounded-lg hover:bg-border-light dark:bg-surface-inset-dark dark:text-text-primary-dark dark:hover:bg-border-dark transition-colors duration-200 text-sm";
const pagePrimaryButtonStyles = "w-full sm:w-auto px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";
const filterInputStyles = "w-full p-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition";

const TaskForm: React.FC<{ task?: Task | null, onSave: (task: any) => void, onCancel: () => void }> = ({ task, onSave, onCancel }) => {
    const { subjects } = useData();
    const [formData, setFormData] = useState({
        title: task?.title || '',
        subjectId: task?.subjectId || '',
        deadline: task?.deadline || '',
        priority: task?.priority || Priority.Medium,
        status: task?.status || TaskStatus.Pending,
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...task, ...formData, subjectId: formData.subjectId || undefined });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Task Title" required className={inputStyles} />
                <select name="subjectId" value={formData.subjectId} onChange={handleChange} className={inputStyles}>
                     <option value="">General Task (No Subject)</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                <div className="relative">
                     <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required className={`${inputStyles} pr-10`} />
                     <CalendarDaysIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted-light dark:text-text-muted-dark pointer-events-none" />
                </div>
                <select name="priority" value={formData.priority} onChange={handleChange} className={inputStyles}>
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select name="status" value={formData.status} onChange={handleChange} className={inputStyles}>
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="mt-8 pt-4 flex justify-end gap-3 border-t border-border-light dark:border-border-dark -mx-6 -mb-6 px-6 pb-6 bg-surface-muted-light dark:bg-surface-muted-dark rounded-b-2xl">
                <button type="button" onClick={onCancel} className={secondaryButtonStyles}>Cancel</button>
                <button type="submit" className={primaryButtonStyles}>Save Task</button>
            </div>
        </form>
    );
};


const TaskCard: React.FC<{ 
    task: Task; 
    onEdit: (task: Task) => void; 
    onDelete: (task: Task) => void; 
    onDragStart: (taskId: string) => void;
}> = ({ task, onEdit, onDelete, onDragStart }) => {
    const { getSubjectById } = useData();

    const priorityInfo = {
        [Priority.High]: { icon: <FireIcon className="h-4 w-4 text-red-500" />, text: 'High', classes: 'border-red-500' },
        [Priority.Medium]: { icon: null, text: 'Medium', classes: 'border-yellow-500' },
        [Priority.Low]: { icon: null, text: 'Low', classes: 'border-green-500' },
    };

    return (
        <div 
            className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark mb-4 p-4 border-l-4 ${priorityInfo[task.priority].classes} cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow`}
            draggable="true"
            onDragStart={() => onDragStart(task.id)}
        >
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark">{task.title}</h4>
                <div className="flex gap-1 -mr-2 -mt-1">
                    <button onClick={() => onEdit(task)} className="p-1.5 text-text-muted-light dark:text-text-muted-dark hover:bg-surface-inset-light dark:hover:bg-surface-inset-dark rounded-md"><PencilIcon className="h-4 w-4"/></button>
                    <button onClick={() => onDelete(task)} className="p-1.5 text-text-muted-light dark:text-text-muted-dark hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 rounded-md"><TrashIcon className="h-4 w-4"/></button>
                </div>
            </div>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">{getSubjectById(task.subjectId || '')?.title || 'General Task'}</p>
            <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                 {priorityInfo[task.priority].icon && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                        {priorityInfo[task.priority].icon}
                        {priorityInfo[task.priority].text}
                    </span>
                 )}
            </div>
        </div>
    )
};


const KanbanColumn: React.FC<{ 
    title: string; 
    tasks: Task[]; 
    onEdit: (task: Task) => void; 
    onDelete: (task: Task) => void; 
    status: TaskStatus;
    onDragStart: (taskId: string) => void;
    onDrop: (status: TaskStatus) => void;
}> = ({ title, tasks, onEdit, onDelete, status, onDragStart, onDrop }) => {
    const [isOver, setIsOver] = useState(false);
    
    const statusColors = {
        [TaskStatus.Pending]: 'border-amber-500 text-amber-500',
        [TaskStatus.InProgress]: 'border-blue-500 text-blue-500',
        [TaskStatus.Submitted]: 'border-emerald-500 text-emerald-500',
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
        onDrop(status);
    };

    return (
        <div 
            className={`bg-surface-muted-light dark:bg-surface-muted-dark rounded-xl w-full transition-colors border-2 border-transparent ${isOver ? 'border-primary' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <h3 className={`text-lg font-semibold p-4 border-b-2 ${statusColors[status]} text-text-primary-light dark:text-text-primary-dark`}>
                {title} <span className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark">{tasks.length}</span>
            </h3>
            <div className="p-4">
                {tasks.map(task => <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onDragStart={onDragStart} />)}
            </div>
        </div>
    );
};


const Tasks: React.FC = () => {
    const { tasks, subjects, addTask, updateTask, deleteTask } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const [filterSubjectId, setFilterSubjectId] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const handleAdd = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };
    
    const handleDelete = (task: Task) => {
        setDeletingTask(task);
    };

    const handleConfirmDelete = () => {
        if (deletingTask) {
            deleteTask(deletingTask.id);
        }
        setDeletingTask(null);
    };

    const handleSave = (task: Task) => {
        if(task.id) {
            updateTask(task);
        } else {
            addTask(task);
        }
        setIsModalOpen(false);
    };
    
    const handleDrop = (newStatus: TaskStatus) => {
        if(!draggedTaskId) return;
        const taskToMove = tasks.find(t => t.id === draggedTaskId);
        if (taskToMove && taskToMove.status !== newStatus) {
            updateTask({ ...taskToMove, status: newStatus });
        }
        setDraggedTaskId(null);
    };
    
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const subjectMatch = filterSubjectId === 'all' || task.subjectId === filterSubjectId;
            const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
            const startMatch = !filterStartDate || task.deadline >= filterStartDate;
            const endMatch = !filterEndDate || task.deadline <= filterEndDate;
            return subjectMatch && priorityMatch && startMatch && endMatch;
        });
    }, [tasks, filterSubjectId, filterPriority, filterStartDate, filterEndDate]);

    const categorizedTasks = useMemo(() => {
        return filteredTasks.reduce((acc, task) => {
            if (!acc[task.status]) acc[task.status] = [];
            acc[task.status].push(task);
            return acc;
        }, {} as Record<TaskStatus, Task[]>);
    }, [filteredTasks]);

    const handleResetFilters = () => {
        setFilterSubjectId('all');
        setFilterPriority('all');
        setFilterStartDate('');
        setFilterEndDate('');
    }

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">Task Board</h2>
                <button onClick={handleAdd} className={`${pagePrimaryButtonStyles} flex items-center gap-2`}>
                    <PlusIcon className="h-5 w-5" />
                    Add Task
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-surface-muted-light dark:bg-surface-muted-dark rounded-xl border border-border-light dark:border-border-dark">
                <div className="lg:col-span-1">
                    <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1 block">Subject</label>
                    <div className="relative">
                        <BookOpenIcon className="h-5 w-5 absolute top-1/2 left-3 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark pointer-events-none" />
                        <select value={filterSubjectId} onChange={e => setFilterSubjectId(e.target.value)} className={`${filterInputStyles} pl-10`}>
                            <option value="all">All Subjects</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1 block">Priority</label>
                     <div className="relative">
                        <TagIcon className="h-5 w-5 absolute top-1/2 left-3 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark pointer-events-none" />
                        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className={`${filterInputStyles} pl-10`}>
                            <option value="all">All Priorities</option>
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1 block">Start Date</label>
                    <div className="relative">
                        <CalendarDaysIcon className="h-5 w-5 absolute top-1/2 left-3 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark pointer-events-none" />
                        <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className={`${filterInputStyles} pl-10`} />
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1 block">End Date</label>
                     <div className="relative">
                        <CalendarDaysIcon className="h-5 w-5 absolute top-1/2 left-3 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark pointer-events-none" />
                        <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className={`${filterInputStyles} pl-10`} />
                    </div>
                </div>
                <div className="flex items-end">
                    <button onClick={handleResetFilters} className={`${secondaryButtonStyles} w-full !py-2`}>Clear Filters</button>
                </div>
            </div>

            {tasks.length > 0 ? (
                filteredTasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(Object.keys(TaskStatus) as Array<keyof typeof TaskStatus>).map(key => (
                            <KanbanColumn 
                                key={TaskStatus[key]}
                                title={TaskStatus[key]}
                                tasks={(categorizedTasks[TaskStatus[key]] || []).sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())} 
                                onEdit={handleEdit} 
                                onDelete={handleDelete}
                                status={TaskStatus[key]}
                                onDragStart={setDraggedTaskId}
                                onDrop={handleDrop}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-border-light dark:border-border-dark rounded-2xl bg-surface-light dark:bg-surface-dark">
                         <XCircleIcon className="h-12 w-12 mx-auto text-text-muted-light dark:text-text-muted-dark" />
                        <h3 className="text-xl font-semibold mt-4 text-text-primary-light dark:text-text-primary-dark">No Tasks Found</h3>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">No tasks match your current filters. Try adjusting your search.</p>
                        <button onClick={handleResetFilters} className={`${pagePrimaryButtonStyles} mt-6`}>Clear Filters</button>
                    </div>
                )
            ) : (
                 <div className="text-center py-16 border-2 border-dashed border-border-light dark:border-border-dark rounded-2xl bg-surface-light dark:bg-surface-dark">
                     <CheckCircleIcon className="h-12 w-12 mx-auto text-text-muted-light dark:text-text-muted-dark" />
                    <h3 className="text-xl font-semibold mt-4 text-text-primary-light dark:text-text-primary-dark">You're All Caught Up!</h3>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">No tasks on your board. Create a new task to get started.</p>
                    <button onClick={handleAdd} className={`${pagePrimaryButtonStyles} mt-6`}>Add Your First Task</button>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTask ? "Edit Task" : "Add New Task"}>
                <TaskForm task={editingTask} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
            {deletingTask && (
                <ConfirmationModal
                    isOpen={!!deletingTask}
                    onClose={() => setDeletingTask(null)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Task"
                    message={<>Are you sure you want to delete the task <strong>{deletingTask.title}</strong>? This action cannot be undone.</>}
                />
            )}
        </div>
    );
};

export default Tasks;