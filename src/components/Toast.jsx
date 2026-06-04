import { useEffect, useState } from 'react'

const STYLES = {
  success: { bg: '#E1F5EE', border: '#1D9E75', color: '#0F6E56', icon: '✓' },
  error:   { bg: '#FAECE7', border: '#993C1D', color: '#993C1D', icon: '✕' },
}

export default function Toast({ message, type = 'success', onClose }) {
  const [exiting, setExiting] = useState(false)
  const cfg = STYLES[type] || STYLES.success

  useEffect(() => {
    const hide = setTimeout(() => setExiting(true), 2600)
    const remove = setTimeout(onClose, 3000)
    return () => { clearTimeout(hide); clearTimeout(remove) }
  }, [onClose])

  return (
    <div
      className={exiting ? 'toast-exit' : 'toast-enter'}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '20px',
        zIndex: 100,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        borderRadius: '12px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        maxWidth: '320px',
      }}
    >
      <span style={{ fontWeight: 700 }}>{cfg.icon}</span>
      {message}
    </div>
  )
}
