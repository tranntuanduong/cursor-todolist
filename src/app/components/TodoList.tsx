"use client";

import React, { useState, useEffect } from "react";
import Todo from "./Todo";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = "todos-v1";

const defaultTodos: TodoItem[] = [
  { id: "1", text: "Drink 8 glasses of water", completed: false },
  { id: "2", text: "Meditate for 10 minutes", completed: false },
  { id: "3", text: "Read a chapter of a book", completed: false },
  { id: "4", text: "Go for a 30-minute walk", completed: false },
  { id: "5", text: "Write in a gratitude journal", completed: false },
  { id: "6", text: "Plan meals for the day", completed: false },
  { id: "7", text: "Practice deep breathing exercises", completed: false },
  { id: "8", text: "Stretch for 15 minutes", completed: false },
  { id: "9", text: "Limit screen time before bed", completed: false },
  { id: "10", text: "Review daily goals before sleeping", completed: false },
];

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");

  // Load todos from localStorage on mount
  useEffect(() => {
    const storedTodos = localStorage.getItem(STORAGE_KEY);
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    } else {
      setTodos(defaultTodos);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTodos));
    }

    // Save todos when user leaves the site
    const handleBeforeUnload = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Save one last time when component unmounts
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    };
  }, []); // Empty dependency array for mount/unmount only

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now().toString(),
          text: newTodo.trim(),
          completed: false,
        },
      ]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const editTodo = (id: string, newText: string) => {
    if (newText.trim()) {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, text: newText.trim() } : todo
        )
      );
    }
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="w-[386px] flex flex-col gap-8">
      <div className="flex justify-center">
        <h1 className="text-4xl font-bold tracking-[-0.02em]">Personal</h1>
      </div>

      <div className="flex flex-col gap-4">
        {todos.map((todo) => (
          <Todo
            key={todo.id}
            id={todo.id}
            text={todo.text}
            completed={todo.completed}
            onToggle={() => toggleTodo(todo.id)}
            onEdit={(newText) => editTodo(todo.id, newText)}
            onDelete={() => deleteTodo(todo.id)}
          />
        ))}
      </div>

      <form onSubmit={addTodo} className="flex gap-3">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Write a task..."
          className="flex-1 px-[21px] py-[14px] bg-[#F3EFEE] rounded-xl text-[18px] font-medium text-[#222222] placeholder-[#222222] outline-none focus:ring-2 focus:ring-[#393433] focus:ring-opacity-50 transition-shadow"
        />
        <button
          type="submit"
          className="px-[21px] py-[14px] bg-[#393433] rounded-xl text-[18px] font-medium text-white hover:bg-[#2a2625] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!newTodo.trim()}
        >
          Add
        </button>
      </form>
    </div>
  );
}
