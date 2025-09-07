import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useData } from '../contexts/DataContext';
import { Exam, SubjectType } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, AcademicCapIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const inputStyles = "w-full px-4 py-2 bg-surface-inset-light dark:bg-surface-inset-dark border border-border-light dark:border-border-dark rounded-lg placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const primaryButtonStyles = "px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryButtonStyles = "px-5 py-2.5 bg-surface-inset-light text-text-primary-light font-semibold rounded-lg hover:bg-border-light dark:bg-surface-inset-dark dark:text-text-primary-dark dark:hover:bg-border-dark transition-colors duration-200 text-sm";
const pagePrimaryButtonStyles = "w-full sm:w-auto px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";

const ExamForm: React.FC<{ exam?: Exam | null, onSave: (exam: any) => void, onCancel: () => void }> = ({ exam, onSave, onCancel }) => {
    const { subjects } = useData();
    const [formData, setFormData] = useState({
        title: exam?.title || '',
        subjectId: exam?.subjectId || (subjects.length > 0 ? subjects[0].id : ''),
        date: exam?.date || '',
        type: exam?.type || SubjectType.Theory
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.subjectId) {
            alert("Please create a subject first.");
            return;
        }
        onSave({ ...exam, ...formData });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <input name="title" type="text" value={formData.title} onChange={handleChange} placeholder="Exam Title (e.g., Midterm)" required className={inputStyles} />
                <select name="subjectId" value={formData.subjectId} onChange={handleChange} required className={inputStyles}>
                    <option value="" disabled>Select a Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                <div className="relative">
                    <input name="date" type="date" value={formData.date} onChange={handleChange} required className={`${inputStyles} pr-10`} />
                    <CalendarDaysIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted-light dark:text-text-muted-dark pointer-events-none" />
                </div>
                <select name="type" value={formData.type} onChange={handleChange} className={inputStyles}>
                    {Object.values(SubjectType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div className="mt-8 pt-4 flex justify-end gap-3 border-t border-border-light dark:border-border-dark -mx-6 -mb-6 px-6 pb-6 bg-surface-muted-light dark:bg-surface-muted-dark rounded-b-2xl">
                <button type="button" onClick={onCancel} className={secondaryButtonStyles}>Cancel</button>
                <button type="submit" className={primaryButtonStyles} disabled={subjects.length === 0}>Save Exam</button>
            </div>
        </form>
    );
};


const Countdown: React.FC<{ date: string, color: string }> = ({ date, color }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(date) - +new Date();
        let timeLeft: { days?: number, hours?: number, minutes?: number, seconds?: number } = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [date]);

    if (!timeLeft.days && !timeLeft.hours && !timeLeft.minutes && timeLeft.days !== 0) {
        return <div className="text-center p-4 rounded-lg mt-4 bg-surface-inset-light dark:bg-surface-inset-dark"><span className="font-bold text-red-500">Exam day is here or has passed!</span></div>;
    }

    const timeParts = [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
    ];

    return (
        <div className="grid grid-cols-4 gap-4 text-center mt-4">
            {timeParts.map(part => (
                <div key={part.label} className="p-3 bg-surface-muted-light dark:bg-surface-muted-dark rounded-lg">
                    <p className="text-3xl font-bold" style={{ color: color }}>{String(part.value || 0).padStart(2, '0')}</p>
                    <p className="text-xs uppercase text-text-muted-light dark:text-text-muted-dark">{part.label}</p>
                </div>
            ))}
        </div>
    );
};


const Exams: React.FC = () => {
  const { exams, addExam, updateExam, deleteExam, getSubjectById } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [deletingExam, setDeletingExam] = useState<Exam | null>(null);

  const handleSave = (exam: Exam) => {
      if(exam.id) {
          updateExam(exam);
      } else {
          addExam(exam);
      }
      setIsModalOpen(false);
  };
  
  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  };
  
  const handleDelete = (exam: Exam) => {
      setDeletingExam(exam);
  };

  const handleConfirmDelete = () => {
    if (deletingExam) {
      deleteExam(deletingExam.id);
    }
    setDeletingExam(null);
  }

  return (
    <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">Exam Schedule</h2>
            <button onClick={() => { setEditingExam(null); setIsModalOpen(true); }} className={`${pagePrimaryButtonStyles} flex items-center gap-2`}>
                <PlusIcon className="h-5 w-5" />
                Add Exam
            </button>
        </div>
        {exams.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {exams.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(exam => {
                    const subject = getSubjectById(exam.subjectId);
                    const subjectColor = subject?.color || '#EF4444';
                    return (
                        <Card key={exam.id} className="border-t-4" style={{ borderColor: subjectColor }}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 pr-4">
                                    <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{exam.title}</h3>
                                    {subject && (
                                        <span 
                                            className="px-2.5 py-1 text-xs font-semibold rounded-full inline-block mt-2" 
                                            style={{ backgroundColor: `${subjectColor}20`, color: subjectColor }}
                                        >
                                            {subject.title}
                                        </span>
                                    )}
                                    <p className="text-sm font-semibold mt-2 flex items-center gap-2" style={{ color: subjectColor }}>
                                        <CalendarDaysIcon className="h-4 w-4" />
                                        {new Date(exam.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                 <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => handleEdit(exam)} className="p-2 text-text-muted-light dark:text-text-muted-dark hover:bg-surface-inset-light dark:hover:bg-surface-inset-dark rounded-lg"><PencilIcon className="h-5 w-5"/></button>
                                    <button onClick={() => handleDelete(exam)} className="p-2 text-text-muted-light dark:text-text-muted-dark hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            </div>
                            <Countdown date={exam.date} color={subjectColor} />
                        </Card>
                    );
                })}
            </div>
        ) : (
             <div className="text-center py-16 border-2 border-dashed border-border-light dark:border-border-dark rounded-2xl bg-surface-light dark:bg-surface-dark">
                <AcademicCapIcon className="h-12 w-12 mx-auto text-text-muted-light dark:text-text-muted-dark" />
                <h3 className="text-xl font-semibold mt-4 text-text-primary-light dark:text-text-primary-dark">No Exams Scheduled</h3>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">Stay ahead of the game. Add your upcoming exams to start the countdown.</p>
                <button onClick={() => { setEditingExam(null); setIsModalOpen(true); }} className={`${pagePrimaryButtonStyles} mt-6`}>Schedule First Exam</button>
            </div>
        )}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExam ? "Edit Exam" : "Add Exam"}>
            <ExamForm exam={editingExam} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
        </Modal>
        {deletingExam && (
            <ConfirmationModal
                isOpen={!!deletingExam}
                onClose={() => setDeletingExam(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Exam"
                message={<>Are you sure you want to delete the <strong>{deletingExam.title}</strong> exam for <strong>{getSubjectById(deletingExam.subjectId)?.title}</strong>? This action cannot be undone.</>}
            />
        )}
    </div>
  );
};

export default Exams;