import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getSlots } from '../lib/defaultSlots'
import StatusPill from '../components/StatusPill'
import ProgressBar from '../components/ProgressBar'
import StatsGrid from '../components/StatsGrid'

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function formatDateLong() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function slotStatusDisplay(status) {
  if (status === 'done') return { label: '✓ Done',    bg: '#E1F5EE', color: '#0F6E56' }
  if (status === 'skip') return { label: '– Skipped', bg: '#FAEEDA', color: '#BA7517' }
  return                        { label: '○ Pending', bg: '#F1EFE8', color: '#5F5E5A' }
}

export default function Monitor({ session }) {
  const [slots]               = useState(() => getSlots())
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [isLive, setIsLive]     = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const channelRef = useRef(null)
  const today = todayISO()

  // -- Fetch latest user progress --
  async function fetchProgress() {
    setLoading(true)
    const { data, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('date', today)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      setProgressData(data)
      setLastUpdated(new Date())
    } else {
      setProgressData(null)
    }
    setLoading(false)
  }

  // -- Realtime subscription --
  useEffect(() => {
    fetchProgress()

    const channel = supabase
      .channel('monitor-daily-progress')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_progress', filter: `date=eq.${today}` },
        (payload) => {
          if (payload.new) {
            setProgressData(payload.new)
            setLastUpdated(new Date())
          }
        }
      )
      .subscribe(status => setIsLive(status === 'SUBSCRIBED'))

    channelRef.current = channel
    return () => supabase.removeChannel(channel)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  // -- Computed stats --
  const slotStatuses = progressData?.slots || {}
  const studySlots   = slots.filter(s => s.mins > 0)
  const doneSlots    = studySlots.filter(s => slotStatuses[s.id] === 'done')
  const skipSlots    = studySlots.filter(s => slotStatuses[s.id] === 'skip')
  const totalHrs     = doneSlots.reduce((sum, s) => sum + s.mins / 60, 0)
  const completion   = progressData?.completion ?? 0

  const statsData = [
    { label: 'Slots completed', value: `${doneSlots.length}/${studySlots.length}` },
    { label: 'Study time',      value: `${totalHrs.toFixed(1)}h` },
    { label: 'Skipped',         value: skipSlots.length },
    { label: 'Day complete',    value: `${completion}%` },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5F0' }}>
      {/* Header */}
      <div className="sticky top-0 z-20" style={{ backgroundColor: '#26215C' }}>
        <div className="max-w-2xl mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-xl text-white leading-tight"
                style={{ fontFamily: '"DM Serif Display", serif' }}
              >
                Her Study Dashboard
              </h1>
              <p className="text-xs text-white/60 mt-0.5">{formatDateLong()}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Live badge */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: isLive ? 'rgba(29,158,117,0.2)' : 'rgba(186,117,23,0.2)',
                  color: isLive ? '#6FE0BA' : '#F6C87A',
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: isLive ? '#1D9E75' : '#BA7517',
                    boxShadow: isLive ? '0 0 4px #1D9E75' : 'none',
                  }}
                />
                {isLive ? 'Live' : 'Connecting…'}
              </div>
              <button
                onClick={fetchProgress}
                className="text-xs text-white/60 hover:text-white px-2 py-1 rounded border border-white/20 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="text-xs text-white/60 hover:text-white px-2 py-1 rounded border border-white/20 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          {lastUpdated && (
            <p className="text-xs text-white/40 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4 pb-10">
        {loading ? (
          <div className="text-center py-16 text-sm" style={{ color: '#6b6a65' }}>
            Loading dashboard…
          </div>
        ) : !progressData ? (
          /* Empty state */
          <div
            className="rounded-2xl p-10 text-center shadow-sm"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <div className="text-5xl mb-4">📚</div>
            <h2 className="font-semibold text-lg mb-1" style={{ color: '#1a1a18' }}>
              No activity yet today
            </h2>
            <p className="text-sm" style={{ color: '#6b6a65' }}>
              Her study tracker will appear here once she starts tracking for today.
            </p>
            <button
              onClick={fetchProgress}
              className="mt-5 text-sm px-5 py-2 rounded-xl font-medium"
              style={{ backgroundColor: '#E1F5EE', color: '#0F6E56' }}
            >
              Check again
            </button>
          </div>
        ) : (
          <>
            {/* 4-stat grid */}
            <StatsGrid stats={statsData} />

            {/* Progress bar */}
            <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
              <ProgressBar completion={completion} />
            </div>

            {/* Slot-by-slot list */}
            <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: '#f3f4f6' }}>
                <h2 className="font-semibold text-sm" style={{ color: '#1a1a18' }}>Slot Progress</h2>
              </div>
              <div>
                {slots.map((slot, idx) => {
                  const sd = slotStatusDisplay(slotStatuses[slot.id])
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{
                        borderBottom: idx < slots.length - 1 ? '1px solid #f9fafb' : 'none',
                      }}
                    >
                      <span className="text-xs font-medium w-5 flex-shrink-0" style={{ color: '#9ca3af' }}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium" style={{ color: '#1a1a18' }}>
                            {slot.name}
                          </span>
                          <StatusPill tag={slot.tag} />
                        </div>
                        <span className="text-xs" style={{ color: '#9ca3af' }}>{slot.time}</span>
                      </div>
                      {slot.tag !== 'break' && (
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                          style={{ backgroundColor: sd.bg, color: sd.color }}
                        >
                          {sd.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Notes card */}
            {progressData.note && (
              <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
                <h2 className="font-semibold text-sm mb-2" style={{ color: '#1a1a18' }}>Her Notes</h2>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#6b6a65' }}>
                  {progressData.note}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
