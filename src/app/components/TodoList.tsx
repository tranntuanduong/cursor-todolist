'use client'

import React, { useState } from 'react'
import Todo from './Todo'

interface TodoItem {
  id: string
  text: string
  completed: boolean
}

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Drink 8 glasses of water', completed: false },
    { id: '2', text: 'Meditate for 10 minutes', completed: false },
    { id: '3', text: 'Read a chapter of a book', completed: false },
    { id: '4', text: 'Go for a 30-minute walk', completed: false },
    { id: '5', text: 'Write in a gratitude journal', completed: false },
    { id: '6', text: 'Plan meals for the day', completed: false },
    { id: '7', text: 'Practice deep breathing exercises', completed: false },
    { id: '8', text: 'Stretch for 15 minutes', completed: false },
    { id: '9', text: 'Limit screen time before bed', completed: false },
    { id: '10', text: 'Review daily goals before sleeping', completed: false },
  ])
  const [newTodo, setNewTodo] = useState('')

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false
      }])
      setNewTodo('')
    }
  }

  return (
    <div className="w-[386px] flex flex-col gap-8">
      <div className="flex justify-center">
        <h1 className="text-4xl font-bold tracking-[-0.02em]">Personal</h1>
      </div>

      <div className="flex flex-col gap-4">
        {todos.map(todo => (
          <Todo
            key={todo.id}
            text={todo.text}
            completed={todo.completed}
            onClick={() => toggleTodo(todo.id)}
          />
        ))}
      </div>

      <div className="relative w-full">
        <div className="absolute inset-x-0 h-32 bg-gradient-to-t from-[#F9F5F4] to-transparent" />
      </div>

      <div className="flex gap-3">
        <div className="flex-1 bg-[#F3EFEE] rounded-xl">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Write a task..."
            className="w-full px-[21px] py-[14px] bg-transparent text-[18px] font-medium text-[#222222] placeholder-[#222222] outline-none"
          />
        </div>
        <button
          onClick={addTodo}
          className="px-[21px] py-[14px] bg-[#393433] rounded-xl text-[18px] font-medium text-white"
        >
          Add
        </button>
      </div>
    </div>
  )
} 