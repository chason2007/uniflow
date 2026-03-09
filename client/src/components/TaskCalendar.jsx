import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-overrides.css';
import { enUS } from 'date-fns/locale';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const categoryColors = {
    Reading: '#3b82f6', // blue-500
    Assignment: '#f97316', // orange-500
    Project: '#a855f7', // purple-500
    Quiz: '#ef4444', // red-500
    Exam: '#b91c1c', // red-700
    Other: '#64748b' // slate-500
};

const TaskCalendar = ({ tasks, onEventDrop }) => {
    // Format our tasks to fit the react-big-calendar Event object
    const events = tasks.map(task => ({
        id: task.id,
        title: `${task.course ? task.course + ': ' : ''}${task.title}`,
        start: new Date(task.dueDate),
        end: new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000), // Default 1 hour duration
        allDay: false,
        resource: task
    }));

    const eventStyleGetter = (event) => {
        const backgroundColor = categoryColors[event.resource.category] || categoryColors.Other;
        const style = {
            backgroundColor,
            borderRadius: '6px',
            opacity: 0.9,
            color: 'white',
            border: '0px',
            display: 'block'
        };
        return { style };
    };

    return (
        <div className="h-[600px] w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day']}
                defaultView='month'
            />
        </div>
    );
};

export default TaskCalendar;
