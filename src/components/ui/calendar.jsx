"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Calendar from "react-calendar"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function CustomCalendar({
  className,
  classNames,
  showOutsideDays = false, // Calendly hides outside days
  ...props
}) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-3 w-[300px] mx-auto font-sans",
      className
    )}>
      <Calendar
        className={cn("border-0", classNames?.root)}
        showNeighboringMonth={showOutsideDays}
        tileClassName={({ date, view }) => {
          if (view !== "month") return ""
          const today = new Date()
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          const isSelected = props.value && 
            (Array.isArray(props.value) 
              ? props.value.some(d => d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear())
              : props.value.getDate() === date.getDate() &&
                props.value.getMonth() === date.getMonth() &&
                props.value.getFullYear() === date.getFullYear())
          const isDisabled = props.tileDisabled?.({ date, view })
          return cn(
            "flex items-center justify-center text-sm font-normal transition-colors duration-100",
            "h-8 w-8 rounded-full", // Smaller cells for Calendly's compact look
            "hover:bg-[#e6f0fa] hover:text-[#006bff]",
            isToday && !isSelected && "border-2 border-[#006bff] text-[#006bff] rounded-full",
            isSelected && "bg-[#006bff] text-white hover:bg-[#0059e6] rounded-full",
            isDisabled && "text-gray-300 opacity-50 cursor-not-allowed hover:bg-transparent"
          )
        }}
        navigationLabel={({ date }) => (
          <span className="text-base font-semibold text-gray-900">
            {date.toLocaleString("default", { month: "long" })} {date.getFullYear()}
          </span>
        )}
        prevLabel={<ChevronLeft className="h-4 w-4 text-gray-600 hover:text-gray-900" />}
        nextLabel={<ChevronRight className="h-4 w-4 text-gray-600 hover:text-gray-900" />}
        prev2Label={null}
        next2Label={null}
        formatShortWeekday={(locale, date) =>
          date.toLocaleString(locale, { weekday: "short" }).slice(0, 3).toUpperCase()
        }
        classNames={{
          navigation: "flex justify-between items-center mb-2",
          navigationButton: cn(
            buttonVariants({ variant: "ghost" }),
            "h-7 w-7 p-0 rounded-full",
            "hover:bg-[#e6f0fa] transition-colors duration-100",
            "focus:outline-none focus:ring-2 focus:ring-[#006bff] focus:ring-offset-1"
          ),
          navigationPrev: "absolute left-0",
          navigationNext: "absolute right-0",
          weekday: "text-gray-500 text-xs font-medium uppercase flex items-center justify-center",
          weekdays: "grid grid-cols-7 gap-0 mb-1",
          viewContainer: "grid grid-cols-7 gap-0", // Strict grid for alignment
          tile: "flex-1",
          ...classNames,
        }}
        {...props}
      />
    </div>
  )
}
CustomCalendar.displayName = "CustomCalendar"

export { CustomCalendar as Calendar }