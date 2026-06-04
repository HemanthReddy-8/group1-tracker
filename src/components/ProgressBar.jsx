export default function ProgressBar({ completion }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium">Day Progress</span>
        <span className="font-semibold" style={{ color: '#1D9E75' }}>{completion}%</span>
      </div>
      <div className="w-full rounded-full h-3" style={{ backgroundColor: '#E1F5EE' }}>
        <div
          className="h-3 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${completion}%`, backgroundColor: '#1D9E75' }}
        />
      </div>
    </div>
  )
}
