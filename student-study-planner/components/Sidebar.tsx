import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpenIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  TrophyIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import AIIcon from './AIIcon';

const navItems = [
  { to: '/', icon: ChartBarIcon, label: 'Dashboard' },
  { to: '/subjects', icon: BookOpenIcon, label: 'Subjects' },
  { to: '/timetable', icon: CalendarDaysIcon, label: 'Timetable' },
  { to: '/notes', icon: PencilSquareIcon, label: 'Notes' },
  { to: '/tasks', icon: CheckCircleIcon, label: 'Tasks' },
  { to: '/exams', icon: AcademicCapIcon, label: 'Exams' },
  { to: '/goals', icon: TrophyIcon, label: 'Goals' },
  { to: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
];

const Sidebar: React.FC = () => {
  const linkClass = "flex items-center px-4 py-2.5 text-text-secondary-light dark:text-text-secondary-dark rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 group relative";
  const activeLinkClass = "bg-primary/10 dark:bg-primary/20 text-primary dark:text-red-300 font-semibold shadow-inner-strong";

  return (
    <aside className="w-64 flex-shrink-0 bg-surface-light/80 dark:bg-surface-dark/60 backdrop-blur-lg border-r border-border-light dark:border-border-dark p-4 flex flex-col">
       <div className="flex items-center gap-2 px-2 pt-2 mb-8">
        <div className="p-2.5 bg-primary rounded-xl shadow-glow-primary-light">
          <AIIcon className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tighter text-text-primary-light dark:text-text-primary-dark">
          StudyPlan <span className="text-primary">AI</span>
        </span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink 
                to={item.to}
                className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}
                end={item.to === '/'}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <div className="absolute left-[-16px] h-6 w-1.5 bg-primary rounded-r-full shadow-glow-primary" />}
                    <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-primary dark:text-red-300' : 'text-text-muted-light dark:text-text-muted-dark group-hover:text-text-secondary-light dark:group-hover:text-text-secondary-dark'}`} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;