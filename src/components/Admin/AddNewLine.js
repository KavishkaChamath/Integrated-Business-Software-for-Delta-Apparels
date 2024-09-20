// import React, { useState } from 'react';
// import { database } from '../../Firebase';
// import { ref, push } from 'firebase/database';

// function AddNewLine() {
//     const [orderId, setOrderId] = useState('');
//     const [italyPo, setItalyPo] = useState('');
//     const [bundleId, setBundleId] = useState('');
//     const [quality, setQuality] = useState(0);
//     const [rejection, setRejection] = useState(0);
//     const [efficiency, setEfficiency] = useState(0);
//     const [incentive, setIncentive] = useState(0);
//     const [startDate, setStartDate] = useState('');
//     const [endDate, setEndDate] = useState('');

//     const handleSubmit = (e) => {
//         e.preventDefault();

//         // Define the new node data
//         const line1Data = {
//             orderId,
//             italyPo,
//             bundleId,
//             '1stQuality': quality,
//             Rejection: rejection,
//             Efficiency: efficiency,
//             Incentive: incentive,
//             startDate,
//             endDate,
//         };

//         // Push data to Firebase under 'Line 1' node
//         const line1Ref = ref(database, 'Line 1');
//         push(line1Ref, line1Data)
//             .then(() => {
//                 console.log('Data saved successfully!');
//                 // Optionally reset form fields
//                 setOrderId('');
//                 setItalyPo('');
//                 setBundleId('');
//                 setQuality(0);
//                 setRejection(0);
//                 setEfficiency(0);
//                 setIncentive(0);
//                 setStartDate('');
//                 setEndDate('');
//             })
//             .catch((error) => {
//                 console.error('Error saving data:', error);
//             });
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//             <input 
//                 type="text" 
//                 placeholder="Order ID" 
//                 value={orderId} 
//                 onChange={(e) => setOrderId(e.target.value)} 
//             />
//             <input 
//                 type="text" 
//                 placeholder="Italy PO" 
//                 value={italyPo} 
//                 onChange={(e) => setItalyPo(e.target.value)} 
//             />
//             <input 
//                 type="text" 
//                 placeholder="Bundle ID" 
//                 value={bundleId} 
//                 onChange={(e) => setBundleId(e.target.value)} 
//             />
//             <input 
//                 type="number" 
//                 placeholder="1st Quality" 
//                 value={quality} 
//                 onChange={(e) => setQuality(Number(e.target.value))} 
//             />
//             <input 
//                 type="number" 
//                 placeholder="Rejection" 
//                 value={rejection} 
//                 onChange={(e) => setRejection(Number(e.target.value))} 
//             />
//             <input 
//                 type="text" 
//                 placeholder="Efficiency" 
//                 value={efficiency} 
//                 onChange={(e) => setEfficiency((e.target.value))} 
//             />
//             <input 
//                 type="text" 
//                 placeholder="Incentive" 
//                 value={incentive} 
//                 onChange={(e) => setIncentive((e.target.value))} 
//             />
//             <input 
//                 type="date" 
//                 placeholder="Start Date" 
//                 value={startDate} 
//                 onChange={(e) => setStartDate(e.target.value)} 
//             />
//             <input 
//                 type="date" 
//                 placeholder="End Date" 
//                 value={endDate} 
//                 onChange={(e) => setEndDate(e.target.value)} 
//             />
//             <button type="submit">Submit</button>
//         </form>
//     );
// }

// export default AddNewLine;

import React, { useState } from 'react';
import { database } from '../../Firebase';
import { ref, push } from 'firebase/database';

function AddNewLine() {
    const [orderId, setOrderId] = useState('');
    const [italyPo, setItalyPo] = useState('');
    const [bundleId, setBundleId] = useState('');
    const [quality, setQuality] = useState(0);
    const [rejection, setRejection] = useState(0);
    const [efficiency, setEfficiency] = useState('');
    const [incentive, setIncentive] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedLine, setSelectedLine] = useState('Line 1');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Define the new node data
        const lineData = {
            orderId,
            italyPo,
            bundleId,
            '1stQuality': quality,
            Rejection: rejection,
            Efficiency: efficiency,
            Incentive: incentive,
            startDate,
            endDate,
        };

        // Push data to Firebase under the selected line node
        const lineRef = ref(database, selectedLine);
        push(lineRef, lineData)
            .then(() => {
                console.log('Data saved successfully!');
                // Optionally reset form fields
                setOrderId('');
                setItalyPo('');
                setBundleId('');
                setQuality(0);
                setRejection(0);
                setEfficiency('');
                setIncentive('');
                setStartDate('');
                setEndDate('');
            })
            .catch((error) => {
                console.error('Error saving data:', error);
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}>
                <option value="Line 1">Line 1</option>
                <option value="Line 2">Line 2</option>
                <option value="Line 3">Line 3</option>
                <option value="Line 4">Line 4</option>
                <option value="Line 5">Line 5</option>
                <option value="Line 6">Line 6</option>
            </select>
            <input 
                type="text" 
                placeholder="Order ID" 
                value={orderId} 
                onChange={(e) => setOrderId(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Italy PO" 
                value={italyPo} 
                onChange={(e) => setItalyPo(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Bundle ID" 
                value={bundleId} 
                onChange={(e) => setBundleId(e.target.value)} 
            />
            <input 
                type="number" 
                placeholder="1st Quality" 
                value={quality} 
                onChange={(e) => setQuality(Number(e.target.value))} 
            />
            <input 
                type="number" 
                placeholder="Rejection" 
                value={rejection} 
                onChange={(e) => setRejection(Number(e.target.value))} 
            />
            <input 
                type="text" 
                placeholder="Efficiency" 
                value={efficiency} 
                onChange={(e) => setEfficiency(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Incentive" 
                value={incentive} 
                onChange={(e) => setIncentive(e.target.value)} 
            />
            <input 
                type="date" 
                placeholder="Start Date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
            />
            {/* <input 
                type="date" 
                placeholder="End Date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
            /> */}
            <button type="submit">Submit</button>
        </form>
    );
}

export default AddNewLine;
