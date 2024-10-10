import React, { useState, useEffect } from 'react';
import { ref, get, remove, set, query, orderByChild,equalTo } from 'firebase/database';
import { database } from '../Firebase'; // Ensure correct Firebase configuration import
import Titlepic from './Titlepic';
import SignOut from './SignOut';

const Bundle = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [cutNumber, setCutNumber] = useState('');
  const [bundles, setBundles] = useState([]);
  const [bundleLines, setBundleLines] = useState({}); // State to track line selection for each bundle
  const [tempBundleIdChanges, setTempBundleIdChanges] = useState({});

  const [cutNumbers, setCutNumbers] = useState([]); 
  const [noCutNumbers, setNoCutNumbers] = useState(false); 

  const loadBundles = (orderNumber, selectedCutNumber) => {
    if (!orderNumber || !selectedCutNumber) {
      alert('Please enter both Order Number and Cut Number.');
      return;
    }
  
    console.log(`Loading bundles for Order Number: ${orderNumber}, Cut Number: ${selectedCutNumber}`);
  
    const bundleStoreRef = ref(database, `BundleStore/${orderNumber}/${selectedCutNumber}/sizes`);
  
    get(bundleStoreRef)
      .then((snapshot) => {
        const sizeData = snapshot.val();
        console.log('Fetched size data:', sizeData);
  
        if (sizeData) {
          const bundlesArray = [];
  
          Object.entries(sizeData).forEach(([sizeKey, sizeDetails]) => {
            console.log(`Processing size: ${sizeKey}`);
            const bundles = sizeDetails.bundles || {};
            console.log('Bundles for size:', bundles);
  
            Object.entries(bundles).forEach(([bundleId, bundleDetails]) => {
              bundlesArray.push({
                bundleId,
                size: sizeKey,
                ...bundleDetails,
                orderNumber, // Include orderNumber and cutNumber for transfer
                cutNumber: selectedCutNumber // Use selectedCutNumber instead of state
              });
            });
  
          });
  
          console.log('Bundles array:', bundlesArray);
          setBundles(bundlesArray); // Update state with the fetched bundles
          // Initialize bundleLines with the bundleIds
          const initialBundleLines = bundlesArray.reduce((acc, bundle) => {
            acc[bundle.bundleId] = '';
            return acc;
          }, {});
          setBundleLines(initialBundleLines);
          // Check if there is at least one bundle and pass the first bundle's orderNumber
          if (bundlesArray.length > 0) {
            const firstBundle = bundlesArray[0]; // Get the first bundle from the array
            retrieveOrderData(firstBundle); // Pass the orderNumber of the first bundle
          } else {
            console.log('No bundles found.');
          }
        } else {
          alert(`No bundles found for order ${orderNumber} and cut number ${selectedCutNumber}.`);
        }
      })
      .catch((error) => {
        console.error('Error fetching bundles:', error);
      });
  };

  // const handleLoadBundles = () => {
  //   loadBundles(orderNumber, selectedCutNumber);
  // };

  
  const handleLineChange = (bundleId, newLine) => {
    setBundleLines(prevLines => ({
      ...prevLines,
      [bundleId]: newLine
    }));
  };

  const handleTransfer = (bundleId, line, bundleData) => {
    if (!bundleId || !line) {
      alert('Please provide both Bundle ID and Line.');
      return;
    }

    const newBundleId = tempBundleIdChanges[bundleId] || bundleId;
    //downloadBundleDataImage(bundleData)
      // Check if the checkbox for this bundle is selected
  if (selectedForDownload[bundleId]) {
    // Checkbox is selected
    console.log('Checkbox selected, downloading data...');
    
    downloadBundleDataImage(bundleData,newBundleId,orderDetails); // Download the data
  } else {
    // Checkbox is not selected
    console.log('Checkbox not selected, skipping download.');
  }
  transferToLine(bundleId, line, bundleData);
  };


  
  const transferToLine = async (bundleId, line, bundleData) => {
    if (!bundleId || !line) {
      alert('Please provide both Bundle ID and Line.');
      return;
    }
  
    // Find the new bundleId in the temp changes
    const newBundleId = tempBundleIdChanges[bundleId] || bundleId;
  
    // Check if the user entered a new bundleId
    if (!newBundleId || newBundleId === bundleId) {
      alert('Please enter a Bundle ID.');
      return; // Exit the function if no new bundleId is provided
    }
  
    try {
      // Reference to the specific line in the Inqueue node
      const lineRef = ref(database, `Inqueue/${line}`);
      
      // Query to check if the newBundleId exists under the specific line
      const bundleExistsQuery = query(lineRef, orderByChild('bundleId'), equalTo(newBundleId));
      
      const snapshot = await get(bundleExistsQuery);
      //console.log(snapshot.val())
      // Check if the bundle already exists under the specific line
      if (snapshot.exists()) {
          alert(`Bundle ID ${newBundleId} already exists in ${line}.`);
          return; // Exit the function if bundle already exists
      }
  
      // Proceed with transferring the bundle
      const bundleStoreRefOld = ref(database, `BundleStore/${bundleData.orderNumber}/${bundleData.cutNumber}/sizes/${bundleData.size}/bundles/${bundleId}`);
      const inQueueRef = ref(database, `Inqueue/${line}/${newBundleId}`);
  
      // Perform the deletion of the old bundle
      await remove(bundleStoreRefOld);
      console.log(`Old Bundle ID ${bundleId} removed from BundleStore.`);
  
      // Add the bundle with the new bundle ID to the Inqueue node
      await set(inQueueRef, {
        orderNumber: bundleData.orderNumber,
        size: bundleData.size,
        noOfPieces: bundleData.noOfPieces,
        italyPo: bundleData.italyPo,
        productionPo: bundleData.productionPo,
        bundleId: newBundleId // Ensure to store the new bundleId
      });
      console.log(`New Bundle ID ${newBundleId} added to Inqueue under ${line}.`);
  
      // Update local state by filtering out the transferred bundle
      setBundles((prevBundles) =>
        prevBundles.filter((bundle) => bundle.bundleId !== bundleId)
      );
  
      // Remove the old bundle ID from the temp changes
      setTempBundleIdChanges((prevChanges) => {
        const { [bundleId]: removed, ...rest } = prevChanges;
        return rest;
      });
  
    } catch (error) {
      console.error('Error during the transfer process:', error);
    }
  };
  
  const [selectedForDownload, setSelectedForDownload] = useState({});
  const displayBundlesInTable = (bundles) => (
    <div className='bundleTable'>
    <table border={1} align='center'>
    <thead>
      <tr>
        <th>Bundle ID</th>
        <th>Size</th>
        <th>No of Pieces</th>
        <th>Line</th>
        <th>Download Bundle</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {bundles.length > 0 ? (
        bundles.map((bundle) => (
          <tr key={bundle.bundleId}>
            <td>
              <input
                type="text"
                //value={tempBundleIdChanges[bundle.bundleId] || bundle.bundleId} // Reflect changes in temp bundle ID
                onChange={(e) => handleBundleIdChange(bundle.bundleId, e.target.value)}
              />
            </td>
            <td>{bundle.size}</td>
            <td>{bundle.noOfPieces}</td>
            <td>
              <select
                onChange={(e) => handleLineChange(bundle.bundleId, e.target.value)}
                value={bundleLines[bundle.bundleId] || ''} // Controlled select
              >
                <option value="">Select Line</option>
                {Array.from({ length: 12 }, (_, i) => `Line ${i + 1}`).map((line) => (
                  <option key={line} value={line}>
                    {line}
                  </option>
                ))}
              </select>
            </td>
            <td>
                  <input
                    type="checkbox"
                    checked={selectedForDownload[bundle.bundleId] || false}
                    onChange={() => handleCheckboxChange(bundle.bundleId)}
                  />
                </td>
            <td>
              <button
                onClick={() => handleTransfer(bundle.bundleId, bundleLines[bundle.bundleId], bundle)}
                disabled={!bundleLines[bundle.bundleId] || !bundle.bundleId} // Disable if no line selected
              >
                Transfer to Line
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5">No bundles available</td>
        </tr>
      )}
    </tbody>
  </table>
  </div>
  );
  
  const handleCheckboxChange = (bundleId) => {
    setSelectedForDownload((prevSelected) => ({
      ...prevSelected,
      [bundleId]: !prevSelected[bundleId] // Toggle the checkbox state
    }));
  };
  

  // Update temporary state with the new bundleId
  const handleBundleIdChange = (oldBundleId, newBundleId) => {
    setTempBundleIdChanges((prevChanges) => ({
      ...prevChanges,
      [oldBundleId]: newBundleId,
    }));
  };
    

    useEffect(() => {
      console.log("Updated bundles in the table:", bundles);
    }, [bundles]);
    

 // Function to fetch cut numbers from Firebase based on the order number
 const fetchCutNumbers = async (orderNumber) => {
  if (!orderNumber) return;

  const bundleStoreRef = ref(database, `BundleStore/${orderNumber}`);
  try {
    const snapshot = await get(bundleStoreRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const fetchedCutNumbers = Object.keys(data); // Assuming cut numbers are keys under orderNumber node

      if (fetchedCutNumbers.length > 0) {
        setCutNumbers(fetchedCutNumbers);
        setNoCutNumbers(false); // Reset the noCutNumbers flag
      } else {
        setNoCutNumbers(true); // No cut numbers found
      }
    } else {
      setNoCutNumbers(true); // No data found for this order number
      setCutNumbers([]); // Clear the state if no cut numbers found
    }
  } catch (error) {
    console.error('Error fetching cut numbers:', error);
    setNoCutNumbers(true); // Handle error case
  }
};

// Function to handle order number change and fetch corresponding cut numbers
const handleOrderNumberChange = (e) => {
  const value = e.target.value;
  setOrderNumber(value);
  fetchCutNumbers(value); // Fetch cut numbers when order number changes
};

// Function to handle cut number selection and automatically load bundles
const handleCutNumberChange = (e) => {
  const selectedCutNumber = e.target.value;
  setCutNumber(selectedCutNumber);

  if (selectedCutNumber) {
    loadBundles(orderNumber, selectedCutNumber); // Pass selectedCutNumber directly
    
  }
};

const downloadBundleDataImage = (bundleData,newBundleId,orderDetails) => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size (adjust dimensions as needed)
  canvas.width = 400;
  canvas.height = 300;

  // Fill canvas with white background
  ctx.fillStyle = '#ffffff';  // White background color
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set text properties
  ctx.fillStyle = '#000000';  // Black text color
  ctx.font = '16px Arial';

  // Display the bundle data on the canvas in black
  ctx.fillText(`Order Number: ${bundleData.orderNumber}`, 20, 50);
  ctx.fillText(`Size: ${bundleData.size}`, 20, 80);
  ctx.fillText(`No. of Pieces: ${bundleData.noOfPieces}`, 20, 110);
  ctx.fillText(`Italy PO: ${bundleData.italyPo}`, 20, 140);
  ctx.fillText(`Production PO: ${bundleData.productionPo}`, 20, 170);
  ctx.fillText(`Bundle ID: ${newBundleId}`, 20, 200);
  ctx.fillText(`Cut Number: ${cutNumber}`, 20, 230);

  ctx.fillText(`Colour: ${orderDetails.colour}`, 20, 260);
  ctx.fillText(`Style Number: ${orderDetails.styleNumber}`, 20, 290);
  // Convert canvas to data URL (base64 image)
  const imageURL = canvas.toDataURL('image/png');

  // Create a link element and trigger the download
  const downloadLink = document.createElement('a');
  downloadLink.href = imageURL;
  downloadLink.download = `Bundle-${newBundleId}.png`;
  downloadLink.click();
};

const [orderDetails, setOrderDetails] = useState({
  colour: '',
  styleNumber: ''
});

// Function to retrieve order details based on orderNumber, italyPo, and productionPo
const retrieveOrderData = async (bundleData) => {
  const { orderNumber, italyPo, productionPo } = bundleData;

  const orderRef = ref(database, 'orders');

  try {
    const snapshot = await get(orderRef);
    if (snapshot.exists()) {
      const ordersData = snapshot.val();
      // Loop through the orders to find the matching orderNumber
      for (const orderId in ordersData) {
        const order = ordersData[orderId];
        if (order.orderNumber === orderNumber &&
          order.italyPO === italyPo &&
          order.productionPO === productionPo) {
          // Order found, return the details
          // Order found, update the state with colour and styleNumber
          setOrderDetails({
            colour: order.colour || '',          // Set colour
            styleNumber: order.styleNumber || '' // Set styleNumber
          });

          console.log("Matching order found:", order);
          return; // Exit the loop once the order is found
        }
      }
      // If no matching order is found
      console.warn('No matching order found.');
      alert('No matching order found for the provided details.');
    } else {
      console.warn('No orders found in the database.');
    }
  } catch (error) {
    console.error('Error fetching order details:', error);
  }
};

  return (
    <div className='holder'>
      <Titlepic/>
      <SignOut/>
    <h2>Search Cutting Details</h2>
    <input
      type="text"
      placeholder="Enter Order Number to see available cut numbers"
      value={orderNumber}
      onChange={handleOrderNumberChange} // Fetch cut numbers on change
    />
    
    {/* Check if there are cut numbers available or display the no-cut-number message */}
    {noCutNumbers ? (
        <p>No available cut numbers for this order.</p> // Message if no cut numbers are found
      ) : cutNumbers.length > 0 ? (
        <select
          value={cutNumber}
          onChange={handleCutNumberChange} // Automatically load bundles on cut number change
        >
          <option value="">Select Cut Number</option>
          {cutNumbers.map((cutNum) => (
            <option key={cutNum} value={cutNum}>
              {cutNum}
            </option>
          ))}
        </select>
      ) : null} {/* Hide both the input and message initially */}

    {bundles.length > 0 && displayBundlesInTable(bundles)}
    <div>
    
    </div>
  </div>
  
  );
  
};

export default Bundle;
