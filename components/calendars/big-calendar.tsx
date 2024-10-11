'use client'

import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface EventData {
  title: string;
  start: Date;
  end: Date;
}

interface BigCalendarProps {
  data: EventData[];
}

const BigCalendar: React.FC<BigCalendarProps> = ({ data }) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    console.log("Data received in BigCalendar:", data);
  }, [data]);

  const localData = data.map((event) => ({
    ...event,
    start: moment(event.start).toDate(),
    end: moment(event.end).toDate(),
  }));

  const handleOnChangeView = (newView: View) => {
    setView(newView);
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const CustomToolbar: React.FC<any> = ({ onNavigate, label, onView, views }) => {
    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" onClick={() => onNavigate('PREV')}>Prev</button>
          <button type="button" onClick={() => onNavigate('TODAY')}>Today</button>
          <button type="button" onClick={() => onNavigate('NEXT')}>Next</button>
        </span>
        <span className="rbc-toolbar-label">{label}</span>
        <span className="rbc-btn-group">
          {views.map((name: string) => (
            <button
              key={name}
              type="button"
              onClick={() => onView(name)}
              className={view === name ? 'rbc-active' : ''}
            >
              {name}
            </button>
          ))}
        </span>
      </div>
    );
  };

  return (
    <Calendar
      localizer={localizer}
      events={localData}
      startAccessor="start"
      endAccessor="end"
      views={["work_week", "day"]}
      view={view}
      date={currentDate}
      onNavigate={handleNavigate}
      style={{ height: "98%" }}
      onView={handleOnChangeView}
      min={moment().hour(8).minute(0).toDate()}
      max={moment().hour(17).minute(0).toDate()}
      components={{
        toolbar: CustomToolbar,
      }}
    />
  );
};

export default BigCalendar;