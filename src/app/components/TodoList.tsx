"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProps, DroppableProvided } from "react-beautiful-dnd";
import Todo from "./Todo";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  order?: number;
}

const STORAGE_KEY = "todos-v1";

function StrictModeDroppable({ children, ...props }: DroppableProps) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) {
    return null;
  }
  return <Droppable {...props}>{children}</Droppable>;
}

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
      const newTodos = [
        ...todos,
        {
          id: Date.now().toString(),
          text: newTodo.trim(),
          completed: false,
          order: todos.length,
        },
      ];
      setTodos(newTodos);
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const allTodos = [...todos];
    const sourceList = result.source.droppableId === "completed" 
      ? allTodos.filter(t => t.completed) 
      : allTodos.filter(t => !t.completed);
    
    const [movedItem] = sourceList.splice(source.index, 1);
    
    if (result.source.droppableId === result.destination.droppableId) {
      sourceList.splice(destination.index, 0, movedItem);
      const updatedTodos = allTodos.map(todo => {
        if (result.source.droppableId === "completed" ? todo.completed : !todo.completed) {
          const index = sourceList.findIndex(t => t.id === todo.id);
          return { ...todo, order: index };
        }
        return todo;
      });
      setTodos(updatedTodos);
    }
  };

  const activeTodos = todos.filter(todo => !todo.completed).sort((a, b) => (a.order || 0) - (b.order || 0));
  const completedTodos = todos.filter(todo => todo.completed).sort((a, b) => (a.order || 0) - (b.order || 0));

  if (!mounted) {
    return (
      <div className="w-[386px] flex flex-col gap-8">
        <div className="flex justify-center">
          <h1 className="text-4xl font-bold tracking-[-0.02em]">Personal</h1>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-[386px] flex flex-col gap-8">
      <div className="flex justify-center">
        <h1 className="text-4xl font-bold tracking-[-0.02em]">Personal</h1>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-8">
          <StrictModeDroppable droppableId="active">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-col gap-4"
              >
                {activeTodos.map((todo, index) => (
                  <Draggable key={todo.id} draggableId={todo.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.8 : 1
                        }}
                      >
                        <div {...provided.dragHandleProps}>
                          <Todo
                            id={todo.id}
                            text={todo.text}
                            completed={todo.completed}
                            onToggle={() => toggleTodo(todo.id)}
                            onEdit={(newText) => editTodo(todo.id, newText)}
                            onDelete={() => deleteTodo(todo.id)}
                          />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>

          {completedTodos.length > 0 && (
            <>
              <div className="flex justify-start">
                <h2 className="text-xs font-semibold tracking-[0.04em] text-[#D1A28B] uppercase">
                  COMPLETED
                </h2>
              </div>
              <StrictModeDroppable droppableId="completed">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-col gap-4"
                  >
                    {completedTodos.map((todo, index) => (
                      <Draggable key={todo.id} draggableId={todo.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1
                            }}
                          >
                            <div {...provided.dragHandleProps}>
                              <Todo
                                id={todo.id}
                                text={todo.text}
                                completed={todo.completed}
                                onToggle={() => toggleTodo(todo.id)}
                                onEdit={(newText) => editTodo(todo.id, newText)}
                                onDelete={() => deleteTodo(todo.id)}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </>
          )}
        </div>
      </DragDropContext>

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
