import { startOfWeek, addDays, parse, setHours, setMinutes, isSameDay, addWeeks } from 'date-fns';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Transforms backend timetable slots into calendar events for a specific week range.
 * Backend slots are generic (e.g., "Monday", "10:00"), so we map them to actual dates in the current view.
 * 
 * @param {Array} slots - Array of slot objects from backend
 * @param {Date} startOfCurrentWeek - The start date of the currently viewed week
 * @returns {Array} - Array of event objects compatible with react-big-calendar
 */
export function transformSlotsToEvents(slots, startOfCurrentWeek) {
    if (!slots || !startOfCurrentWeek) return [];

    const events = [];
    const now = new Date();

    // Loop through each day of the current week (Sun-Sat)
    for (let i = 0; i < 7; i++) {
        const currentDate = addDays(startOfWeek(startOfCurrentWeek), i);
        const dayName = DAYS[currentDate.getDay()];

        // Find slots that match this day name
        const daySlots = slots.filter(slot => slot.day === dayName);

        daySlots.forEach(slot => {
            // Parse "HH:mm" time strings
            const [startHour, startMin] = slot.startTime.split(':').map(Number);
            const [endHour, endMin] = slot.endTime.split(':').map(Number);

            const start = setMinutes(setHours(currentDate, startHour), startMin);
            const end = setMinutes(setHours(currentDate, endHour), endMin);

            events.push({
                id: slot._id,
                title: `${slot.subject} (${slot.batch?.name || 'Batch'})`,
                start,
                end,
                resource: slot, // Store full slot data
                status: getEventStatus(start, end, now)
            });
        });
    }

    return events;
}

/**
 * Determines the status color/state of an event based on current time.
 */
export function getEventStatus(start, end, now) {
    const diffMins = (start - now) / 1000 / 60;

    if (now >= start && now <= end) {
        return 'live'; // Green
    } else if (now > end) {
        return 'completed'; // Red/Past
    } else if (diffMins > 0 && diffMins <= 10) {
        return 'upcoming'; // Yellow
    } else {
        return 'scheduled'; // Grey
    }
}
