import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  order?: number;
  topicId?: string;
  date?: string;
}

interface CalendarProps {
  todos: TodoItem[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  topics: { id: string; title: string; }[];
}

export default function Calendar({ todos, selectedDate, onDateSelect, topics }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const getTodosForDate = (date: Date) => {
    return todos.filter(todo => {
      if (!todo.date) return false;
      return isSameDay(new Date(todo.date), date);
    });
  };

  const getTopicColor = (topicId: string | undefined) => {
    if (!topicId) return 'bg-[#F3EFEE]';
    const colors = [
      'bg-[#E6D9CB]',
      'bg-[#D1A28B]',
      'bg-[#9F9F9F]',
      'bg-[#393433]',
    ];
    const index = topics.findIndex(t => t.id === topicId) % colors.length;
    return colors[index];
  };

  const days = getDaysInMonth(currentMonth);
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayIndex = firstDayOfMonth.getDay();

  return (
    <div className="w-[600px] bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#121212]">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
            className="p-2 hover:bg-[#F3EFEE] rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 text-sm font-medium hover:bg-[#F3EFEE] rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
            className="p-2 hover:bg-[#F3EFEE] rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[#F3EFEE] rounded-lg overflow-hidden">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-[#9F9F9F] bg-white">
            {day}
          </div>
        ))}
        
        {Array.from({ length: startingDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} className="p-2 bg-white min-h-[100px]" />
        ))}

        {days.map(day => {
          const dayTodos = getTodosForDate(day);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={`p-2 bg-white min-h-[100px] cursor-pointer hover:bg-[#F9F5F4] transition-colors ${
                isSelected ? 'bg-[#F9F5F4]' : ''
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                    isToday
                      ? 'bg-[#393433] text-white'
                      : isCurrentMonth
                      ? 'text-[#121212]'
                      : 'text-[#9F9F9F]'
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="space-y-1">
                {dayTodos.slice(0, 3).map(todo => (
                  <div
                    key={todo.id}
                    className={`px-2 py-1 rounded text-xs font-medium truncate ${
                      getTopicColor(todo.topicId)
                    } ${todo.completed ? 'line-through opacity-50' : ''}`}
                    title={todo.text}
                  >
                    {todo.text}
                  </div>
                ))}
                {dayTodos.length > 3 && (
                  <div className="text-xs text-[#9F9F9F] text-center">
                    +{dayTodos.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 