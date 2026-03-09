import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Tag, LayoutDashboard, LayoutList } from 'lucide-react';
import stringSimilarity from 'string-similarity';
import TaskInput from '../components/TaskInput';
import TaskCalendar from '../components/TaskCalendar';
import SyllabusUpload from '../components/SyllabusUpload';

const mockTasks = [
    { id: 1, title: 'Read Chapter 4 of Intro to Psychology', dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), category: 'Reading', priority: 'High', course: 'PSY101' },
    { id: 2, title: 'Calculus Midterm Assignment', dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), category: 'Assignment', priority: 'High', course: 'MATH201' },
    { id: 3, title: 'Draft Research Paper', dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), category: 'Project', priority: 'Medium', course: 'HIST105' }
];

const categoryColors = {
    Reading: 'bg-blue-100 text-blue-700',
    Assignment: 'bg-orange-100 text-orange-700',
    Project: 'bg-purple-100 text-purple-700',
    Quiz: 'bg-red-100 text-red-700',
    Exam: 'bg-red-200 text-red-800 font-bold',
    Other: 'bg-slate-100 text-slate-700'
};

const Dashboard = () => {
    const [tasks, setTasks] = useState(mockTasks);
    const [viewMode, setViewMode] = useState('calendar'); // 'list' | 'calendar'

    const handleTaskAction = (action, data) => {
        if (action === 'CREATE') {
            const newTask = {
                id: Date.now(),
                title: data.title,
                dueDate: data.currentDueDate,
                category: data.category,
                priority: 'Medium',
                course: 'Pending Match...'
            };
            setTasks([...tasks, newTask]);
        } else if (action === 'UPDATE') {
            // Find best match using fuzzy searching
            const titles = tasks.map(t => t.title.toLowerCase());
            const match = stringSimilarity.findBestMatch(data.targetEntity.toLowerCase(), titles);

            if (match.bestMatch.rating > 0.2) { // arbitrary threshold for MVP
                const matchedTaskIndex = match.bestMatchIndex;
                const updatedTasks = [...tasks];
                updatedTasks[matchedTaskIndex] = {
                    ...updatedTasks[matchedTaskIndex],
                    dueDate: data.newDate
                };
                setTasks(updatedTasks);
                alert(`Rescheduled: "${updatedTasks[matchedTaskIndex].title}"`);
            } else {
                alert(`Couldn't find a task matching "${data.targetEntity}"`);
            }
        } else if (action === 'DELETE') {
            // Find best match and remove
            const titles = tasks.map(t => t.title.toLowerCase());
            const match = stringSimilarity.findBestMatch(data.targetEntity.toLowerCase(), titles);

            if (match.bestMatch.rating > 0.2) {
                const updatedTasks = tasks.filter((_, i) => i !== match.bestMatchIndex);
                setTasks(updatedTasks);
                alert(`Deleted task!`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="UniPilot Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">UniPilot</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                        <span className="text-sm font-semibold text-slate-600">JD</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-8">

                {/* Floating Input Section */}
                <section className="mt-4 flex flex-col items-center text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">What's on your mind?</h2>
                    <p className="text-slate-500 mb-6 max-w-lg">Add assignments using natural language or voice. We'll handle the scheduling.</p>
                    <TaskInput onTaskAction={handleTaskAction} />
                </section>

                {/* View Toggle & Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        Your Schedule
                    </h3>
                    <div className="flex p-1 bg-slate-200/50 rounded-xl">
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                        >
                            <CalendarIcon size={16} /> Calendar View
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                        >
                            <LayoutList size={16} /> List View
                        </button>
                    </div>
                </div>

                {/* Dynamic View Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    <div className="lg:col-span-3">
                        {viewMode === 'calendar' ? (
                            <TaskCalendar tasks={tasks} />
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
                                {tasks.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">No upcoming tasks! You're free!</div>
                                ) : (
                                    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map(task => (
                                        <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 group">
                                            <div className="mt-1 w-5 h-5 rounded border-2 border-slate-300 flex-shrink-0 group-hover:border-primary-400 cursor-pointer transition-colors"></div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">{task.title}</h4>
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[task.category] || categoryColors.Other}`}>
                                                        {task.category}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                                                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {new Date(task.dueDate).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                                                    <span className="flex items-center gap-1.5"><Tag size={14} className="text-slate-400" /> {task.course}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6 lg:col-span-1">
                        <SyllabusUpload onTasksExtracted={(task) => handleTaskAction('CREATE', task)} />

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <LayoutDashboard size={18} className="text-primary-500" />
                                Course Highlights
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-700 font-bold tracking-wide">MATH201</span>
                                    <span className="text-rose-600 font-bold bg-rose-100 px-2.5 py-1 rounded-md text-xs">2 Tasks Due</span>
                                </div>
                                <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-700 font-bold tracking-wide">CS101</span>
                                    <span className="text-emerald-600 font-bold bg-emerald-100 px-2.5 py-1 rounded-md text-xs">Caught up</span>
                                </div>
                                <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-700 font-bold tracking-wide">PSY101</span>
                                    <span className="text-amber-600 font-bold bg-amber-100 px-2.5 py-1 rounded-md text-xs">1 Upcoming</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;
