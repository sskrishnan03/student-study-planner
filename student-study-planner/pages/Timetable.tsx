import React, { useState } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useData } from '../contexts/DataContext';
import { TimetableEvent } from '../types';
import { PlusIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const inputStyles = "w-full px-4 py-2 bg-surface-inset-light dark:bg-surface-inset-dark border border-border-light dark:border-border-dark rounded-lg placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const primaryButtonStyles = "px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryButtonStyles = "px-5 py-2.5 bg-surface-inset-light text-text-primary-light font-semibold rounded-lg hover:bg-border-light dark:bg-surface-inset-dark dark:text-text-primary-dark dark:hover:bg-border-dark transition-colors duration-200 text-sm";
const pagePrimaryButtonStyles = "w-full sm:w-auto px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";
const dangerButtonStyles = "px-5 py-2.5 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60 transition-colors duration-200 text-sm";

// Date utility functions
const toYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};
const isSameDate = (date1: Date, date2str: string) => toYYYYMMDD(date1) === date2str;


const EventForm: React.FC<{ 
    event?: TimetableEvent | null; 
    onSave: (event: any) => void; 
    onCancel: () => void; 
    onDelete?: (event: TimetableEvent) => void; 
}> = ({ event, onSave, onCancel, onDelete }) => {
    const { subjects } = useData();
    const [eventType, setEventType] = useState<'subject' | 'custom'>(event?.subjectId ? 'subject' : 'custom');
    
    const [formData, setFormData] = useState({
        title: event?.title || '',
        date: event?.date || toYYYYMMDD(new Date()),
        startTime: event?.startTime || '09:00',
        endTime: event?.endTime || '10:00',
        color: event?.color || '#3b82f6',
        subjectId: event?.subjectId || (subjects.length > 0 ? subjects[0].id : undefined)
    });
    
    React.useEffect(() => {
        if (eventType === 'subject') {
            const subject = subjects.find(s => s.id === formData.subjectId);

            if (!subject && subjects.length > 0) {
                const firstSubject = subjects[0];
                setFormData(prev => ({
                    ...prev,
                    title: firstSubject.title,
                    color: firstSubject.color,
                    subjectId: firstSubject.id,
                }));
            } 
            else if (subject && (formData.title !== subject.title || formData.color !== subject.color)) {
                setFormData(prev => ({
                    ...prev,
                    title: subject.title,
                    color: subject.color,
                }));
            }
        } else { // eventType is 'custom'
            if (formData.subjectId !== undefined) {
                 setFormData(prev => ({ 
                     ...prev, 
                     subjectId: undefined,
                     color: '#3b82f6',
                     title: event?.subjectId ? '' : (event?.title || '')
                }));
            }
        }
    }, [eventType, formData.subjectId, subjects, event]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...event, ...formData });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div className="flex items-center p-1 bg-surface-inset-light dark:bg-surface-inset-dark rounded-lg">
                    <label className="flex-1 text-center relative">
                        <input type="radio" name="eventType" value="subject" checked={eventType === 'subject'} onChange={() => setEventType('subject')} className="sr-only" disabled={subjects.length === 0} />
                        <div className={`cursor-pointer w-full px-4 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${eventType === 'subject' ? 'bg-surface-light dark:bg-surface-dark shadow text-text-primary-light dark:text-text-primary-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>
                           From Subject
                        </div>
                    </label>
                    <label className="flex-1 text-center">
                        <input type="radio" name="eventType" value="custom" checked={eventType === 'custom'} onChange={() => setEventType('custom')} className="sr-only" />
                        <div className={`cursor-pointer w-full px-4 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${eventType === 'custom' ? 'bg-surface-light dark:bg-surface-dark shadow text-text-primary-light dark:text-text-primary-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>
                           Custom Event
                        </div>
                    </label>
                </div>

                {eventType === 'subject' ? (
                    <select name="subjectId" value={formData.subjectId || ''} onChange={handleChange} className={inputStyles} disabled={subjects.length === 0}>
                        {subjects.length > 0 ? (
                           subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)
                        ) : (
                           <option>Please create a subject first</option>
                        )}
                    </select>
                ) : (
                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Event Title" required className={inputStyles} />
                )}
                
                <div className="relative">
                    <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1 block absolute -top-2 left-3 bg-surface-light dark:bg-surface-dark px-1">Date</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputStyles} />
                    <CalendarDaysIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted-light dark:text-text-muted-dark pointer-events-none" />
                </div>

                <div className="flex gap-4">
                    <div className="w-1/2 relative">
                        <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1 block absolute -top-2 left-3 bg-surface-light dark:bg-surface-dark px-1">Start Time</label>
                        <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className={inputStyles} />
                         <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted-light dark:text-text-muted-dark pointer-events-none" />
                    </div>
                    <div className="w-1/2 relative">
                        <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1 block absolute -top-2 left-3 bg-surface-light dark:bg-surface-dark px-1">End Time</label>
                        <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className={inputStyles} />
                        <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted-light dark:text-text-muted-dark pointer-events-none" />
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-4 flex justify-between items-center border-t border-border-light dark:border-border-dark -mx-6 -mb-6 px-6 pb-6 bg-surface-muted-light dark:bg-surface-muted-dark rounded-b-2xl">
                <div>
                     {event && onDelete && (
                        <button type="button" onClick={() => onDelete(event)} className={dangerButtonStyles}>Delete</button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={onCancel} className={secondaryButtonStyles}>Cancel</button>
                    <button type="submit" className={primaryButtonStyles} disabled={eventType==='subject' && subjects.length === 0}>Save Event</button>
                </div>
            </div>
        </form>
    );
};

const Timetable: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimetableEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<TimetableEvent | null>(null);
  const [currentView, setCurrentView] = useState<'week' | 'month' | 'day'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleSave = (event: TimetableEvent) => {
    if(event.id) {
        updateEvent(event);
    } else {
        addEvent(event);
    }
    setIsModalOpen(false);
  };
  
  const handleEdit = (event: TimetableEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };
  
  const handleDelete = (event: TimetableEvent) => {
    setIsModalOpen(false);
    setDeletingEvent(event);
  };

  const handleConfirmDelete = () => {
    if (deletingEvent) {
      deleteEvent(deletingEvent.id);
    }
    setDeletingEvent(null);
  }

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'week') newDate.setDate(currentDate.getDate() - 7);
    else if (currentView === 'month') newDate.setMonth(currentDate.getMonth() - 1);
    else if (currentView === 'day') newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'week') newDate.setDate(currentDate.getDate() + 7);
    else if (currentView === 'month') newDate.setMonth(currentDate.getMonth() + 1);
    else if (currentView === 'day') newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };
  
  const handleToday = () => setCurrentDate(new Date());
  
  const getHeaderTitle = () => {
    if (currentView === 'week') {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (currentView === 'month') return currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    return currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  };
  
  const hours = Array.from({length: 15}, (_, i) => `${String(i + 7).padStart(2, '0')}:00`); // 7am to 9pm
  const getEventPosition = (event: TimetableEvent) => {
      const start = (parseInt(event.startTime.split(':')[0]) - 7) * 60 + parseInt(event.startTime.split(':')[1]);
      const end = (parseInt(event.endTime.split(':')[0]) - 7) * 60 + parseInt(event.endTime.split(':')[1]);
      const top = Math.max(0, (start / (15 * 60)) * 100);
      const height = Math.max(0, ((end - start) / (15 * 60)) * 100);
      return { top: `${top}%`, height: `${height}%` };
  }

  const renderWeeklyView = () => {
    const today = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDates = Array.from({length: 7}, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return date;
    });

    return (
        <Card>
            <div className="grid grid-cols-[auto_repeat(7,1fr)]">
                <div className="text-center font-semibold"></div>
                {weekDates.map(date => (
                    <div key={date.toString()} className="text-center font-semibold pb-2 border-b-2 border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark">
                        <span className="text-sm">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                        <div className={`mt-1 text-lg ${isSameDate(date, toYYYYMMDD(today)) ? 'bg-primary text-white rounded-full h-8 w-8 flex items-center justify-center mx-auto' : ''}`}>{date.getDate()}</div>
                    </div>
                ))}

                <div className="col-start-1 pr-2">
                    {hours.map(hour => <div key={hour} className="h-20 text-right text-sm text-text-muted-light dark:text-text-muted-dark border-t border-border-muted-light dark:border-border-muted-dark mt-[-1px] pt-1">{hour}</div>)}
                </div>

                <div className="col-start-2 col-span-7 grid grid-cols-7 relative">
                    {weekDates.map((date, dayIndex) => (
                        <div key={dayIndex} className="border-l border-border-muted-light dark:border-border-muted-dark relative">
                            {hours.map((_, hourIndex) => <div key={hourIndex} className="h-20 border-t border-border-muted-light dark:border-border-muted-dark"></div>)}
                            {events.filter(e => isSameDate(date, e.date)).map(event => (
                                 <div key={event.id} className={`absolute text-white p-2 rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-shadow border border-white/20 w-[95%] left-[2.5%]`} style={{...getEventPosition(event), backgroundColor: event.color}} onClick={() => handleEdit(event)}>
                                    <p className="font-bold text-sm leading-tight">{event.title}</p>
                                    <p className="text-xs opacity-80">{event.startTime} - {event.endTime}</p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
  };
  
  const renderMonthlyView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(new Date(year, month, i));
    
    const today = new Date();
    
    return (
        <Card>
            <div className="grid grid-cols-7 text-center font-semibold text-text-secondary-light dark:text-text-secondary-dark border-b border-border-light dark:border-border-dark pb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-5">
                {calendarDays.map((day, index) => (
                    <div key={index} className="h-32 border-b border-r border-border-muted-light dark:border-border-muted-dark p-2 overflow-hidden flex flex-col cursor-pointer hover:bg-surface-muted-light dark:hover:bg-surface-muted-dark" onClick={() => day && (setCurrentDate(day), setCurrentView('day'))}>
                        {day && (
                            <>
                                <span className={`font-semibold text-sm ${isSameDate(day, toYYYYMMDD(today)) ? 'bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center' : ''}`}>{day.getDate()}</span>
                                <div className="mt-1 space-y-1 overflow-y-auto">
                                {events.filter(e => isSameDate(day, e.date)).sort((a,b) => a.startTime.localeCompare(b.startTime)).map(event => (
                                    <div key={event.id} className="text-white text-xs p-1 rounded overflow-hidden truncate" style={{ backgroundColor: event.color }} onClick={(e) => { e.stopPropagation(); handleEdit(event); }}>
                                    {event.title}
                                    </div>
                                ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
  };
  
  const renderDailyView = () => {
    const dayEvents = events.filter(e => isSameDate(currentDate, e.date)).sort((a,b) => a.startTime.localeCompare(b.startTime));
    return (
        <Card>
            <div className="grid grid-cols-[auto_1fr]">
                 <div className="col-start-1 pr-2">
                    {hours.map(hour => <div key={hour} className="h-20 text-right text-sm text-text-muted-light dark:text-text-muted-dark border-t border-border-muted-light dark:border-border-muted-dark mt-[-1px] pt-1">{hour}</div>)}
                </div>
                <div className="relative">
                    {hours.map((_, hourIndex) => <div key={hourIndex} className="h-20 border-t border-border-muted-light dark:border-border-muted-dark"></div>)}
                    {dayEvents.map(event => (
                        <div key={event.id} className={`absolute text-white p-2 rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-shadow border border-white/20 w-full`} style={{...getEventPosition(event), backgroundColor: event.color}} onClick={() => handleEdit(event)}>
                            <p className="font-bold text-sm leading-tight">{event.title}</p>
                            <p className="text-xs opacity-80">{event.startTime} - {event.endTime}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
  };

  const ViewSwitcherButton: React.FC<{view: 'week' | 'month' | 'day', label: string}> = ({ view, label }) => (
    <button 
        onClick={() => setCurrentView(view)} 
        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${currentView === view ? 'bg-primary text-white' : 'bg-surface-inset-light text-text-secondary-light hover:bg-border-light dark:bg-surface-inset-dark dark:text-text-primary-dark dark:hover:bg-border-dark'}`}
    >{label}</button>
  );

  return (
    <div className="animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
                 <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark whitespace-nowrap">
                    {getHeaderTitle()}
                 </h2>
                <div className="flex items-center gap-1">
                    <button onClick={handlePrev} className="p-2 rounded-md hover:bg-surface-inset-light dark:hover:bg-surface-inset-dark"><ChevronLeftIcon className="h-5 w-5" /></button>
                    <button onClick={handleToday} className="px-3 py-1.5 text-sm font-semibold rounded-md hover:bg-surface-inset-light dark:hover:bg-surface-inset-dark">Today</button>
                    <button onClick={handleNext} className="p-2 rounded-md hover:bg-surface-inset-light dark:hover:bg-surface-inset-dark"><ChevronRightIcon className="h-5 w-5" /></button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-surface-inset-light dark:bg-surface-inset-dark rounded-lg">
                    <ViewSwitcherButton view="month" label="Month" />
                    <ViewSwitcherButton view="week" label="Week" />
                    <ViewSwitcherButton view="day" label="Day" />
                </div>
                <button onClick={() => { setEditingEvent(null); setIsModalOpen(true); }} className={`${pagePrimaryButtonStyles} flex items-center gap-2 !px-4 !py-2.5`}>
                    <PlusIcon className="h-5 w-5" />
                </button>
            </div>
        </div>

        {currentView === 'week' && renderWeeklyView()}
        {currentView === 'month' && renderMonthlyView()}
        {currentView === 'day' && renderDailyView()}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEvent ? "Edit Event" : "Add New Event"}>
            <EventForm event={editingEvent} onSave={handleSave} onCancel={() => setIsModalOpen(false)} onDelete={handleDelete} />
        </Modal>

        {deletingEvent && (
            <ConfirmationModal
                isOpen={!!deletingEvent}
                onClose={() => setDeletingEvent(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Event"
                message={<>Are you sure you want to delete the event <strong>{deletingEvent.title}</strong>? This action cannot be undone.</>}
            />
        )}
    </div>
  );
};

export default Timetable;