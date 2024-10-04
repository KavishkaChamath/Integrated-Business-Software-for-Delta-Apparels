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
  const currentDate = new Date().toISOString().split('T')[0]; // Format current date as YYYY-MM-DD

  useEffect(() => {
    const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}`);
    
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
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, [currentDate]);

  const formatPauseTime = (pauseTimeInSeconds) => {
    const hours = Math.floor(pauseTimeInSeconds / 3600);
    const minutes = Math.floor((pauseTimeInSeconds % 3600) / 60);
    const seconds = pauseTimeInSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div>
        <Titlepic/>
        <SignOut/>
    <div className="pause-time-container">
      <h2>Pause Time by Line</h2>
      {lines.map((line) => (
        <div key={line.id}>
          <span>Line {line.id}: </span>
          <span>Pause Time: {formatPauseTime(line.pauseTime)}</span>
        </div>
      ))}
    </div> 
    </div>
  );
};

export default CheckPauseTime;
