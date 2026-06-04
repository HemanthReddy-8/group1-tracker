import { TAG_CONFIG } from '../lib/defaultSlots'

export default function StatusPill({ tag }) {
  const cfg = TAG_CONFIG[tag] || TAG_CONFIG.general
  return (
    <span
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
      className="text-xs font-medium px-2 py-0.5 rounded-full capitalize leading-none"
    >
      {tag}
    </span>
  )
}
