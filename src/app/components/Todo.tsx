'use client'

import React from 'react'

interface TodoProps {
  text: string
  completed?: boolean
  onClick?: () => void
}

export default function Todo({ text, completed = false, onClick }: TodoProps) {
  return (
    <div className="flex justify-between items-center w-full bg-[#F3EFEE] rounded-xl p-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={onClick}
          className={`w-6 h-6 rounded-[6px] flex items-center justify-center border-2 border-[#9F9F9F] ${completed ? 'bg-white' : 'bg-white'}`}
        >
          {completed && (
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 5L5 9L13 1" stroke="#9F9F9F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        <span className={`text-[17px] font-medium text-[#121212] ${completed ? 'line-through' : ''}`}>
          {text}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-1 h-1 bg-[#D9D9D9] rounded-full" />
        ))}
      </div>
    </div>
  )
} 