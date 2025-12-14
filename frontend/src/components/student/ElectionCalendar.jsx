import React, { useState } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const ElectionCalendar = ({ elections, onElectionClick }) => {
  const { isDarkMode, colors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getElectionsForDay = (day) => {
    return elections.filter(election => {
      const startDate = new Date(election.startDate);
      const endDate = new Date(election.endDate);
      const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div
      className="card shadow-sm"
      style={{
        background: isDarkMode ? colors.surface : '#fff',
        border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
        borderRadius: '12px'
      }}
    >
      <div className="card-header border-0 py-3" style={{
        background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
        borderBottom: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`
      }}>
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: isDarkMode ? colors.text : '#212529' }}>
            <FaCalendarAlt className="text-primary" /> Election Calendar
          </h6>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={previousMonth}
              style={{ borderColor: isDarkMode ? colors.border : '#dee2e6', color: isDarkMode ? colors.text : '#6c757d' }}
            >
              <FaChevronLeft />
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={nextMonth}
              style={{ borderColor: isDarkMode ? colors.border : '#dee2e6', color: isDarkMode ? colors.text : '#6c757d' }}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        <div className="text-center mt-2">
          <h5 className="mb-0" style={{ color: isDarkMode ? colors.text : '#212529' }}>
            {monthNames[month]} {year}
          </h5>
        </div>
      </div>
      <div className="card-body p-3">
        {/* Day names */}
        <div className="row g-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="col text-center">
              <small className="fw-bold" style={{ color: isDarkMode ? colors.textSecondary : '#6c757d' }}>
                {day}
              </small>
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="row g-1">
          {/* Empty cells before first day */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="col">
              <div style={{ height: '60px' }} />
            </div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayElections = getElectionsForDay(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
              <div key={day} className="col">
                <div
                  className="calendar-day"
                  style={{
                    height: '60px',
                    border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                    borderRadius: '6px',
                    padding: '4px',
                    background: isToday ? (isDarkMode ? colors.primary : '#e7f1ff') : (isDarkMode ? colors.surface : '#fff'),
                    cursor: dayElections.length > 0 ? 'pointer' : 'default',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (dayElections.length > 0) {
                      e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isToday ? (isDarkMode ? colors.primary : '#e7f1ff') : (isDarkMode ? colors.surface : '#fff');
                  }}
                  onClick={() => {
                    if (dayElections.length > 0) {
                      onElectionClick(dayElections[0]);
                    }
                  }}
                >
                  <div className="small fw-semibold" style={{ color: isDarkMode ? colors.text : '#212529' }}>
                    {day}
                  </div>
                  {dayElections.length > 0 && (
                    <div className="mt-1">
                      {dayElections.slice(0, 2).map((election, idx) => {
                        const status = new Date() < new Date(election.startDate) ? 'upcoming' :
                                     new Date() > new Date(election.endDate) ? 'completed' : 'active';
                        const dotColor = status === 'active' ? '#10b981' : status === 'upcoming' ? '#f59e0b' : '#6b7280';
                        
                        return (
                          <div
                            key={idx}
                            style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              background: dotColor,
                              display: 'inline-block',
                              marginRight: '2px'
                            }}
                            title={election.title}
                          />
                        );
                      })}
                      {dayElections.length > 2 && (
                        <span style={{ fontSize: '0.6rem', color: isDarkMode ? colors.textMuted : '#6c757d' }}>
                          +{dayElections.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}` }}>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
              <small style={{ color: isDarkMode ? colors.textSecondary : '#6c757d' }}>Active</small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
              <small style={{ color: isDarkMode ? colors.textSecondary : '#6c757d' }}>Upcoming</small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#6b7280' }} />
              <small style={{ color: isDarkMode ? colors.textSecondary : '#6c757d' }}>Completed</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionCalendar;
