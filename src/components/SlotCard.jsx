import StatusPill from './StatusPill'
import { formatMins } from '../lib/defaultSlots'

export default function SlotCard({ slot, status, onStatusChange }) {
  const isDone   = status === 'done'
  const isSkip   = status === 'skip'
  const isBreak  = slot.tag === 'break'
  const isMarked = isDone || isSkip

  let cardBg     = '#FFFFFF'
  let cardBorder = '#e5e7eb'
  if (isDone) { cardBg = '#E1F5EE'; cardBorder = '#1D9E75' }
  if (isSkip) { cardBg = '#FAEEDA'; cardBorder = '#BA7517' }

  return (
    <div
      className="rounded-xl border p-4 slot-card-transition"
      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
    >
      <div className="flex items-start gap-3">
        {/* Status indicator */}
        <div className="mt-0.5 flex-shrink-0">
          {isDone ? (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#1D9E75' }}
            >
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          ) : isSkip ? (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#BA7517' }}
            >
              <span className="text-white text-xs font-bold">–</span>
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: '#d1d5db' }} />
          )}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-semibold text-sm leading-snug"
              style={{ color: isDone ? '#0F6E56' : isSkip ? '#92400e' : '#1a1a18' }}
            >
              {slot.name}
            </span>
            <StatusPill tag={slot.tag} />
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#6b6a65' }}>{slot.time}</div>
          {formatMins(slot.mins) && (
            <div className="text-xs" style={{ color: '#9ca3af' }}>{formatMins(slot.mins)}</div>
          )}
        </div>

        {/* Action buttons */}
        {!isBreak && (
          <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
            {isMarked ? (
              <button
                onClick={() => onStatusChange(null)}
                className="text-xs px-2.5 py-1 rounded-lg border hover:bg-white/60 transition-colors font-medium"
                style={{ borderColor: '#d1d5db', color: '#6b6a65' }}
              >
                Reset
              </button>
            ) : (
              <>
                <button
                  onClick={() => onStatusChange('done')}
                  className="text-xs px-3 py-1 rounded-lg font-medium transition-opacity hover:opacity-85"
                  style={{ backgroundColor: '#1D9E75', color: '#ffffff' }}
                >
                  Done ✓
                </button>
                <button
                  onClick={() => onStatusChange('skip')}
                  className="text-xs px-3 py-1 rounded-lg font-medium transition-opacity hover:opacity-85 border"
                  style={{ backgroundColor: '#FAEEDA', color: '#BA7517', borderColor: '#f5d99d' }}
                >
                  Skip
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
