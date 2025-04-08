'use client'

import React, { useState, useRef, useEffect } from 'react'

interface TodoProps {
  id: string
  text: string
  completed: boolean
  onToggle: () => void
  onDelete: () => void
  onEdit: (newText: string) => void
}

export default function Todo({ id, text, completed, onToggle, onDelete, onEdit }: TodoProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(text)
  const todoRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing && 
          todoRef.current && 
          !todoRef.current.contains(event.target as Node)) {
        if (editText.trim()) {
          onEdit(editText)
        } else {
          setEditText(text)
        }
        setIsEditing(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing, editText, onEdit, text])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleEdit = () => {
    if (isEditing && editText.trim()) {
      onEdit(editText)
    }
    setIsEditing(!isEditing)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editText.trim()) {
      handleEdit()
    } else if (e.key === 'Escape') {
      setEditText(text)
      setIsEditing(false)
    }
  }

  return (
    <div ref={todoRef} className={`flex flex-col w-full ${completed ? 'bg-[#F7F7F7] border border-black/10' : 'bg-[#F3EFEE] hover:bg-[#EBE7E6]'} rounded-xl p-4 group transition-colors`}>
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button 
            onClick={onToggle}
            className={`w-6 h-6 rounded-[6px] flex items-center justify-center border-2 transition-colors ${completed ? 'bg-[#393433] border-[#393433]' : 'bg-white border-[#9F9F9F] hover:bg-[#F9F5F4]'}`}
          >
            {completed && (
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-0 bg-white rounded-md px-2 py-1 text-[17px] font-medium text-[#121212] outline-none"
            />
          ) : (
            <span className={`text-[17px] font-medium truncate ${completed ? 'text-[#121212] opacity-40 line-through' : 'text-[#121212]'}`}>
              {text}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleEdit}
            className={`${completed ? 'hidden' : 'opacity-0 group-hover:opacity-100'} transition-opacity text-[#9F9F9F] hover:text-[#121212]`}
          >
            {isEditing ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          
          <button
            onClick={onDelete}
            className={`${completed ? 'hidden' : 'opacity-0 group-hover:opacity-100'} transition-opacity text-[#9F9F9F] hover:text-red-500`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="grid grid-cols-3 cursor-move">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-1 h-1 bg-[#D9D9D9] rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 