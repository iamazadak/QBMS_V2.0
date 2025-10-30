import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Video, Clock } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  isSameMonth,
  addYears,
  subYears
} from "date-fns";


export default function SessionCalendarView({
  sessions,
  calendarView,
  setCalendarView,
  currentDate,
  setCurrentDate,
  onRefresh
}) {
 
  const navigatePrevious = () => {
    if (calendarView === "daily") setCurrentDate(subDays(currentDate, 1));
    else if (calendarView === "weekly") setCurrentDate(subWeeks(currentDate, 1));
    else if (calendarView === "monthly") setCurrentDate(subMonths(currentDate, 1));
    else if (calendarView === "yearly") setCurrentDate(subYears(currentDate, 1));
  };


  const navigateNext = () => {
    if (calendarView === "daily") setCurrentDate(addDays(currentDate, 1));
    else if (calendarView === "weekly") setCurrentDate(addWeeks(currentDate, 1));
    else if (calendarView === "monthly") setCurrentDate(addMonths(currentDate, 1));
    else if (calendarView === "yearly") setCurrentDate(addYears(currentDate, 1));
  };


  const navigateToday = () => {
    setCurrentDate(new Date());
  };


  const getCalendarDays = () => {
    if (calendarView === "daily") {
      return [currentDate];
    } else if (calendarView === "weekly") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return eachDayOfInterval({ start, end });
    } else if (calendarView === "monthly") {
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      return eachDayOfInterval({ start, end });
    } else if (calendarView === "yearly") {
      const start = startOfYear(currentDate);
      const end = endOfYear(currentDate);
      return eachMonthOfInterval({ start, end });
    }
    return [];
  };


  const getSessionsForDate = (date) => {
    return sessions.filter(session =>
      isSameDay(new Date(session.scheduled_date), date)
    );
  };


  const getSessionsForMonth = (month) => {
    return sessions.filter(session =>
      isSameMonth(new Date(session.scheduled_date), month)
    );
  };


  const getViewTitle = () => {
    if (calendarView === "daily") {
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    } else if (calendarView === "weekly") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    } else if (calendarView === "monthly") {
      return format(currentDate, 'MMMM yyyy');
    } else if (calendarView === "yearly") {
      return format(currentDate, 'yyyy');
    }
    return '';
  };


  const renderDailyView = () => {
    const daySessions = getSessionsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);


    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-[80px_1fr]">
          {/* Time column */}
          <div className="border-r border-slate-200">
            {hours.map(hour => (
              <div key={hour} className="h-16 border-b border-slate-200 flex items-start justify-end pr-2 pt-1 text-xs text-slate-500">
                {format(new Date().setHours(hour, 0, 0, 0), 'h:mm a')}
              </div>
            ))}
          </div>
         
          {/* Sessions column */}
          <div className="relative">
            {hours.map(hour => (
              <div key={hour} className="h-16 border-b border-slate-200"></div>
            ))}
           
            {/* Render sessions */}
            {daySessions.map((session, idx) => {
              const sessionDate = new Date(session.scheduled_date);
              const hour = sessionDate.getHours();
              const minutes = sessionDate.getMinutes();
              const top = hour * 64 + (minutes / 60) * 64;
              const height = (session.duration_minutes / 60) * 64;


              return (
                <div
                  key={session.id}
                  className="absolute left-2 right-2 bg-blue-100 border-l-4 border-blue-600 rounded p-2 cursor-pointer hover:bg-blue-200 transition-colors"
                  style={{ top: `${top}px`, height: `${height}px`, minHeight: '40px' }}
                >
                  <div className="text-sm font-semibold text-blue-900 truncate">{session.title}</div>
                  <div className="text-xs text-blue-700">{session.instructor_name}</div>
                  {session.status === 'live' && (
                    <Badge className="bg-red-500 text-white text-xs mt-1">LIVE</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };


  const renderWeeklyView = () => {
    const days = getCalendarDays();
    const hours = Array.from({ length: 24 }, (_, i) => i);


    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-[80px_repeat(7,1fr)]">
          {/* Header */}
          <div className="border-r border-b border-slate-200 bg-slate-50"></div>
          {days.map(day => (
            <div key={day.toString()} className="border-r border-b border-slate-200 bg-slate-50 p-2 text-center">
              <div className="text-xs text-slate-600">{format(day, 'EEE')}</div>
              <div className={`text-lg font-semibold ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-slate-900'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
         
          {/* Time and day columns */}
          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className="border-r border-b border-slate-200 flex items-start justify-end pr-2 pt-1 text-xs text-slate-500 h-12">
                {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
              </div>
              {days.map(day => {
                const daySessions = getSessionsForDate(day).filter(s => {
                  const sessionHour = new Date(s.scheduled_date).getHours();
                  return sessionHour === hour;
                });


                return (
                  <div key={day.toString()} className="border-r border-b border-slate-200 p-1 h-12 relative">
                    {daySessions.map(session => (
                      <div
                        key={session.id}
                        className="bg-blue-100 border-l-2 border-blue-600 rounded px-1 text-xs truncate cursor-pointer hover:bg-blue-200"
                      >
                        {session.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };


  const renderMonthlyView = () => {
    const days = getCalendarDays();
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }


    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 bg-slate-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-slate-700 border-b border-slate-200">
              {day}
            </div>
          ))}
        </div>
       
        {/* Calendar grid */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7">
            {week.map(day => {
              const daySessions = getSessionsForDate(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);


              return (
                <div
                  key={day.toString()}
                  className={`min-h-[120px] border-r border-b border-slate-200 p-2 ${
                    !isCurrentMonth ? 'bg-slate-50' : ''
                  }`}
                >
                  <div className={`text-sm font-semibold mb-2 ${
                    isToday ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center' :
                    isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {format(day, 'd')}
                  </div>
                 
                  <div className="space-y-1">
                    {daySessions.slice(0, 3).map(session => (
                      <div
                        key={session.id}
                        className="bg-blue-100 border-l-2 border-blue-600 rounded px-2 py-1 text-xs cursor-pointer hover:bg-blue-200 transition-colors"
                      >
                        <div className="font-medium truncate">{format(new Date(session.scheduled_date), 'h:mm a')}</div>
                        <div className="truncate">{session.title}</div>
                        {session.status === 'live' && (
                          <Badge className="bg-red-500 text-white text-[10px] mt-1">LIVE</Badge>
                        )}
                      </div>
                    ))}
                    {daySessions.length > 3 && (
                      <div className="text-xs text-slate-500 pl-2">+{daySessions.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };


  const renderYearlyView = () => {
    const months = getCalendarDays();


    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map(month => {
          const monthSessions = getSessionsForMonth(month);
         
          return (
            <Card key={month.toString()} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-3">{format(month, 'MMMM')}</h3>
               
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total Sessions</span>
                    <Badge variant="secondary">{monthSessions.length}</Badge>
                  </div>
                 
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Completed</span>
                    <span className="font-medium">{monthSessions.filter(s => s.status === 'completed').length}</span>
                  </div>
                 
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Upcoming</span>
                    <span className="font-medium">{monthSessions.filter(s => s.status === 'scheduled').length}</span>
                  </div>
                </div>
               
                {monthSessions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="text-xs text-slate-500">Next session:</div>
                    <div className="text-sm font-medium truncate">{monthSessions[0].title}</div>
                    <div className="text-xs text-slate-600">{format(new Date(monthSessions[0].scheduled_date), 'MMM d, h:mm a')}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };


  return (
    <div>
      {/* Calendar Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={navigatePrevious}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">{getViewTitle()}</h2>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={navigateToday}>
            Today
          </Button>
        </div>


        <div className="flex gap-1 bg-white rounded-lg p-1 border border-slate-200">
          <Button
            variant={calendarView === "daily" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCalendarView("daily")}
          >
            Daily
          </Button>
          <Button
            variant={calendarView === "weekly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCalendarView("weekly")}
          >
            Weekly
          </Button>
          <Button
            variant={calendarView === "monthly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCalendarView("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={calendarView === "yearly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCalendarView("yearly")}
          >
            Yearly
          </Button>
        </div>
      </div>


      {/* Calendar Content */}
      {calendarView === "daily" && renderDailyView()}
      {calendarView === "weekly" && renderWeeklyView()}
      {calendarView === "monthly" && renderMonthlyView()}
      {calendarView === "yearly" && renderYearlyView()}
    </div>
  );
}
