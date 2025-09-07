import React, { useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Tasks from './pages/Tasks';
import Exams from './pages/Exams';
import Notes from './pages/Notes';
import Timetable from './pages/Timetable';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import ChatbotModal from './components/ChatbotModal';

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <ThemeProvider>
      <DataProvider>
        <HashRouter>
          <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header onOpenChatbot={() => setIsChatbotOpen(true)} />
              <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <div className="container mx-auto px-6 py-8">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/subjects" element={<Subjects />} />
                    <Route path="/timetable" element={<Timetable />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/exams" element={<Exams />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/analytics" element={<Dashboard />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
          <ChatbotModal isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
        </HashRouter>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;