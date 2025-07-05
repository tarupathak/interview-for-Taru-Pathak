"use client";
import React, { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import dropdown from "@/public/dropdown.svg";
import Image from "next/image";
import calendar from "@/public/calendar.svg";
import { subMonths, subWeeks, subYears, format } from "date-fns";

const DateFilterDropdown = ({ onRangeChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [range, setRange] = useState([
    {
      startDate: subMonths(new Date(), 6),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [selectedLabel, setSelectedLabel] = useState("All Time");

  const predefinedRanges = [
    { label: "All time", startDate: null },
    { label: "Past week", startDate: subWeeks(new Date(), 1) },
    { label: "Past month", startDate: subMonths(new Date(), 1) },
    { label: "Past 3 months", startDate: subMonths(new Date(), 3) },
    { label: "Past 6 months", startDate: subMonths(new Date(), 6) },
    { label: "Past year", startDate: subYears(new Date(), 1) },
    { label: "Past 2 years", startDate: subYears(new Date(), 2) },
  ];

  const handlePredefinedClick = (startDate, label) => {
    if (!startDate) {
      setSelectedLabel("All Time");
      onRangeChange(null, null);
    } else {
      const endDate = new Date();
      const newRange = [
        {
          startDate,
          endDate,
          key: "selection",
        },
      ];
      setRange(newRange);
      setSelectedLabel(label);
      onRangeChange(startDate, endDate);
    }
    setShowDropdown(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === "dropdown-overlay") {
      setShowDropdown(false);
    }
  };

  const handleCalendarChange = (item) => {
    const start = item.selection.startDate;
    const end = item.selection.endDate;

    setRange([item.selection]);
    if (start && end && start.getTime() !== end.getTime()) {
      setSelectedLabel(
        `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`
      );
      onRangeChange(start, end);
      setShowDropdown(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowDropdown(true)}
        className="px-4 py-2 flex gap-2 items-center"
      >
        <Image src={calendar} alt="calendar" /> {selectedLabel}
        <Image src={dropdown} alt="dropdown" />
      </button>

      {showDropdown && (
        <div
          id="dropdown-overlay"
          className="fixed inset-0 bg-[rgba(0,0,0,0.1)] z-50 bg-opacity-40 flex items-center justify-center sm:px-2"
          onClick={handleOverlayClick}
        >
          <div
            className="bg-white rounded-md shadow-lg flex flex-col sm:flex-row w-full max-w-[90vw] sm:max-w-fit p-4 overflow-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col border-b sm:border-b-0 sm:border-r sm:pr-4 sm:min-w-[140px] mb-4 sm:mb-0">
              {predefinedRanges.map(({ label, startDate }) => (
                <button
                  key={label}
                  className="text-left text-sm px-2 py-1 hover:bg-gray-100 rounded"
                  onClick={() => handlePredefinedClick(startDate, label)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="sm:pl-4">
              <DateRange
                editableDateInputs={true}
                onChange={handleCalendarChange}
                moveRangeOnFirstSelection={false}
                ranges={range}
                months={window.innerWidth < 640 ? 1 : 2}
                direction={window.innerWidth < 640 ? "vertical" : "horizontal"} 
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DateFilterDropdown;
