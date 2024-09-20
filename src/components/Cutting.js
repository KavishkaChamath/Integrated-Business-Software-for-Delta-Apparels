// import React, { useEffect, useState } from 'react';
// import { ref, onValue } from 'firebase/database';
// import { database } from '../Firebase';// Make sure to import your Firebase configuration
// import './Orderdetails.css'; 


// const CuttingDetailsForm = () => {
//   const [orders, setOrders] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [showActions, setShowActions] = useState(false);


//   useEffect(() => {
//     const orderRef = ref(database, 'orders');
//     onValue(orderRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const orderList = Object.keys(data).map((key) => ({
//           id: key,
//           ...data[key],
//         }));
//         // Sort orders by date in descending order (newest first)
//         const sortedOrders = orderList.sort((a, b) => new Date(b.psd) - new Date(a.psd));
//         setOrders(sortedOrders);

//       }
//     });
//   }, []);

//   const handleSearch = () => {
//     if (searchTerm.trim() === '') {
//       // Sort orders by date in descending order (newest first)
//       const sortedOrders = [...orders].sort((a, b) => new Date(b.psd) - new Date(a.psd));
//       setFilteredOrders(sortedOrders); // Show all orders if search term is empty
//       setShowActions(false); // Hide actions column
//     } else {
//       const filtered = orders.filter(order =>
//         order.orderNumber.includes(searchTerm) || 
//         order.customer.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       // Sort filtered results by date in descending order (newest first)
//       const sortedFiltered = filtered.sort((a, b) => new Date(b.psd) - new Date(a.psd));
//       setFilteredOrders(sortedFiltered);
//       setShowActions(sortedFiltered.length > 0); // Show actions column only if there are matching results
//     }
//   };

//   return (
//     <div>
//      <div>
//         <input
//           type="text"
//           placeholder="Search by Order Number or Customer Name"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <button onClick={handleSearch}>Search</button>
//       </div>
//     </div>
//   );
// };

// export default CuttingDetailsForm;

import React, { useEffect, useState } from 'react';
import { ref, onValue,set,get } from 'firebase/database';
import { database } from '../Firebase'; // Make sure to import your Firebase configuration
import './Orderdetails.css';
import Titlepic from '../components/Titlepic'

const CuttingDetailsForm = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showActions, setShowActions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [noMatchFound, setNoMatchFound] = useState(false);

  // States to manage inputs for the new columns
  const [cutNumbers, setCutNumbers] = useState({});
  const [noOfPieces, setNoOfPieces] = useState({});
  const [ratios, setRatios] = useState({});
  const [cutQuantities, setCutQuantities] = useState({});


  useEffect(() => {
    const orderRef = ref(database, 'orders');
    onValue(orderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        // Sort orders by date in descending order (newest first)
        const sortedOrders = orderList.sort((a, b) => new Date(b.psd) - new Date(a.psd));
        setOrders(sortedOrders);
      }
    });
  }, []);

    // Clear previous results whenever the search term changes
    useEffect(() => {
      setFilteredOrders([]);
      setShowResults(false);
      setNoMatchFound(false);
    }, [searchTerm]);

  const handleSearch = () => {

    if (searchTerm.trim() === '') {
      alert('Please enter an Order Number or Customer Name to search.');
      return;
    }

    const filtered = orders.filter(order =>
      order.orderNumber.includes(searchTerm) || 
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0) {
      setNoMatchFound(true); // Show "No order with that order number" message
      setFilteredOrders([]); // Clear filtered orders
    } else {
      setFilteredOrders(filtered); // Update the filtered orders
      setShowResults(true); // Show the results table
      setNoMatchFound(false); // Ensure the no match message is hidden
    }
  };

  const handleInputChange = (e, orderId, field, setter) => {
    const value = e.target.value;
    setter(prevState => ({
      ...prevState,
      [orderId]: value,
    }));
  };

  // Calculate cut quantity when no of pieces or ratio changes
  useEffect(() => {
    const newCutQuantities = {};

    filteredOrders.forEach(order => {
      const pieces = parseFloat(noOfPieces[order.id] || 0);
      const ratio = parseFloat(ratios[order.id] || 0);
      newCutQuantities[order.id] = pieces * ratio; // Calculate cut quantity
    });

    setCutQuantities(newCutQuantities); // Update the cut quantities
  }, [noOfPieces, ratios, filteredOrders]); // Dependencies

  const sanitizeKey = (key) => {
    if (!key || typeof key !== 'string') return 'default';
    return key.replace(/[.#$/\[\]]/g, '_'); // Replace invalid characters with underscores
  };
  
  // const handleSave = () => {
  //   filteredOrders.forEach(order => {
  //     const sizeKey = sanitizeKey(order.size);
  //     const cutNumberKey = sanitizeKey(cutNumbers[order.id] || '');
  
  //     if (!sizeKey) {
  //       console.warn(`Invalid size for order ${order.orderNumber}. Skipping save.`);
  //       return;
  //     }
  
  //     // Only proceed if cutNumberKey and other fields are valid
  //     if (cutNumberKey && noOfPieces[order.id] && ratios[order.id]) {
  //       // Reference to the Firebase path for the current size
  //       const cuttingDetailsRef = ref(database, `Cuttingdetails/${order.orderNumber}/${sizeKey}`);
  
  //       // Fetch the existing data
  //       get(cuttingDetailsRef)
  //         .then((snapshot) => {
  //           const existingData = snapshot.val() || {};
  
  //           // Prepare new data to be added
  //           const newCutNumberData = {
  //             noOfPieces: noOfPieces[order.id] || '',
  //             ratio: ratios[order.id] || '',
  //           };
  
  //           // Merge existing data with new cut number data
  //           const updatedData = {
  //             ...existingData,
  //             [cutNumberKey]: newCutNumberData,
  //           };
  
  //           // Save the merged data back to Firebase
  //           return set(cuttingDetailsRef, updatedData);
  //         })
  //         .then(() => {
  //           alert(`Data for order ${order.orderNumber} saved successfully.`);
  //           setCutNumbers('');
  //           setCutQuantities('0');
  //           setNoOfPieces('');
  //           setRatios('');
  //         })
  //         .catch((error) => {
  //           console.error('Error saving data:', error);
  //         });
  //     } else {
  //       console.warn(`Skipping save for order ${order.orderNumber} due to missing cut number or data.`);
  //     }
  //   });
  // };
  
  // const handleSave = () => {
  //   filteredOrders.forEach(order => {
  //     const sizeKey = sanitizeKey(order.size);
  //     const cutNumberKey = sanitizeKey(cutNumbers[order.id] || '');
  
  //     if (!sizeKey) {
  //       console.warn(`Invalid size for order ${order.orderNumber}. Skipping save.`);
  //       return;
  //     }
  
  //     // Only proceed if cutNumberKey and other fields are valid
  //     if (cutNumberKey && noOfPieces[order.id] && ratios[order.id]) {
  //       // Reference to the Firebase path for the current orderNumber and size
  //       const cuttingDetailsRef = ref(database, `Cuttingdetails/${order.orderNumber}/sizes/${sizeKey}`);
  
  //       // Fetch the existing data
  //       get(cuttingDetailsRef)
  //         .then((snapshot) => {
  //           const existingData = snapshot.val() || {};
  
  //           // Prepare new data to be added
  //           const newCutNumberData = {
  //             noOfPieces: noOfPieces[order.id] || '',
  //             ratio: ratios[order.id] || '',
  //           };
  
  //           // Merge existing data with new cut number data
  //           const updatedData = {
  //             ...existingData,
  //             [cutNumberKey]: newCutNumberData,
  //           };
  
  //           // Save the merged data back to Firebase
  //           return set(cuttingDetailsRef, updatedData);
  //         })
  //         .then(() => {
  //           alert(`Data for order ${order.orderNumber} saved successfully.`);
  //           setCutNumbers('');
  //            setCutQuantities('0');
  //            setNoOfPieces('');
  //            setRatios('');
  //         })
  //         .catch((error) => {
  //           console.error('Error saving data:', error);
  //         });
  //     } else {
  //       console.warn(`Skipping save for order ${order.orderNumber} due to missing cut number or data.`);
  //     }
  //   });
  // };

  const handleSave = () => {
    filteredOrders.forEach(order => {
      const sizeKey = sanitizeKey(order.size);
      const cutNumberKey = sanitizeKey(cutNumbers[order.id] || '');
      const productionPoKey = sanitizeKey(order.productionPO); // Assuming you have a productionPO in your order object
      const italyPoKey = sanitizeKey(order.italyPO); // Assuming you have italyPo in your order object
      console.log("italyPoKey:", italyPoKey);
      if (!sizeKey) {
        console.warn(`Invalid size for order ${order.orderNumber}. Skipping save.`);
        return;
      }
  
      // Only proceed if cutNumberKey and other fields are valid
      if (cutNumberKey && noOfPieces[order.id] && ratios[order.id] && productionPoKey && italyPoKey) {
        // Reference to the Firebase path for the current orderNumber, productionPO, and cutNumber
        const cuttingDetailsRef = ref(database, `Cuttingdetails/${order.orderNumber}/productionPOs/${productionPoKey}`);
  
        // Prepare new data to be added for the italyPo and cut numbers
        const newProductionPoData = {
          italyPo: italyPoKey, // Save the italyPo under each productionPO
          cutNumbers: {
            [cutNumberKey]: {
              noOfPieces: noOfPieces[order.id] || '',
              size: sizeKey, // Saving the size for this cut
              ratio: ratios[order.id] || ''
            }
          }
        };
  
        // Fetch existing productionPO data to merge cut numbers
        get(cuttingDetailsRef)
          .then((snapshot) => {
            const existingData = snapshot.val() || {};
            
            // Merge existing cutNumbers with the new data
            const updatedData = {
              ...existingData,
              italyPo: italyPoKey, // Ensure italyPo is always updated
              cutNumbers: {
                ...existingData.cutNumbers,  // Merge existing cut numbers
                ...newProductionPoData.cutNumbers // Add new cut number data
              }
            };
  
            // Save the merged data back to Firebase
            return set(cuttingDetailsRef, updatedData);
          })
          .then(() => {
            alert(`Data for order ${order.orderNumber}, productionPO ${productionPoKey}, cutNumber ${cutNumberKey} saved successfully.`);
            // Reset state fields after successful save
            setCutNumbers('');
            setCutQuantities('0');
            setNoOfPieces('');
            setRatios('');
          })
          .catch((error) => {
            console.error('Error saving data:', error);
          });
      } else {
        console.warn(`Skipping save for order ${order.orderNumber} due to missing cut number, productionPO, or other required data.`);
      }
    });
  };
  
  
  const saveBundle = () => {
    filteredOrders.forEach(order => {
      const sizeKey = sanitizeKey(order.size); // Sanitize size key
      const cutNumberKey = sanitizeKey(cutNumbers[order.id] || ''); // Get and sanitize the cut number
      const ratio = ratios[order.id]; // Get the ratio for the order
      const pieces = noOfPieces[order.id]; // Get the number of pieces for the order
      const productionPoKey = sanitizeKey(order.productionPO); // Assuming you have a productionPO in your order object
      const italyPoKey = sanitizeKey(order.italyPO); 
  
      // Only proceed if sizeKey, cutNumberKey, ratio, and pieces are valid
      if (!sizeKey || !cutNumberKey || !ratio || !pieces) {
        console.warn(`Skipping bundle save for order ${order.orderNumber} due to missing data.`);
        return;
      }
  
      const numBundles = parseInt(ratio, 10); // The number of bundles to create
      const bundleStoreRef = ref(database, `BundleStore/${order.orderNumber}/${cutNumberKey}/sizes/${sizeKey}/bundles`);
  
      // Fetch existing bundles (optional if you want to merge)
      get(bundleStoreRef)
        .then((snapshot) => {
          const existingData = snapshot.val() || {}; // Get existing data or empty object
  
          const newBundles = {};
  
          // Generate unique bundles based on the ratio
          for (let i = 1; i <= numBundles; i++) {
           // const bundleId = `bundle_${Date.now()}_${i}`; // Create a unique bundle ID
           const bundleId = `bundle_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

            newBundles[bundleId] = {
              noOfPieces: pieces, // You can modify this logic if needed for each bundle
              ratio: ratio,       // Store the ratio in each bundle
              productionPo:productionPoKey ,
              italyPo: italyPoKey,
            };
          }
  
          // Merge new bundles with existing data
          const updatedData = {
            ...existingData,
            ...newBundles,
          };
  
          // Save the new bundle data back to Firebase
          return set(bundleStoreRef, updatedData);
        })
        .then(() => {
          alert(`Bundle data for order ${order.orderNumber} saved successfully.`);
          setCutNumbers(''); // Reset states as needed
          setNoOfPieces('');
          setRatios('');
        })
        .catch((error) => {
          console.error('Error saving bundle data:', error);
        });
    });
  };
  
  const saveData= () => {
    handleSave();
    saveBundle();
  }
  
  

  return (
    <div>
      <Titlepic/>
      <div>
        <input
          type="text"
          placeholder="Search by Order Number or Customer Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          required
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      
      {noMatchFound && (
        <p>No order with that order number.</p> // Display no match message
      )}

      {showResults && (
        <div>
          <table>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Size</th>
                <th>Style</th>
                <th>Color</th>
                <th>Color Code</th>
                <th>Production PO</th>
                <th>Italy PO</th>
                <th>Cut No</th>
                <th>No of Pieces</th>
                <th>Ratio</th>
                <th>Cut Quantity</th>
                {showActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.size}</td>
                  <td>{order.styleNumber}</td>
                  <td>{order.colour}</td>
                  <td>{order.colourCode}</td>
                  <td>{order.productionPO}</td>
                  <td>{order.italyPO}</td>
                  <td>
                    <input
                      type="text"
                      value={cutNumbers[order.id] || ''}
                      onChange={(e) => handleInputChange(e, order.id, 'cutNumbers', setCutNumbers)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={noOfPieces[order.id] || ''}
                      onChange={(e) => handleInputChange(e, order.id, 'noOfPieces', setNoOfPieces)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={ratios[order.id] || ''}
                      onChange={(e) => handleInputChange(e, order.id, 'ratios', setRatios)}
                    />
                  </td>
                  <td>
                    {cutQuantities[order.id] || 0} {/* Display calculated cut quantity */}
                  </td>
                  {showActions && (
                    <td>
                      {/* Add your action buttons here */}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {/* Save Button */}
          <button onClick={saveData} className="save-button">
            Create Bunndle
          </button>
        </div>
      )}
    </div>
  );
};

export default CuttingDetailsForm;



