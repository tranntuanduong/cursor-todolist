"use client";

import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProps,
  DroppableProvided,
} from "react-beautiful-dnd";
import Todo from "./Todo";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  order?: number;
  topicId?: string;
  date?: string;
}

interface Topic {
  id: string;
  title: string;
}

const STORAGE_KEY = "todos-v1";
const TOPICS_STORAGE_KEY = "topics-v1";

const DEFAULT_TOPIC: Topic = {
  id: "uncategorized",
  title: "Uncategorized",
};

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
  const [topics, setTopics] = useState<Topic[]>([DEFAULT_TOPIC]);
  const [newTodo, setNewTodo] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    DEFAULT_TOPIC.id
  );
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicTitle, setEditingTopicTitle] = useState<string>("");

  const dates = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatDate = (date: Date) => {
    return {
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" })
        .format(date)
        .toUpperCase(),
      date: date.getDate().toString(),
      isToday: date.toDateString() === new Date().toDateString(),
    };
  };

  const formatDateTitle = (date: Date) => {
    const isToday = date.toDateString() === new Date().toDateString();
    if (isToday) return "Today";

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(date);
  };

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

  // Load topics from localStorage
  useEffect(() => {
    try {
      const storedTopics = localStorage.getItem(TOPICS_STORAGE_KEY);
      if (storedTopics) {
        const parsedTopics = JSON.parse(storedTopics);
        // Ensure default topic is always present
        if (!parsedTopics.find((t: Topic) => t.id === DEFAULT_TOPIC.id)) {
          parsedTopics.unshift(DEFAULT_TOPIC);
        }
        setTopics(parsedTopics);
      }
    } catch (error) {
      console.error("Error loading topics from localStorage:", error);
    }
  }, []);

  // Save topics to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(topics));
    } catch (error) {
      console.error("Error saving topics to localStorage:", error);
    }
  }, [topics, mounted]);

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopic.trim()) {
      const title = newTopic.trim();
      const newTopicItem: Topic = {
        id: Date.now().toString(),
        title,
      };

      setTopics((prev) => [...prev, newTopicItem]);
      setSelectedTopicId(newTopicItem.id);
      setNewTopic("");
      setIsAddingTopic(false);
    }
  };

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
          date: selectedDate.toISOString(),
          topicId: selectedTopicId,
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

  const editTodoTopic = (id: string, newTopicId: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, topicId: newTopicId } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Get the filtered todos for the current date
    const currentDateTodos = todos
      .filter((todo) => todo.date && isSameDate(todo.date, selectedDate))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Get grouped todos
    const groupedTodos = groupTodosByTopic(currentDateTodos);

    // Extract source and destination topics from droppableIds
    const sourceTopicId =
      source.droppableId === "completed"
        ? "completed"
        : source.droppableId.replace("topic-", "");

    const destinationTopicId =
      destination.droppableId === "completed"
        ? "completed"
        : destination.droppableId.replace("topic-", "");

    // Get the todo being moved
    const sourceList =
      sourceTopicId === "completed"
        ? completedTodos
        : groupedTodos[sourceTopicId] || [];
    const [movedTodo] = sourceList.splice(source.index, 1);

    // Update the todo's topic and completed status
    const updatedTodo = {
      ...movedTodo,
      topicId:
        destinationTopicId === "completed"
          ? movedTodo.topicId
          : destinationTopicId,
      completed: destinationTopicId === "completed",
    };

    // Insert into destination list
    const destinationList =
      destinationTopicId === "completed"
        ? completedTodos
        : groupedTodos[destinationTopicId] || [];
    destinationList.splice(destination.index, 0, updatedTodo);

    // Flatten and update orders
    const allTodos = Object.values(groupedTodos)
      .flat()
      .concat(completedTodos)
      .map((todo, index) => ({ ...todo, order: index }));

    // Update the todos array while preserving todos from other dates
    const updatedTodos = todos.map((todo) => {
      const updatedTodo = allTodos.find((t) => t.id === todo.id);
      if (updatedTodo) {
        return updatedTodo;
      }
      return todo;
    });

    setTodos(updatedTodos);
  };

  const isSameDate = (date1: string, date2: Date) => {
    const d1 = new Date(date1);
    return d1.toDateString() === date2.toDateString();
  };

  const groupTodosByTopic = (todos: TodoItem[]) => {
    const groups: { [key: string]: TodoItem[] } = {};

    // Initialize groups for all topics
    topics.forEach((topic) => {
      groups[topic.id] = [];
    });

    // Group todos by topic
    todos.forEach((todo) => {
      const topicId = todo.topicId || DEFAULT_TOPIC.id;
      if (!groups[topicId]) {
        groups[topicId] = [];
      }
      groups[topicId].push(todo);
    });

    // Sort todos within each group by order
    Object.keys(groups).forEach((topicId) => {
      groups[topicId].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    return groups;
  };

  const flattenedIndex = (
    groups: { [key: string]: TodoItem[] },
    currentTopicId: string,
    currentIndex: number
  ) => {
    let index = 0;
    for (const [topicId, todos] of Object.entries(groups)) {
      if (topicId === currentTopicId) {
        return index + currentIndex;
      }
      index += todos.length;
    }
    return index;
  };

  const activeTodos = todos
    .filter(
      (todo) =>
        !todo.completed && todo.date && isSameDate(todo.date, selectedDate)
    )
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const completedTodos = todos
    .filter(
      (todo) =>
        todo.completed && todo.date && isSameDate(todo.date, selectedDate)
    )
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const activeGroupedTodos = groupTodosByTopic(activeTodos);

  // Get unique topics from todos
  const topicsFromTodos = Array.from(
    new Set(todos.map((todo) => todo.topicId || DEFAULT_TOPIC.id))
  );
  const activeTopics = topicsFromTodos
    .map((id) => topics.find((t) => t.id === id))
    .filter(Boolean);
  if (!activeTopics.includes(DEFAULT_TOPIC)) {
    activeTopics.unshift(DEFAULT_TOPIC);
  }

  const handleStartEditTopic = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setEditingTopicTitle(topic.title);
  };

  const handleEditTopic = (topicId: string, newTitle: string) => {
    if (topicId === DEFAULT_TOPIC.id) return;
    if (newTitle.trim()) {
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId ? { ...topic, title: newTitle.trim() } : topic
        )
      );
      setEditingTopicId(null);
      setEditingTopicTitle("");
    }
  };

  const handleDeleteTopic = (topicId: string) => {
    if (topicId === DEFAULT_TOPIC.id) return;
    setTopics((prev) => prev.filter((topic) => topic.id !== topicId));
    setTodos((prev) =>
      prev.map((todo) =>
        todo.topicId === topicId ? { ...todo, topicId: DEFAULT_TOPIC.id } : todo
      )
    );
    if (selectedTopicId === topicId) {
      setSelectedTopicId(DEFAULT_TOPIC.id);
    }
  };

  const getTopicsWithTodos = () => {
    const todosForCurrentDate = todos.filter(
      (todo) => todo.date && isSameDate(todo.date, selectedDate)
    );
    const topicsWithTodos = new Set(
      todosForCurrentDate.map((todo) => todo.topicId)
    );
    return topics.filter(
      (topic) => topic.id === DEFAULT_TOPIC.id || topicsWithTodos.has(topic.id)
    );
  };

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

  console.log("todo:::", todos);

  return (
    <div className="w-[386px] flex flex-col gap-8">
      <div className="flex flex-col gap-8">
        <h1 className="text-4xl font-bold tracking-[-0.02em] text-center">
          {formatDateTitle(selectedDate)}
        </h1>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {dates.map((date, index) => {
            const { day, date: dateNum, isToday } = formatDate(date);
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center justify-center gap-2 min-w-[60px] py-3 px-1.5 rounded-lg transition-colors ${
                  selectedDate.toDateString() === date.toDateString()
                    ? "bg-[#E6D9CB] text-[rgba(18,18,18,0.8)]"
                    : "bg-[#F3EFEE] border border-black/10 text-[rgba(18,18,18,0.5)]"
                }`}
              >
                <span className="text-xs font-semibold tracking-[0.04em]">
                  {day}
                </span>
                <span className="text-[17px] font-semibold tracking-[0.04em]">
                  {dateNum}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => {
            return (
              <div
                key={topic.id}
                className={`relative group px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  selectedTopicId === topic.id
                    ? "bg-[#E6D9CB] text-[rgba(18,18,18,0.8)]"
                    : "bg-[#F3EFEE] text-[#D1A28B]"
                }`}
                onClick={() => setSelectedTopicId(topic.id)}
              >
                <span className="text-xs font-semibold tracking-[0.04em] uppercase">
                  {topic.title}
                </span>
              </div>
            );
          })}
          <button
            onClick={() => setIsAddingTopic(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-[0.04em] uppercase bg-[#F3EFEE] text-[#D1A28B] hover:bg-[#EBE7E6]"
          >
            + Add Topic
          </button>
        </div>

        {isAddingTopic && (
          <form onSubmit={handleAddTopic} className="flex gap-2 mt-2">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="New topic name..."
              className="flex-1 px-3 py-1.5 bg-[#F3EFEE] rounded-lg text-xs font-semibold tracking-[0.04em] uppercase text-[#D1A28B] outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#E6D9CB] rounded-lg text-xs font-semibold tracking-[0.04em] uppercase text-[rgba(18,18,18,0.8)]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setNewTopic("");
                setIsAddingTopic(false);
              }}
              className="px-3 py-1.5 bg-[#F3EFEE] rounded-lg text-xs font-semibold tracking-[0.04em] uppercase text-[#D1A28B]"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-8">
          {Object.entries(activeGroupedTodos).map(([topicId, todos]) => (
            <div key={topicId} className="flex flex-col gap-4">
              <div className="flex justify-start">
                <h2 className="text-xs font-semibold tracking-[0.04em] text-[#D1A28B] uppercase">
                  {topics.find((t) => t.id === topicId)?.title ||
                    DEFAULT_TOPIC.title}
                </h2>
              </div>
              <StrictModeDroppable droppableId={`topic-${topicId}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-4 transition-all duration-200 ${
                      snapshot.isDraggingOver ? "pb-[0px]" : ""
                    }`}
                  >
                    {todos.map((todo, index) => (
                      <Draggable
                        key={todo.id}
                        draggableId={todo.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              zIndex: snapshot.isDragging ? 100 : "auto",
                            }}
                          >
                            <Todo
                              key={todo.id}
                              id={todo.id}
                              text={todo.text}
                              completed={todo.completed}
                              onToggle={() => toggleTodo(todo.id)}
                              onDelete={() => deleteTodo(todo.id)}
                              onEdit={(newText) => editTodo(todo.id, newText)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </div>
          ))}

          {completedTodos.length > 0 && (
            <>
              <div className="flex justify-start">
                <h2 className="text-xs font-semibold tracking-[0.04em] text-[#D1A28B] uppercase">
                  COMPLETED
                </h2>
              </div>
              <StrictModeDroppable droppableId="completed">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-4 transition-all duration-200 ${
                      snapshot.isDraggingOver ? "pb-[100px]" : ""
                    }`}
                  >
                    {completedTodos.map((todo, index) => (
                      <Draggable
                        key={todo.id}
                        draggableId={todo.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              zIndex: snapshot.isDragging ? 100 : "auto",
                            }}
                          >
                            <Todo
                              id={todo.id}
                              text={todo.text}
                              completed={todo.completed}
                              onToggle={() => toggleTodo(todo.id)}
                              onEdit={(newText) => editTodo(todo.id, newText)}
                              onDelete={() => deleteTodo(todo.id)}
                            />
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
