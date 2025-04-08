import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import {
  DragDropContext,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { twMerge } from 'tailwind-merge';
import { StrictModeDroppable } from "./StrictModeDroppable";
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
  color: string;
}

interface CalendarProps {
  todos: TodoItem[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  topics: Topic[];
  onTodoUpdate: (todoId: string, date: string) => void;
}

export default function Calendar({
  todos,
  selectedDate,
  onDateSelect,
  topics,
  onTodoUpdate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const getTodosForDate = (date: Date) => {
    return todos.filter((todo) => {
      if (!todo.date) return false;
      return isSameDay(new Date(todo.date), date);
    });
  };

  const getTopicColor = (topicId: string | undefined) => {
    if (!topicId) return "bg-[#F3EFEE]";
    const topic = topics.find((t) => t.id === topicId);
    return topic ? topic.color : "#F3EFEE";
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    console.log("handleDragEnd:::", result);

    if (!destination) return;

    const sourceDate = source.droppableId;
    const destinationDate = destination.droppableId;

    if (sourceDate === destinationDate) return;

    onTodoUpdate(draggableId, destinationDate);
  };

  const days = getDaysInMonth(currentMonth);
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayIndex = firstDayOfMonth.getDay();

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="w-[800px] bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#121212]">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
              className="p-2 hover:bg-[#F3EFEE] rounded-lg transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1 text-sm font-medium hover:bg-[#F3EFEE] rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
              className="p-2 hover:bg-[#F3EFEE] rounded-lg transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-[#F3EFEE] rounded-lg overflow-hidden">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-[#9F9F9F] bg-white"
            >
              {day}
            </div>
          ))}

          {Array.from({ length: startingDayIndex }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="p-2 bg-white min-h-[100px]"
            />
          ))}

          {days.map((day) => {
            const dayTodos = getTodosForDate(day);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <StrictModeDroppable
                droppableId={day.toISOString()}
                key={day.toISOString()}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    onClick={() => onDateSelect(day)}
                    className={twMerge(
                      'p-2 bg-white min-h-[100px] cursor-pointer transition-colors',
                      isSelected && 'bg-[#F9F5F4]',
                      snapshot.isDraggingOver ? 'bg-[#F3EFEE]' : 'hover:bg-[#F9F5F4]'
                    )}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <span
                        className={twMerge(
                          'w-8 h-8 flex items-center justify-center rounded-full text-sm',
                          isToday && 'bg-[#393433] text-white',
                          !isToday && isCurrentMonth && 'text-[#121212]',
                          !isToday && !isCurrentMonth && 'text-[#9F9F9F]'
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {dayTodos
                        .sort((a, b) => {
                          if (a.completed !== b.completed) {
                            return a.completed ? 1 : -1;
                          }
                          return (a.order || 0) - (b.order || 0);
                        })
                        .slice(0, 4)
                        .map((todo, index) => {
                          const topic = topics.find(t => t.id === todo.topicId);
                          return (
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
                                  className={twMerge(
                                    'px-2 py-0.5 rounded text-xs font-medium truncate',
                                    todo.completed && 'line-through opacity-50',
                                    snapshot.isDragging && 'opacity-50'
                                  )}
                                  title={todo.text}
                                  style={{
                                    backgroundColor: getTopicColor(todo.topicId),
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  {todo.text}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      {dayTodos.length > 4 && (
                        <div 
                          className="group relative text-xs text-[#9F9F9F] text-center cursor-pointer hover:text-[#121212] transition-colors"
                        >
                          +{dayTodos.length - 4} more
                          <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 min-w-[120px] bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="p-4">
                              <div className="text-xs font-medium text-[#9F9F9F] mb-3">
                                {day.toLocaleDateString('en-US', { 
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="flex flex-col gap-2">
                                {dayTodos
                                  .sort((a, b) => {
                                    if (a.completed !== b.completed) {
                                      return a.completed ? 1 : -1;
                                    }
                                    return (a.order || 0) - (b.order || 0);
                                  })
                                  .slice(4)
                                  .map((todo) => {
                                    const topic = topics.find(t => t.id === todo.topicId);
                                    return (
                                      <div key={todo.id} className="flex items-start gap-2">
                                        <div 
                                          className="w-[5px] h-[5px] rounded-[1px] mt-[6px]" 
                                          style={{ 
                                            backgroundColor: topic?.color || '#F9F5F4'
                                          }} 
                                        />
                                        <div className={twMerge(
                                          'flex-1 text-sm',
                                          todo.completed ? 'text-[#9F9F9F] line-through' : 'text-[#121212]'
                                        )}>
                                          {todo.text}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </StrictModeDroppable>
            );
          })}
        </div>
      </div>
    </DragDropContext>
  );
}
