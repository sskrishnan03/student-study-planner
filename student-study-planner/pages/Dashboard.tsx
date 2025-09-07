import React, { useEffect, useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import Card from '../components/Card';
import { useData } from '../contexts/DataContext';
import { CheckCircleIcon, BookOpenIcon, AcademicCapIcon, TrophyIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import { TaskStatus } from '../types';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { GoogleGenAI } from '@google/genai';
import AIIcon from '../components/AIIcon';

const Dashboard: React.FC = () => {
  const { subjects, tasks, exams, goals } = useData();
  const { theme } = useTheme();
  const [aiInsight, setAiInsight] = useState('');
  const [isInsightLoading, setIsInsightLoading] = useState(true);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

  useEffect(() => {
    const fetchInsight = async () => {
      if(subjects.length === 0 && tasks.length === 0 && exams.length === 0) {
        setAiInsight("Welcome! Add some subjects, tasks, or exams to get personalized AI insights and start planning your studies.");
        setIsInsightLoading(false);
        return;
      }
      
      setIsInsightLoading(true);
      try {
        const context = `
          Here is the student's data:
          - Upcoming Exams: ${JSON.stringify(exams.filter(e => new Date(e.date) >= new Date()))}
          - Pending Tasks: ${JSON.stringify(tasks.filter(t => t.status !== TaskStatus.Submitted))}
          - Subjects: ${JSON.stringify(subjects.map(s => ({ title: s.title, progress: s.progress })))}
        `;
        const prompt = `Based on this data, provide one or two sentences of encouraging and actionable advice for the student. Be specific and positive. For example, mention an upcoming exam or a subject with low progress.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        setAiInsight(response.text);
      } catch (error) {
        console.error("Failed to fetch AI insight:", error);
        setAiInsight("Could not load AI insight. Please check your connection or API key.");
      } finally {
        setIsInsightLoading(false);
      }
    };
    fetchInsight();
  }, [subjects, tasks, exams]);

  const taskStatusData = Object.values(TaskStatus).map(status => ({
      name: status,
      value: tasks.filter(t => t.status === status).length
  })).filter(item => item.value > 0);
  
  const COLORS = {
    [TaskStatus.Pending]: '#f59e0b',
    [TaskStatus.InProgress]: '#3b82f6',
    [TaskStatus.Submitted]: '#10b981',
  };

  const upcomingExams = exams
    .filter(e => new Date(e.date) >= new Date())
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const upcomingTasks = tasks
    .filter(t => t.status !== TaskStatus.Submitted && new Date(t.deadline) >= new Date())
    .sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());


  const tooltipStyle = theme === 'dark'
    ? { backgroundColor: 'rgba(30, 41, 59, 0.8)', color: '#f1f5f9', border: '1px solid #334155', borderRadius: '12px', backdropFilter: 'blur(5px)' }
    : { backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#111827', border: '1px solid #e5e7eb', borderRadius: '12px', backdropFilter: 'blur(5px)' };

  return (
    <div className="animate-fade-in space-y-6">
      <Card className="!p-0 overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 shadow-glow-primary">
          <div className="p-6 flex items-center gap-4">
              <AIIcon className="h-10 w-10 text-white animate-float flex-shrink-0" />
              <div>
                  <h2 className="text-xl font-bold text-white">AI Insights</h2>
                  {isInsightLoading ? (
                      <div className="h-5 w-3/4 bg-white/30 rounded-full animate-pulse mt-2"></div>
                  ) : (
                      <p className="text-white/90 font-medium">{aiInsight}</p>
                  )}
              </div>
          </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary/20 mr-4">
              <BookOpenIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Total Subjects</p>
              <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{subjects.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary/20 mr-4">
              <CheckCircleIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Active Tasks</p>
              <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{tasks.filter(t => t.status !== TaskStatus.Submitted).length}</p>
            </div>
          </div>
        </Card>
         <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary/20 mr-4">
              <AcademicCapIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Upcoming Exams</p>
              <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{upcomingExams.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary/20 mr-4">
              <TrophyIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Active Goals</p>
              <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{goals.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">Subject Progress</h3>
            {subjects.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={subjects} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
                        <defs>
                            <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#BE123C" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="title" 
                            stroke="currentColor" 
                            fontSize="12px" 
                            tickLine={false} 
                            axisLine={false} 
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                        />
                        <YAxis stroke="currentColor" fontSize="12px" tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="progress" stroke="#E11D48" fill="url(#colorProgress)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            ) : <div className="text-center text-text-secondary-light dark:text-text-secondary-dark py-10">
                  <p>No subject data to display.</p>
                  <Link to="/subjects" className="text-primary font-semibold hover:underline mt-2 inline-block">Add a subject to start tracking</Link>
                </div> 
            }
        </Card>
        
        <Card className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">Upcoming</h3>
          <div className="space-y-6">
              <div>
                  <h4 className="font-semibold text-sm text-primary mb-2 tracking-wide">EXAMS</h4>
                  <div className="space-y-3">
                      {upcomingExams.length > 0 ? upcomingExams.slice(0, 2).map(exam => (
                          <div key={exam.id} className="p-3 bg-surface-muted-light dark:bg-surface-muted-dark rounded-lg">
                              <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">{exam.title}</p>
                              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2 mt-1"><CalendarDaysIcon className="h-4 w-4"/>{new Date(exam.date).toLocaleDateString()}</p>
                          </div>
                      )) : <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">No upcoming exams. Enjoy the peace!</p>}
                       {upcomingExams.length > 2 && <Link to="/exams" className="text-sm text-primary hover:underline font-medium">View all exams</Link>}
                  </div>
              </div>
               <div>
                  <h4 className="font-semibold text-sm text-primary mb-2 tracking-wide">TASKS</h4>
                  <div className="space-y-3">
                      {upcomingTasks.length > 0 ? upcomingTasks.slice(0, 2).map(task => (
                          <div key={task.id} className="p-3 bg-surface-muted-light dark:bg-surface-muted-dark rounded-lg">
                              <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">{task.title}</p>
                              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2 mt-1"><ClockIcon className="h-4 w-4"/>Due {new Date(task.deadline).toLocaleDateString()}</p>
                          </div>
                      )) : <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">All tasks completed. Great job!</p>}
                      {upcomingTasks.length > 2 && <Link to="/tasks" className="text-sm text-primary hover:underline font-medium">View all tasks</Link>}
                  </div>
              </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;