export const DEFAULT_SLOTS = [
  { id: 's1', time: '6:00 – 7:00 AM',    name: 'Revision + Newspaper',   tag: 'general',   mins: 60  },
  { id: 's2', time: '8:30 AM – 12:00 PM', name: 'RC Reddy class',         tag: 'class',     mins: 210 },
  { id: 's3', time: '12:00 – 2:30 PM',   name: 'Lunch & rest break',     tag: 'break',     mins: 0   },
  { id: 's4', time: '2:30 – 3:15 PM',    name: 'Polity notes',           tag: 'polity',    mins: 45  },
  { id: 's5', time: '3:15 – 4:45 PM',    name: 'Polity – Lakshmikanth',  tag: 'polity',    mins: 90  },
  { id: 's6', time: '5:00 – 5:45 PM',    name: 'Economy notes',          tag: 'economy',   mins: 45  },
  { id: 's7', time: '5:45 – 7:30 PM',    name: 'Economy NCERT',          tag: 'economy',   mins: 105 },
  { id: 's8', time: '7:30 – 8:30 PM',    name: 'Dinner break',           tag: 'break',     mins: 0   },
  { id: 's9', time: '8:30 – 10:30 PM',   name: 'Reasoning & Aptitude',   tag: 'reasoning', mins: 120 },
]

export const TAG_OPTIONS = ['general', 'class', 'break', 'polity', 'economy', 'reasoning']

export const TAG_CONFIG = {
  general:   { bg: '#F1EFE8', color: '#5F5E5A' },
  class:     { bg: '#E1F5EE', color: '#0F6E56' },
  break:     { bg: '#F1EFE8', color: '#5F5E5A' },
  polity:    { bg: '#EEEDFE', color: '#3C3489' },
  economy:   { bg: '#E6F1FB', color: '#185FA5' },
  reasoning: { bg: '#FAECE7', color: '#993C1D' },
}

export function getSlots() {
  try {
    const stored = localStorage.getItem('custom_slots')
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore parse errors
  }
  return DEFAULT_SLOTS
}

export function saveSlots(slots) {
  localStorage.setItem('custom_slots', JSON.stringify(slots))
}

export function formatMins(mins) {
  if (mins === 0) return null
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
