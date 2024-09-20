import React, { useState, useEffect } from 'react';
import { database } from '../../Firebase'; // Import the Firebase app and Realtime Database instance
import { ref, set, serverTimestamp} from 'firebase/database'; // Import the ref and onValue functions from Firebase Realtime Database

const Timer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  // Function to check the current day and time to start the timer automatically
  const checkAutoStart = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 1 = Monday, 6 = Saturday
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if the current day is between Monday and Saturday and if the time is 7:30 AM
    if (currentDay >= 1 && currentDay <= 6 && currentHour === 21 && currentMinute === 47) {
      startTimer();
    }
  };

  // Function to start the timer
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      saveRuntime(0); // Initialize runtime to 0.0 in Firebase

      const id = setInterval(() => {
        setTime((prevTime) => prevTime + 0.1);
      }, 100); // Timer updates every 100ms (0.1s)
      setIntervalId(id);
    }
  };

  // Function to pause the timer
  const pauseTimer = () => {
    if (isRunning) {
      clearInterval(intervalId);
      setIsRunning(false);
      updateRuntime(time); // Save the current runtime when paused
    }
  };

  // Function to resume the timer
  const resumeTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      const id = setInterval(() => {
        setTime((prevTime) => prevTime + 0.1);
      }, 100);
      setIntervalId(id);
    }
  };

  // Function to stop the timer
  const stopTimer = () => {
    clearInterval(intervalId);
    setIsRunning(false);
    updateRuntime(time); // Final runtime update when stopping
  };

  // Function to save initial runtime to Firebase
  const saveRuntime = (runtime) => {
    const date = new Date().toISOString().split("T")[0]; // Get current date (YYYY-MM-DD)
    const dailyUpdateRef = ref(database, `dailyUpdate/${date}`);

    set(dailyUpdateRef, {
      runtime: runtime,
      timestamp: serverTimestamp(),
    });
  };

  // Function to update runtime in Firebase
  const updateRuntime = (runtime) => {
    const date = new Date().toISOString().split("T")[0];
    const dailyUpdateRef = ref(database, `dailyUpdate/${date}`);

    set(dailyUpdateRef, {
      runtime: runtime.toFixed(1), // Save runtime with one decimal point
      timestamp: serverTimestamp(),
    });
  };

  // Check auto-start every minute
  useEffect(() => {
    const autoStartCheck = setInterval(() => {
      checkAutoStart();
    }, 60000); // Check every 60 seconds

    return () => clearInterval(autoStartCheck);
  }, []);

  return (
    <div>
      <h1>Timer: {time.toFixed(1)}s</h1>
      <button onClick={isRunning ? pauseTimer : resumeTimer}>
        {isRunning ? "Pause" : "Resume"}
      </button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
};

export default Timer;
