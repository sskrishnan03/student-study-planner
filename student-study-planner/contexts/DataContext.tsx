import React, { createContext, useState, ReactNode, useContext } from 'react';
import { Subject, Task, Exam, Note, Goal, TimetableEvent } from '../types';

interface DataContextType {
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'progress'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  getSubjectById: (id: string) => Subject | undefined;
  
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;

  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;

  notes: Note[];
  getNotesBySubject: (subjectId: string) => Note[];
  getNoteById: (id: string) => Note | undefined;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'lastModified'>) => Note;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;

  events: TimetableEvent[];
  addEvent: (event: Omit<TimetableEvent, 'id'>) => void;
  updateEvent: (event: TimetableEvent) => void;
  deleteEvent: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [exams, setExams] = useLocalStorage<Exam[]>('exams', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [events, setEvents] = useLocalStorage<TimetableEvent[]>('events', []);

  // Subjects
  const addSubject = (subject: Omit<Subject, 'id' | 'progress'>) => setSubjects(prev => [...prev, { ...subject, id: Date.now().toString(), progress: 0 }]);
  const updateSubject = (updated: Subject) => setSubjects(prev => prev.map(s => s.id === updated.id ? updated : s));
  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setTasks(prev => prev.filter(t => t.subjectId !== id));
    setExams(prev => prev.filter(e => e.subjectId !== id));
    setNotes(prev => prev.filter(n => n.subjectId !== id));
  };
  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  // Tasks
  const addTask = (task: Omit<Task, 'id'>) => setTasks(prev => [...prev, { ...task, id: Date.now().toString() }]);
  const updateTask = (updated: Task) => setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  // Exams
  const addExam = (exam: Omit<Exam, 'id'>) => setExams(prev => [...prev, { ...exam, id: Date.now().toString() }]);
  const updateExam = (updated: Exam) => setExams(prev => prev.map(e => e.id === updated.id ? updated : e));
  const deleteExam = (id: string) => setExams(prev => prev.filter(e => e.id !== id));
  
  // Notes
  const getNotesBySubject = (subjectId: string) => notes.filter(n => n.subjectId === subjectId);
  const getNoteById = (id: string) => notes.find(n => n.id === id);
  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'lastModified'>): Note => {
      const now = new Date().toISOString();
      const newNote = { ...note, id: Date.now().toString(), createdAt: now, lastModified: now };
      setNotes(prev => [...prev, newNote]);
      return newNote;
  };
  const updateNote = (updated: Note) => {
      const now = new Date().toISOString();
      setNotes(prev => prev.map(n => n.id === updated.id ? { ...updated, lastModified: now } : n));
  };
  const deleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));
  
  // Goals
  const addGoal = (goal: Omit<Goal, 'id'>) => setGoals(prev => [...prev, { ...goal, id: Date.now().toString() }]);
  const updateGoal = (updated: Goal) => setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
  const deleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));
  
  // Events
  const addEvent = (event: Omit<TimetableEvent, 'id'>) => setEvents(prev => [...prev, { ...event, id: Date.now().toString() }]);
  const updateEvent = (updated: TimetableEvent) => setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  return (
    <DataContext.Provider value={{ 
      subjects, addSubject, updateSubject, deleteSubject, getSubjectById,
      tasks, addTask, updateTask, deleteTask,
      exams, addExam, updateExam, deleteExam,
      notes, getNotesBySubject, getNoteById, addNote, updateNote, deleteNote,
      goals, addGoal, updateGoal, deleteGoal,
      events, addEvent, updateEvent, deleteEvent
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
