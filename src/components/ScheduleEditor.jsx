import { useState } from 'react'
import { DEFAULT_SLOTS, TAG_OPTIONS, TAG_CONFIG } from '../lib/defaultSlots'

const EMPTY_SLOT = { time: '', name: '', tag: 'general', mins: 0 }

export default function ScheduleEditor({ slots, onSave, onClose }) {
  const [editSlots, setEditSlots]   = useState(() => slots.map(s => ({ ...s })))
  const [editingId, setEditingId]   = useState(null)
  const [newSlot, setNewSlot]       = useState({ ...EMPTY_SLOT })
  const [showAdd, setShowAdd]       = useState(false)
  const [addError, setAddError]     = useState('')

  function updateSlot(id, field, value) {
    setEditSlots(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  function deleteSlot(id) {
    setEditSlots(prev => prev.filter(s => s.id !== id))
    if (editingId === id) setEditingId(null)
  }

  function addSlot() {
    if (!newSlot.name.trim()) { setAddError('Name is required'); return }
    if (!newSlot.time.trim()) { setAddError('Time is required'); return }
    const id = `custom_${Date.now()}`
    setEditSlots(prev => [...prev, { ...newSlot, id, mins: parseInt(newSlot.mins) || 0 }])
    setNewSlot({ ...EMPTY_SLOT })
    setShowAdd(false)
    setAddError('')
  }

  function resetToDefault() {
    if (confirm('Reset schedule to default? Your custom slots will be lost.')) {
      setEditSlots(DEFAULT_SLOTS.map(s => ({ ...s })))
      setEditingId(null)
      setShowAdd(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#FFFFFF', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#f3f4f6' }}>
          <div>
            <h2 className="font-semibold text-base" style={{ color: '#1a1a18' }}>Edit Schedule</h2>
            <p className="text-xs mt-0.5" style={{ color: '#6b6a65' }}>{editSlots.length} slots · saved in browser</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefault}
              className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors"
              style={{ borderColor: '#e5e7eb', color: '#6b6a65' }}
            >
              Reset default
            </button>
            <button onClick={onClose} className="text-xl leading-none" style={{ color: '#9ca3af' }}>×</button>
          </div>
        </div>

        {/* Slots list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {editSlots.map((slot, idx) => {
            const tagCfg = TAG_CONFIG[slot.tag] || TAG_CONFIG.general
            return (
              <div
                key={slot.id}
                className="rounded-xl border p-3"
                style={{ borderColor: editingId === slot.id ? '#1D9E75' : '#e5e7eb', backgroundColor: editingId === slot.id ? '#f9fffe' : '#fafafa' }}
              >
                {editingId === slot.id ? (
                  <div className="space-y-2">
                    <input
                      value={slot.name}
                      onChange={e => updateSlot(slot.id, 'name', e.target.value)}
                      placeholder="Slot name"
                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                      style={{ borderColor: '#e5e7eb', focusRingColor: '#1D9E75' }}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={slot.time}
                        onChange={e => updateSlot(slot.id, 'time', e.target.value)}
                        placeholder="e.g. 6:00 – 7:00 AM"
                        className="text-sm border rounded-lg px-3 py-2 focus:outline-none"
                        style={{ borderColor: '#e5e7eb' }}
                      />
                      <input
                        type="number"
                        value={slot.mins}
                        onChange={e => updateSlot(slot.id, 'mins', parseInt(e.target.value) || 0)}
                        placeholder="Duration (mins)"
                        min="0"
                        className="text-sm border rounded-lg px-3 py-2 focus:outline-none"
                        style={{ borderColor: '#e5e7eb' }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={slot.tag}
                        onChange={e => updateSlot(slot.id, 'tag', e.target.value)}
                        className="flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none"
                        style={{ borderColor: '#e5e7eb' }}
                      >
                        {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-sm px-4 py-2 rounded-lg font-medium"
                        style={{ backgroundColor: '#1D9E75', color: '#fff' }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded flex-shrink-0 text-center text-xs leading-5 font-medium"
                      style={{ backgroundColor: tagCfg.bg, color: tagCfg.color }}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{slot.name}</div>
                      <div className="text-xs" style={{ color: '#9ca3af' }}>
                        {slot.time}{slot.mins > 0 ? ` · ${slot.mins} min` : ''}
                        <span
                          className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs capitalize"
                          style={{ backgroundColor: tagCfg.bg, color: tagCfg.color }}
                        >
                          {slot.tag}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingId(slot.id)}
                      className="text-xs px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                      style={{ color: '#185FA5' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSlot(slot.id)}
                      className="text-xs px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                      style={{ color: '#ef4444' }}
                    >
                      Del
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Add new slot */}
          {showAdd ? (
            <div className="rounded-xl border-2 border-dashed p-3 space-y-2" style={{ borderColor: '#1D9E75' }}>
              <p className="text-xs font-medium" style={{ color: '#1D9E75' }}>New Slot</p>
              {addError && <p className="text-xs" style={{ color: '#993C1D' }}>{addError}</p>}
              <input
                value={newSlot.name}
                onChange={e => { setNewSlot(p => ({ ...p, name: e.target.value })); setAddError('') }}
                placeholder="Slot name *"
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none"
                style={{ borderColor: '#e5e7eb' }}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newSlot.time}
                  onChange={e => { setNewSlot(p => ({ ...p, time: e.target.value })); setAddError('') }}
                  placeholder="e.g. 9:00 – 10:00 AM *"
                  className="text-sm border rounded-lg px-3 py-2 focus:outline-none"
                  style={{ borderColor: '#e5e7eb' }}
                />
                <input
                  type="number"
                  value={newSlot.mins}
                  onChange={e => setNewSlot(p => ({ ...p, mins: e.target.value }))}
                  placeholder="Duration (mins)"
                  min="0"
                  className="text-sm border rounded-lg px-3 py-2 focus:outline-none"
                  style={{ borderColor: '#e5e7eb' }}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={newSlot.tag}
                  onChange={e => setNewSlot(p => ({ ...p, tag: e.target.value }))}
                  className="flex-1 text-sm border rounded-lg px-3 py-2"
                  style={{ borderColor: '#e5e7eb' }}
                >
                  {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button
                  onClick={addSlot}
                  className="text-sm px-4 py-2 rounded-lg font-medium"
                  style={{ backgroundColor: '#1D9E75', color: '#fff' }}
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowAdd(false); setAddError(''); setNewSlot({ ...EMPTY_SLOT }) }}
                  className="text-sm px-3 py-2 rounded-lg border"
                  style={{ borderColor: '#e5e7eb', color: '#6b6a65' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition-colors hover:bg-green-50"
              style={{ borderColor: '#d1d5db', color: '#6b6a65' }}
            >
              + Add new slot
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t" style={{ borderColor: '#f3f4f6' }}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm rounded-xl border transition-colors hover:bg-gray-50"
            style={{ borderColor: '#e5e7eb', color: '#6b6a65' }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editSlots)}
            className="flex-1 py-2.5 text-sm rounded-xl font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#1D9E75', color: '#ffffff' }}
          >
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  )
}
