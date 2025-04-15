import React, { useState, useEffect, useCallback } from "react";
import { formatDate } from "../util";

const DateFormatter = ({
  date,
  format,
  fromNow,
  toNow,
  calendar,
  withTitle,
  titleFormat,
  tz,
  interval,
  ...props
}) => {
  const [formattedDate, setFormattedDate] = useState("");
  const [title, setTitle] = useState("");

  const updateDate = useCallback(() => {
    const options = {
      format,
      fromNow,
      toNow,
      calendar,
      withTitle,
      titleFormat,
      tz,
    };
    setFormattedDate(formatDate(date, options));

    if (withTitle && titleFormat) {
      setTitle(formatDate(date, { format: titleFormat, tz }));
    }
  }, [date, format, fromNow, toNow, calendar, withTitle, titleFormat, tz]);

  // Initial format
  useEffect(() => {
    updateDate();
  }, [updateDate]);

  // Set up interval for live updates if interval is provided
  useEffect(() => {
    if (!interval) {
      return;
    }

    const timer = setInterval(() => {
      updateDate();
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [interval, updateDate]);

  return (
    <span title={title} {...props}>
      {formattedDate}
    </span>
  );
};

export default DateFormatter;
