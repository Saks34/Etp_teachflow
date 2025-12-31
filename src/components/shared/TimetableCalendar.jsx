import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTheme } from '../../context/ThemeContext';
import { transformSlotsToEvents } from '../../utils/timetableUtils';
import { ChevronLeft, ChevronRight, Clock, MapPin, User as UserIcon, BookOpen, Video, Edit, Trash2, Calendar as CalendarIcon, Layout, List } from 'lucide-react';
import Modal from './Modal';

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

export default function TimetableCalendar({ slots, onSlotClick, userRole, loading }) {
    const { isDark } = useTheme();
    const [view, setView] = useState(Views.MONTH); // Default to Week as usually best for timetables
    const [date, setDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);

    const events = useMemo(() => {
        return transformSlotsToEvents(slots, date);
    }, [slots, date]);

    // Enhanced Event Component with better visuals
    const CustomEvent = ({ event }) => {
        const getStatusDot = () => {
            if (event.status === 'live') {
                return <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>;
            }
            return null;
        };

        return (
            <div className="h-full w-full flex flex-col p-2 overflow-hidden group">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold tracking-wide truncate flex-1">
                        {event.resource.subject}
                    </span>
                    {getStatusDot()}
                </div>

                <div className={`text-[10px] font-medium truncate mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {event.resource.batch?.name || 'Batch'}
                </div>

                <div className={`mt-auto flex items-center gap-1 text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    <Clock size={10} />
                    <span>{format(event.start, 'h:mm')} - {format(event.end, 'h:mm a')}</span>
                </div>

                {event.resource.teacher?.name && (
                    <div className="text-[9px] text-gray-500 truncate mt-0.5">
                        👤 {event.resource.teacher.name}
                    </div>
                )}
            </div>
        );
    };

    const eventStyleGetter = (event) => {
        let backgroundColor = '#f3f4f6';
        let borderColor = '#d1d5db';
        let textColor = '#374151';

        if (isDark) {
            backgroundColor = '#1f2937';
            textColor = '#e5e7eb';
        }

        switch (event.status) {
            case 'live':
                backgroundColor = isDark ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5';
                borderColor = '#10b981';
                textColor = isDark ? '#6ee7b7' : '#065f46';
                break;
            case 'upcoming':
                backgroundColor = isDark ? 'rgba(251, 191, 36, 0.15)' : '#fef3c7';
                borderColor = '#f59e0b';
                textColor = isDark ? '#fcd34d' : '#92400e';
                break;
            case 'completed':
                backgroundColor = isDark ? 'rgba(107, 114, 128, 0.15)' : '#f3f4f6';
                borderColor = '#9ca3af';
                textColor = isDark ? '#d1d5db' : '#6b7280';
                break;
            default:
                backgroundColor = isDark ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe';
                borderColor = '#8b5cf6';
                textColor = isDark ? '#c4b5fd' : '#5b21b6';
        }

        return {
            style: {
                backgroundColor,
                borderLeft: `4px solid ${borderColor}`,
                borderTop: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                borderRadius: '8px',
                color: textColor,
                padding: '0',
                fontSize: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
            }
        };
    };

    // Let's redefine CustomToolbar to correctly use props
    const CustomToolbar = (toolbar) => {
        const goToBack = () => {
            toolbar.onNavigate('PREV');
        };

        const goToNext = () => {
            toolbar.onNavigate('NEXT');
        };

        const goToCurrent = () => {
            toolbar.onNavigate('TODAY');
        };

        const handleViewChange = (newView) => {
            toolbar.onView(newView);
        };

        return (
            <div className="flex flex-col xl:flex-row items-center justify-between mb-8 gap-6">
                {/* Date Navigation & View Title */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <div className={`flex items-center p-1 rounded-full shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <button
                            onClick={goToBack}
                            className={`p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={goToCurrent}
                            className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                        >
                            Today
                        </button>
                        <button
                            onClick={goToNext}
                            className={`p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent min-w-[200px] text-center sm:text-left">
                        {format(toolbar.date, 'MMMM yyyy')}
                    </h2>
                </div>

                {/* View Switcher & Legend */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <div className={`flex p-1 rounded-xl border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <button
                            onClick={() => handleViewChange(Views.MONTH)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${toolbar.view === Views.MONTH
                                ? (isDark ? 'bg-violet-900/50 text-violet-300' : 'bg-violet-50 text-violet-700')
                                : (isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900')
                                }`}
                        >
                            <CalendarIcon size={16} />
                            Month
                        </button>
                        <button
                            onClick={() => handleViewChange(Views.WEEK)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${toolbar.view === Views.WEEK
                                ? (isDark ? 'bg-violet-900/50 text-violet-300' : 'bg-violet-50 text-violet-700')
                                : (isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900')
                                }`}
                        >
                            <Layout size={16} />
                            Week
                        </button>
                        <button
                            onClick={() => handleViewChange(Views.DAY)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${toolbar.view === Views.DAY
                                ? (isDark ? 'bg-violet-900/50 text-violet-300' : 'bg-violet-50 text-violet-700')
                                : (isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900')
                                }`}
                        >
                            <List size={16} />
                            Day
                        </button>
                    </div>

                    <div className="flex gap-2 text-xs font-semibold overflow-x-auto max-w-full pb-1 sm:pb-0">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800/50 whitespace-nowrap">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span>Live</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg border border-yellow-200 dark:border-yellow-800/50 whitespace-nowrap">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                            <span>Upcoming</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
    };

    const getStatusBadge = (status) => {
        const badges = {
            live: {
                bg: isDark ? 'bg-green-900/30' : 'bg-green-100',
                text: isDark ? 'text-green-400' : 'text-green-700',
                label: 'LIVE NOW',
                icon: <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            },
            upcoming: {
                bg: isDark ? 'bg-yellow-900/30' : 'bg-yellow-100',
                text: isDark ? 'text-yellow-400' : 'text-yellow-700',
                label: 'UPCOMING',
                icon: <Clock size={16} />
            },
            completed: {
                bg: isDark ? 'bg-gray-800' : 'bg-gray-100',
                text: isDark ? 'text-gray-400' : 'text-gray-600',
                label: 'COMPLETED',
                icon: null
            },
            default: {
                bg: isDark ? 'bg-violet-900/30' : 'bg-violet-100',
                text: isDark ? 'text-violet-400' : 'text-violet-700',
                label: 'SCHEDULED',
                icon: null
            }
        };
        return badges[status] || badges.default;
    };

    return (
        <div className={`rounded-2xl shadow-xl border transition-all duration-300 overflow-hidden ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="p-4 sm:p-6">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '700px' }}
                    defaultView={Views.MONTH}
                    views={[Views.MONTH, Views.WEEK, Views.DAY]}
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={(newDate) => setDate(newDate)}
                    eventPropGetter={eventStyleGetter}
                    components={{
                        toolbar: CustomToolbar,
                        event: CustomEvent,
                    }}
                    min={new Date(0, 0, 0, 7, 0, 0)} // Start at 7 AM
                    max={new Date(0, 0, 0, 22, 0, 0)} // End at 10 PM
                    step={30}
                    timeslots={2}
                    className={`enhanced-calendar ${isDark ? 'dark-mode' : 'light-mode'}`}
                    onSelectEvent={handleSelectEvent}
                />
            </div>

            <style>{`
                .enhanced-calendar {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                }

                .enhanced-calendar .rbc-header {
                    padding: 16px 8px;
                    font-size: 0.875rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 2px solid ${isDark ? '#374151' : '#e5e7eb'} !important;
                    background: ${isDark ? '#111827' : '#fafafa'};
                }

                .enhanced-calendar .rbc-time-header-content {
                    border-left: none !important;
                }

                .enhanced-calendar .rbc-time-content {
                    border-top: 2px solid ${isDark ? '#374151' : '#e5e7eb'} !important;
                }

                .enhanced-calendar .rbc-day-bg + .rbc-day-bg {
                    border-left: 1px solid ${isDark ? '#1f2937' : '#f3f4f6'} !important;
                }

                .enhanced-calendar .rbc-timeslot-group {
                    min-height: 80px;
                    border-bottom: 1px solid ${isDark ? '#1f2937' : '#f3f4f6'} !important;
                }

                .enhanced-calendar .rbc-time-slot {
                    border-top: 1px dashed ${isDark ? '#1f2937' : '#f9fafb'} !important;
                }

                .enhanced-calendar .rbc-current-time-indicator {
                    background-color: #ef4444 !important;
                    height: 2px !important;
                }

                .enhanced-calendar .rbc-today {
                    background-color: ${isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.05)'} !important;
                }

                .enhanced-calendar .rbc-time-gutter .rbc-timeslot-group {
                    border-bottom: none !important;
                }

                .enhanced-calendar .rbc-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: ${isDark ? '#9ca3af' : '#6b7280'};
                    padding-right: 8px;
                }

                .enhanced-calendar .rbc-event {
                    border-radius: 8px !important;
                }

                .enhanced-calendar .rbc-event:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    transform: translateY(-1px);
                }

                .enhanced-calendar .rbc-event-content {
                    padding: 0 !important;
                }

                .enhanced-calendar .rbc-time-view {
                    border: none !important;
                }

                .enhanced-calendar .rbc-time-header {
                    border-bottom: none !important;
                }

                .enhanced-calendar .rbc-allday-cell {
                    display: none;
                }

                .enhanced-calendar.dark-mode .rbc-off-range-bg {
                    background-color: #0f172a;
                }
            `}</style>

            {/* Enhanced Details Modal */}
            <Modal
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                title="Class Details"
                maxWidth="max-w-xl"
            >
                {selectedEvent && (
                    <div className="space-y-6">
                        {/* Status Badge */}
                        <div className={`flex items-center justify-between p-4 rounded-xl ${getStatusBadge(selectedEvent.status).bg}`}>
                            <div className="flex items-center gap-2">
                                {getStatusBadge(selectedEvent.status).icon}
                                <span className={`font-bold tracking-wider text-sm ${getStatusBadge(selectedEvent.status).text}`}>
                                    {getStatusBadge(selectedEvent.status).label}
                                </span>
                            </div>
                        </div>

                        {/* Subject Info */}
                        <div>
                            <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {selectedEvent.resource.subject}
                            </h3>
                            <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <BookOpen size={18} />
                                <span className="font-medium">{selectedEvent.resource.batch?.name || 'Batch'}</span>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className={`flex items-start gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-violet-900/30' : 'bg-violet-100'}`}>
                                    <Clock className={isDark ? 'text-violet-400' : 'text-violet-600'} size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Time</p>
                                    <p className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                                        {selectedEvent.resource.startTime} - {selectedEvent.resource.endTime}
                                    </p>
                                </div>
                            </div>

                            <div className={`flex items-start gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                                    <UserIcon className={isDark ? 'text-blue-400' : 'text-blue-600'} size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Teacher</p>
                                    <p className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                                        {selectedEvent.resource.teacher?.name || 'Unassigned'}
                                    </p>
                                </div>
                            </div>

                            <div className={`flex items-start gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-pink-900/30' : 'bg-pink-100'}`}>
                                    <MapPin className={isDark ? 'text-pink-400' : 'text-pink-600'} size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Day</p>
                                    <p className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                                        {selectedEvent.resource.day}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className={`flex flex-col gap-3 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            {userRole === 'InstitutionAdmin' || userRole === 'SuperAdmin' ? (
                                <>
                                    {selectedEvent.status === 'live' && (
                                        <button
                                            onClick={() => {
                                                onSlotClick(selectedEvent.resource, 'join');
                                                setSelectedEvent(null);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                                        >
                                            <Video size={18} />
                                            Watch Live Stream
                                        </button>
                                    )}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                onSlotClick(selectedEvent.resource, 'edit');
                                                setSelectedEvent(null);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                onSlotClick(selectedEvent.resource, 'delete');
                                                setSelectedEvent(null);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl">
                                    {selectedEvent.status === 'live' ? (
                                        <>
                                            <Video size={18} />
                                            Join Class Now
                                        </>
                                    ) : (
                                        <>
                                            <BookOpen size={18} />
                                            View Materials
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
