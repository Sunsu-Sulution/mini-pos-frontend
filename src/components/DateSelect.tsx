"use client";
import { IconCalendar } from "@tabler/icons-react";
import React, { useState, useEffect } from "react";

interface DateSelectProp {
  value?: Date | { start: Date; end: Date };
  onChange?: (date: Date | { start: Date; end: Date }) => void;
  placeholder?: string;
  range?: boolean; // Enable range selection mode
}

export default function DateSelect({
  value,
  onChange,
  placeholder = "เลือกวันที่",
  range = false,
}: DateSelectProp) {
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const isRangeValue = (
    val?: Date | { start: Date; end: Date },
  ): val is { start: Date; end: Date } => {
    return val !== undefined && typeof val === "object" && "start" in val;
  };

  const [selectedDate, setSelectedDate] = useState<Date>(
    !range && !isRangeValue(value) ? value || getToday() : getToday(),
  );
  const [startDate, setStartDate] = useState<Date | null>(
    range && isRangeValue(value) ? value.start : null,
  );
  const [endDate, setEndDate] = useState<Date | null>(
    range && isRangeValue(value) ? value.end : null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (range && isRangeValue(value)) {
      return new Date(value.start);
    }
    if (!range && value instanceof Date) {
      return new Date(value);
    }
    return getToday();
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (range) {
      if (isRangeValue(value)) {
        setStartDate(value.start);
        setEndDate(value.end);
        setCurrentMonth(new Date(value.start));
      }
    } else {
      if (value instanceof Date) {
        setSelectedDate(value);
        setCurrentMonth(new Date(value));
      }
    }
  }, [value, range]);

  useEffect(() => {
    if (!value && onChange && !range) {
      onChange(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDisplayText = (): string => {
    if (range) {
      if (startDate && endDate) {
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      } else if (startDate) {
        return `${formatDate(startDate)} - ...`;
      }
      return placeholder;
    } else {
      return formatDate(selectedDate);
    }
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isDateBetween = (date: Date): boolean => {
    if (!range || !startDate || !endDate) return false;
    return date > startDate && date < endDate;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );

    if (range) {
      if (!startDate || (startDate && endDate)) {
        // Start new selection
        setStartDate(newDate);
        setEndDate(null);
      } else if (startDate && !endDate) {
        // Complete the range
        if (newDate < startDate) {
          // If selected date is before start, swap them
          setEndDate(startDate);
          setStartDate(newDate);
        } else {
          setEndDate(newDate);
        }
        setIsOpen(false);
        if (onChange) {
          onChange({
            start: newDate < startDate ? newDate : startDate,
            end: newDate < startDate ? startDate : newDate,
          });
        }
        return;
      }
    } else {
      setSelectedDate(newDate);
      setIsOpen(false);
      if (onChange) {
        onChange(newDate);
      }
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <>
      <div
        className="flex gap-3 items-center border-2 px-5 py-1 rounded-full cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-xl">{getDisplayText()}</div>
        <IconCalendar size={18} />
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Popup */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-md shadow-2xl max-h-[80vh] overflow-hidden w-[100vw] md:w-[600px] animate-slide-up mx-auto">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Calendar */}
            <div className="px-5 pb-5">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goToPreviousMonth}
                  className="px-3 py-1 text-xl hover:bg-gray-100 rounded-full transition-colors"
                >
                  ‹
                </button>
                <div className="text-xl">
                  {monthNames[currentMonth.getMonth()]}{" "}
                  {currentMonth.getFullYear()}
                </div>
                <button
                  onClick={goToNextMonth}
                  className="px-3 py-1 text-xl hover:bg-gray-100 rounded-full transition-colors"
                >
                  ›
                </button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day, index) => (
                  <div
                    key={index}
                    className="text-center text-sm text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={index} />;
                  }

                  const date = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    day,
                  );

                  let isSelected = false;
                  let isBetween = false;

                  if (range) {
                    const isStart = startDate
                      ? isSameDay(date, startDate)
                      : false;
                    const isEnd = endDate ? isSameDay(date, endDate) : false;
                    isBetween = isDateBetween(date);
                    isSelected = isStart || isEnd;
                  } else {
                    isSelected = selectedDate && isSameDay(date, selectedDate);
                  }

                  const isToday = isSameDay(date, new Date());

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(day)}
                      className={`aspect-square rounded-full text-xl transition-colors relative ${
                        isSelected
                          ? "bg-gray-800 text-white"
                          : range && isBetween
                          ? "bg-gray-100"
                          : isToday
                          ? "bg-gray-200 hover:bg-gray-300"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
