// import { startAfter } from 'firebase/database';
// import React, { useState } from 'react';

// function ButtonFlow() {
//     const [isStarted, setIsStarted] = useState(false);
//     const [isPaused, setIsPaused] = useState(false);
//     const [isFinished, setIsFinished] = useState(false);

//     const handleStart = () => {
//         setIsStarted(true);
//         setIsPaused(false);
//         setIsFinished(false);
//     };

//     const handlePauseResume = () => {
//         setIsPaused(!isPaused);
//     };

//     const handleFinish = () => {
//         setIsFinished(true);
//         setIsStarted(false);  // Optionally reset all states
//         setIsPaused(false);
//     };

//     return (
//         <div>
//             <button 
//                 onClick={handleStart} 
//                 disabled={isStarted || isFinished}
//             >
//                 Start
//             </button>
            
//             <button 
//                 onClick={handlePauseResume} 
//                 disabled={!isStarted || isFinished}
//             >
//                 {isPaused ? "Resume" : "Pause"}
//             </button>
            
//             <button 
//                 onClick={handleFinish} 
//                 disabled={!isStarted || isPaused}
//             >
//                 Finish
//             </button>
//         </div>
//     );
// }

// export default ButtonFlow;


import React, { useState, useEffect } from 'react';

function ButtonFlow() {
    const [isStarted, setIsStarted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [timer, setTimer] = useState(0);
    const [intervalId, setIntervalId] = useState(null);

    const handleStart = () => {
        setIsStarted(true);
        setIsPaused(false);
        setIsFinished(false);

        // Start the timer
        const id = setInterval(() => {
            setTimer(prevTime => prevTime + 1);
        }, 1000); // Increment timer every second
        setIntervalId(id);
    };

    const handlePauseResume = () => {
        setIsPaused(!isPaused);

        if (!isPaused) {
            clearInterval(intervalId); // Pause the timer
        } else {
            // Resume the timer
            const id = setInterval(() => {
                setTimer(prevTime => prevTime + 1);
            }, 1000);
            setIntervalId(id);
        }
    };

    const handleFinish = () => {
        setIsFinished(true);
        setIsStarted(false);
        setIsPaused(false);
        clearInterval(intervalId); // Stop the timer
    };

    useEffect(() => {
        return () => clearInterval(intervalId); // Clear interval on component unmount
    }, [intervalId]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };

    return (
        <div>
            <button 
                onClick={handleStart} 
                disabled={isStarted || isFinished}
            >
                Start
            </button>
            
            <button 
                onClick={handlePauseResume} 
                disabled={!isStarted || isFinished}
            >
                {isPaused ? "Resume" : "Pause"}
            </button>
            
            <button 
                onClick={handleFinish} 
                disabled={!isStarted || isPaused}
            >
                Finish
            </button>

            {isFinished && <p>Time Elapsed: {formatTime(timer)}</p>}
        </div>
    );
}

export default ButtonFlow;
