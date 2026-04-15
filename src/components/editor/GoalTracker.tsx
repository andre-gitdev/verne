'use client'
import { useState } from 'react'

interface GoalTrackerProps {
  sessionWords: number
  totalWords: number
}

export default function GoalTracker({ sessionWords, totalWords }: GoalTrackerProps) {
  const [dailyGoal, setDailyGoal] = useState(1000)
  const [editing, setEditing] = useState(false)
  const progress = Math.min(100, Math.round((sessionWords / dailyGoal) * 100))

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-stone-100 px-6 py-2 flex items-center gap-6">
      <div className="flex-1 flex items-center gap-3">
        <span className="text-xs text-stone-400 whitespace-nowrap">
          Today: {sessionWords.toLocaleString()} /
          {editing ? (
            <input
              type="number"
              defaultValue={dailyGoal}
              className="w-16 mx-1 px-1 text-xs border border-stone-300 rounded focus:outline-none"
              onBlur={e => {
                const val = parseInt(e.target.value)
                if (!isNaN(val) && val > 0) setDailyGoal(val)
                setEditing(false)
              }}
              autoFocus
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="mx-1 underline decoration-dotted text-stone-400 hover:text-stone-600"
            >
              {dailyGoal.toLocaleString()}
            </button>
          )}
          goal
        </span>
        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-stone-400'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-stone-400">{progress}%</span>
      </div>
      <span className="text-xs text-stone-300">{totalWords.toLocaleString()} total words</span>
    </div>
  )
}