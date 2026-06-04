import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getSlots, saveSlots } from '../lib/defaultSlots'
import SlotCard from '../components/SlotCard'
import ProgressBar from '../components/ProgressBar'
import StatsGrid from '../components/StatsGrid'
import Toast from '../components/Toast'
import ScheduleEditor from '../components/ScheduleEditor'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function formatDateLong() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function Tracker({ session }) {
  const [slots, setSlots]           = useState(() => getSlots())
  const [slotStatus, setSlotStatus] = useState({})
  const [note, setNote]             = useState('')
  const [syncState, setSyncState]   = useState('synced') // 'synced'|'syncing'|'error'
  const [toast, setToast]           = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [loading, setLoading]       = useState(true)

  const saveTimer   = useRef(null)
  const latestData  = useRef({ status: {}, note: '' })

  const today   = todayISO()
  const isAdmin = session.user.email === ADMIN_EMAIL

  // -- Load today's existing data --
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('daily_progress')
        .select('slots, note')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .maybeSingle()

      if (data) {
        setSlotStatus(data.slots || {})
        setNote(data.note || '')
        latestData.current = { status: data.slots || {}, note: data.note || '' }
      }
      setLoading(false)
    })()
  }, [])

  // -- Computed values --
  const studySlots = slots.filter(s => s.mins > 0)
  const doneSlots  = studySlots.filter(s => slotStatus[s.id] === 'done')
  const skipSlots  = studySlots.filter(s => slotStatus[s.id] === 'skip')
  const totalHrs   = doneSlots.reduce((sum, s) => sum + s.mins / 60, 0)
  const completion = studySlots.length > 0 ? Math.round((doneSlots.length / studySlots.length) * 100) : 0

  // -- Helpers --
  function showToast(type, msg) {
    setToast({ type, msg })
  }

  async function persistToSupabase(status, noteText) {
    const sDone = studySlots.filter(s => status[s.id] === 'done')
    const hrs   = sDone.reduce((sum, s) => sum + s.mins / 60, 0)
    const comp  = studySlots.length > 0 ? Math.round((sDone.length / studySlots.length) * 100) : 0

    const { error } = await supabase
      .from('daily_progress')
      .upsert({
        user_id:    session.user.id,
        date:       today,
        slots:      status,
        note:       noteText,
        total_done: sDone.length,
        total_hrs:  parseFloat(hrs.toFixed(2)),
        completion: comp,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' })

    if (error) {
      setSyncState('error')
      showToast('error', 'Save failed — check connection')
    } else {
      setSyncState('synced')
      showToast('success', 'Progress saved!')
    }
  }

  function scheduleSave(status, noteText) {
    setSyncState('syncing')
    latestData.current = { status, note: noteText }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      persistToSupabase(latestData.current.status, latestData.current.note)
    }, 1500)
  }

  function handleStatusChange(slotId, newStatus) {
    const updated = { ...slotStatus }
    if (newStatus === null) delete updated[slotId]
    else updated[slotId] = newStatus
    setSlotStatus(updated)
    scheduleSave(updated, note)
  }

  function handleNoteChange(val) {
    setNote(val)
    scheduleSave(slotStatus, val)
  }

  async function handleResetDay() {
    if (!window.confirm('Reset all progress for today?')) return
    const empty = {}
    setSlotStatus(empty)
    setNote('')
    scheduleSave(empty, '')
  }

  function handleSlotsUpdate(newSlots) {
    setSlots(newSlots)
    saveSlots(newSlots)
    setShowEditor(false)
    showToast('success', 'Schedule updated!')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  // -- Sync dot --
  const syncDot = {
    synced:  { color: '#1D9E75', label: 'Synced' },
    syncing: { color: '#BA7517', label: 'Syncing…' },
    error:   { color: '#993C1D', label: 'Error' },
  }[syncState]

  const statsData = [
    { label: 'Completed', value: `${doneSlots.length}/${studySlots.length}` },
    { label: 'Study time', value: `${totalHrs.toFixed(1)}h` },
    { label: 'Skipped', value: skipSlots.length },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5F0' }}>
      {/* Header */}
      <div className="sticky top-0 z-20" style={{ backgroundColor: '#1a1a18' }}>
        <div className="max-w-lg mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-xl text-white leading-tight"
                style={{ fontFamily: '"DM Serif Display", serif' }}
              >
                Daily Tracker
              </h1>
              <p className="text-xs text-white/60 mt-0.5">{formatDateLong()}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Sync indicator */}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: syncDot.color }}
                />
                <span className="text-xs text-white/70">{syncDot.label}</span>
              </div>
              {isAdmin && (
                <a
                  href="/monitor"
                  className="text-xs text-white/60 hover:text-white px-2 py-1 rounded border border-white/20"
                >
                  Monitor
                </a>
              )}
              <button
                onClick={handleLogout}
                className="text-xs text-white/60 hover:text-white px-2 py-1 rounded border border-white/20 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-10">
        {/* Progress card */}
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
          <ProgressBar completion={completion} />
        </div>

        {/* Stats */}
        <StatsGrid stats={statsData} />

        {/* Section header */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="font-semibold text-sm" style={{ color: '#1a1a18' }}>Today's Schedule</h2>
          <button
            onClick={() => setShowEditor(true)}
            className="text-xs font-medium hover:underline"
            style={{ color: '#185FA5' }}
          >
            Edit Schedule
          </button>
        </div>

        {/* Slot cards */}
        {loading ? (
          <div className="text-center py-10 text-sm" style={{ color: '#6b6a65' }}>
            Loading your schedule…
          </div>
        ) : (
          <div className="space-y-2">
            {slots.map(slot => (
              <SlotCard
                key={slot.id}
                slot={slot}
                status={slotStatus[slot.id]}
                onStatusChange={newStatus => handleStatusChange(slot.id, newStatus)}
              />
            ))}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>
            Notes for today
          </label>
          <textarea
            value={note}
            onChange={e => handleNoteChange(e.target.value)}
            placeholder="Anything to remember, revise later, or reflect on…"
            rows={3}
            className="w-full rounded-xl border p-3 text-sm resize-none focus:outline-none transition-shadow"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#e5e7eb', color: '#1a1a18' }}
            onFocus={e => (e.target.style.borderColor = '#1D9E75')}
            onBlur={e  => (e.target.style.borderColor = '#e5e7eb')}
          />
        </div>

        {/* Reset day */}
        <button
          onClick={handleResetDay}
          className="w-full py-2.5 text-sm rounded-xl border transition-colors hover:bg-gray-50"
          style={{ borderColor: '#e5e7eb', color: '#6b6a65' }}
        >
          Reset Day
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.msg + Date.now()}
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Schedule editor modal */}
      {showEditor && (
        <ScheduleEditor
          slots={slots}
          onSave={handleSlotsUpdate}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  )
}
