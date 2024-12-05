import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../Firebase"; // Adjust this to your Firebase config file
import Titlepic from "../Titlepic";
import SignOut from "../SignOut";

const CheckPauseTime = () => {
  const [lines, setLines] = useState([
    { id: 1, pauseTime: 0 },
    { id: 2, pauseTime: 0 },
    { id: 3, pauseTime: 0 },
    { id: 4, pauseTime: 0 },
    { id: 5, pauseTime: 0 },
    { id: 6, pauseTime: 0 },
    { id: 7, pauseTime: 0 },
    { id: 8, pauseTime: 0 },
    { id: 9, pauseTime: 0 },
    { id: 10, pauseTime: 0 },
    { id: 11, pauseTime: 0 },
    { id: 12, pauseTime: 0 },
  ]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCurrentDataDisplayed, setIsCurrentDataDisplayed] = useState(true);

  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  useEffect(() => {
    if (isCurrentDataDisplayed) {
      fetchPauseTimeData(selectedDate);
    }
  }, [selectedDate]);

  const fetchPauseTimeData = (date) => {
    const dailyUpdatesRef = ref(database, `dailyUpdates/${date}`);

    const unsubscribe = onValue(dailyUpdatesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const updatedLines = lines.map((line) => {
          const lineData = data[`Line ${line.id}`]; // Access data for each line
          return {
            ...line,
            pauseTime: lineData?.pauseTime || 0, // Set pauseTime or default to 0
          };
        });
        setLines(updatedLines);
        setIsCurrentDataDisplayed(false); // Hide current data when new date is searched
      } else {
        setLines(lines.map(line => ({ ...line, pauseTime: 0 }))); // Reset pause times if no data found
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const validateDateJoined = (date) => {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in yyyy-mm-dd format
  
    // Check if the date is in the future
    if (date > today) {
      alert("Cannot check pause time of future date.");
      setSelectedDate(''); // Optionally reset the date field
    }
  };

  const handleCheckPauseTime = () => {
    fetchPauseTimeData(selectedDate);
  };

  const formatPauseTime = (pauseTimeInSeconds) => {
    const hours = Math.floor(pauseTimeInSeconds / 3600);
    const minutes = Math.floor((pauseTimeInSeconds % 3600) / 60);
    const seconds = pauseTimeInSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="holder">
        <div>
      <Titlepic />
      <SignOut />
      <div className="pause-time-container">
        <center><h2>Pause Time by Line</h2></center>
        <div className="date">
          <h3>Today is: {formattedDate}</h3>
        </div>
        <div>
          <label htmlFor="date-picker">Select Date:</label>
          <input 
            type="date"
            id="date-picker"
            value={selectedDate}
            onChange={handleDateChange}
            onBlur={() => validateDateJoined(selectedDate)} 
          />
          <button className="pauseTime" onClick={handleCheckPauseTime}>Check Pause Time</button>
        </div>
        {lines.map((line) => (
          <div className="pause"key={line.id}>
            <p><b><span></span>Line {line.id}: </b>
            <span>Pause Time: {formatPauseTime(line.pauseTime)}</span></p>
          </div>
        ))}
      </div>
      <br></br>
    </div>
    </div>
  );
};

export default CheckPauseTime;
