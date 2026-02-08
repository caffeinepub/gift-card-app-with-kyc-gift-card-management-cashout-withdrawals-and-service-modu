export interface CalendarEvent {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  title: string;
  description: string;
  timestamp: number;
}

const STORAGE_KEY_PREFIX = 'rate_calendar_';

function getStorageKey(principal: string): string {
  return `${STORAGE_KEY_PREFIX}${principal}`;
}

export function getCalendarEvents(principal: string): CalendarEvent[] {
  try {
    const stored = localStorage.getItem(getStorageKey(principal));
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load calendar events:', error);
    return [];
  }
}

export function addCalendarEvent(
  principal: string,
  event: Omit<CalendarEvent, 'id' | 'timestamp'>
): CalendarEvent {
  const events = getCalendarEvents(principal);
  const newEvent: CalendarEvent = {
    ...event,
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };
  events.push(newEvent);
  localStorage.setItem(getStorageKey(principal), JSON.stringify(events));
  return newEvent;
}

export function deleteCalendarEvent(principal: string, eventId: string): void {
  const events = getCalendarEvents(principal);
  const filtered = events.filter(e => e.id !== eventId);
  localStorage.setItem(getStorageKey(principal), JSON.stringify(filtered));
}
