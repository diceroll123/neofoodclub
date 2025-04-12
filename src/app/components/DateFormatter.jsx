import React, { useState, useEffect } from "react";
import { formatDate } from "../util";
import { Text } from "@chakra-ui/react";

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

  const updateDate = () => {
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
  };

  // Initial format
  useEffect(() => {
    updateDate();
  }, [date, format, fromNow, toNow, calendar, withTitle, titleFormat, tz]);

  // Set up interval for live updates if interval is provided
  useEffect(() => {
    if (!interval) return;

    const timer = setInterval(() => {
      updateDate();
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [
    interval,
    date,
    format,
    fromNow,
    toNow,
    calendar,
    withTitle,
    titleFormat,
    tz,
  ]);

  return (
    <span title={title} {...props}>
      {formattedDate}
    </span>
  );
};

export default DateFormatter;
