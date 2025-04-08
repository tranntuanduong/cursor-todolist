"use client";

import React, { useState, useEffect } from "react";
import Todo from "./Todo";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = "todos-v1";

export default function TodoList() {
  const [mounted, setMounted] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    setMounted(true);
    try {
      const storedTodos = localStorage.getItem(STORAGE_KEY);
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
    } catch (error) {
      console.error("Error loading todos from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error("Error saving todos to localStorage:", error);
    }
  }, [todos, mounted]);

  const handleBeforeUnload = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error("Error saving todos to localStorage:", error);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [mounted, todos]);

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

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          {todos.filter(todo => !todo.completed).map((todo) => (
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

        {todos.some(todo => todo.completed) && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-start">
              <h2 className="text-xs font-semibold tracking-[0.04em] text-[#D1A28B] uppercase">
                COMPLETED
              </h2>
            </div>
            {todos.filter(todo => todo.completed).map((todo) => (
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
        )}
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
