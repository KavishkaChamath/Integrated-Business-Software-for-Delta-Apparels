// import React, { useState } from 'react';
// import { database } from '../Firebase';
// import { ref, runTransaction, get } from 'firebase/database';

// function IncrementButton({ orderNumber }) {
//     const incrementQuality = async () => {
//         if (!orderNumber) {
//             console.error('Order ID is required');
//             return;
//         }

//         const qualityRef = ref(database, `Line 1/${orderNumber}/1stQuality`);
//         const orderRef = ref(database, `Line 1/${orderNumber}`);
        

//         // try {
//         //     // Check if the orderNumber exists
//         //     const snapshot = await get(orderRef);
//         //     if (!snapshot.exists()) {
//         //         alert('There is no order ID in Line 1');
//         //         return;
//         //     }

//         //     // Increment the 1stQuality value
//         //     await runTransaction(qualityRef, (currentValue) => {
//         //         return (currentValue || 0) + 1;
//         //     });

//         //     console.log('1st Quality successfully incremented');
//         // } catch (error) {
//         //     console.error('Error incrementing 1st Quality:', error);
//         // }
//         try {
//             // Check if the orderNumber exists
//             const snapshot = await get(orderRef);
//             console.log('Snapshot exists:', snapshot.exists());
//             if (!snapshot.exists()) {
//                 alert('There is no order ID in Line 1');
//                 return;
//             }

//             // Increment the 1stQuality value
//             await runTransaction(qualityRef, (currentValue) => {
//                 return (currentValue || 0) + 1;
//             });

//             console.log('1st Quality successfully incremented');
//         } catch (error) {
//             console.error('Error incrementing 1st Quality:', error);
//         }
//     };

// function IncrementButton({ orderNumber }) {
//     const incrementQuality = async () => {
//         if (!orderNumber) {
//             console.error('Order ID is required');
//             return;
//         }
//         console.log(orderNumber);

//         const qualityRef = ref(database, `Line 1/${orderNumber}/1stQuality`);
//         const orderRef = ref(database, `Line 1/${orderNumber}`);
        

//         try {
//             // Check if the orderNumber exists
//             const snapshot = await get(qualityRef);
//             const existsData = snapshot.val();
//             if (!existsData) {
//                 alert('There is no order ID in Line 1');
//                 return;
//             }

//             // Increment the 1stQuality value
//             await runTransaction(qualityRef, (currentValue) => {
//                 return (currentValue || 0) + 1;
//             });

//             console.log('1st Quality successfully incremented');
//         } catch (error) {
//             console.error('Error incrementing 1st Quality:', error);
//         }
//     };

//     return (
//         <button onClick={incrementQuality}>+1</button>
//     );
// }

// function OrderQualityIncrementor() {
//     const [orderNumber, setorderNumber] = useState('');

//     return (
//         <div>
//             <input 
//                 type="text" 
//                 placeholder="Enter Order ID" 
//                 value={orderNumber} 
//                 onChange={(e) => setorderNumber(e.target.value)} 
//             />
//             <IncrementButton orderNumber={orderNumber} />
//         </div>
//     );
// }

// export default OrderQualityIncrementor;

// import React, { useState, useEffect } from 'react';
// import { database } from '../Firebase';
// import { ref, get, query, equalTo, orderByChild } from 'firebase/database';

// function App() {
//   const [orderNumber, setorderNumber] = useState('');
//   const [order, setOrder] = useState({});

//   useEffect(() => {
//     if (orderNumber !== '') {
//       const ordersRef = ref(database, 'orders');
//       const queryRef = query(ordersRef, orderByChild('order'), equalTo(orderNumber));
//       get(queryRef).then((snapshot) => {
//         if (snapshot.exists()) {
//           const orderData = snapshot.val();
//           const orderKey = Object.keys(orderData)[0];
//           setOrder(orderData[orderKey]);
//         } else {
//           console.log("No order found with orderNumber:", orderNumber);
//           setOrder({}); // reset order state when no order is found
//         }
//       }).catch((error) => {
//         console.error(error);
//       });
//     }
//   }, [orderNumber]);

//   const handleorderNumberChange = (event) => {
//     setorderNumber(event.target.value);
//   };

//   const handleSearch = () => {
//     // do nothing, useEffect will handle the search when orderNumber changes
//   };

//   return (
//     <div>
//       <h2>Order Details</h2>
//       <input type="text" value={orderNumber} onChange={handleorderNumberChange} placeholder="Enter Order ID" />
//       <button onClick={handleSearch}>Search</button>
//       {Object.keys(order).length > 0 && (
//         <div>
//           <p>Colour: {order.colour}</p>
//           <p>Colour Code: {order.colourCode}</p>
//           <p>Customer: {order.customer}</p>
//           <p>Italy PO: {order.ithalyPO}</p>
//           <p>Order Category: {order.orderCategory}</p>
//           <p>Order ID: {order.orderNumber}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;


//meka weda 
// import React, { useState } from 'react';
// import { database } from '../Firebase';
// import { ref, query, orderByChild, equalTo, get } from "firebase/database";

// function CheckOrder() {
//   const [orderNumber, setOrderNumber] = useState('');
//   const [orderData, setOrderData] = useState(null);

//   const handleInputChange = (e) => {
//     setOrderNumber(e.target.value);
//   };

//   const handleCheckOrder = () => {
//     const orderRef = ref(database, 'orders');
//     const orderQuery = query(orderRef, orderByChild('orderNumber'), equalTo(orderNumber));

//     get(orderQuery)
//       .then((snapshot) => {
//         if (snapshot.exists()) {
//           let order = null;
//           snapshot.forEach(childSnapshot => {
//             order = childSnapshot.val();
//           });
//           console.log('Order data retrieved:', order);
//           setOrderData(order);
//           alert('Order found: ' + order.orderNumber);
          
//           // Perform additional actions here if needed
//         } else {
//           console.error('No order data found');
//           setOrderData(null);
//           alert('No order found with this order number.');
//         }
//       })
//       .catch((error) => {
//         console.error('Error fetching order data:', error);
//         alert('Error fetching order data.');
//       });
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         value={orderNumber}
//         onChange={handleInputChange}
//         placeholder="Enter order number"
//       />
//       <button onClick={handleCheckOrder}>Check Order</button>

//       {orderData && (
//         <div>
//           <h3>Order Details:</h3>
//           <p>Order Number: {orderData.orderNumber}</p>
//           {/* Display other order details as needed */}
//         </div>
//       )}
//     </div>
//   );
// }

// export default CheckOrder;

//mukuth karanna epa
// import React, { useState } from 'react';
// import { database } from '../Firebase';
// import { ref, query, orderByChild, equalTo, get, update } from "firebase/database";

// function UpdateFirstQuality() {
//   const [orderNumber, setOrderNumber] = useState('');

//   const handleInputChange = (e) => {
//     setOrderNumber(e.target.value);
//   };

//   const handleUpdateFirstQuality = () => {
//     const orderRef = ref(database, 'orders');
//     const orderQuery = query(orderRef, orderByChild('orderNumber'), equalTo(orderNumber));

//     get(orderQuery)
//       .then((snapshot) => {
//         if (snapshot.exists()) {
//           let orderKey = null;
//           let currentFirstQuality = 0;
//           snapshot.forEach(childSnapshot => {
//             orderKey = childSnapshot.key; // Get the key of the order
//             currentFirstQuality = childSnapshot.val()['1stQuality'] || 0; // Retrieve current 1stQuality value, default to 0 if not present
//           });

//           // Increment the 1stQuality value by 2
//           const newFirstQuality = currentFirstQuality + 1;

//           // Update the 1stQuality value in Firebase
//           const orderUpdateRef = ref(database, `orders/${orderKey}`);
//           update(orderUpdateRef, { '1stQuality': newFirstQuality })
//             .then(() => {
//               alert(`1stQuality value updated to ${newFirstQuality}`);
//             })
//             .catch((error) => {
//               console.error('Error updating 1stQuality value:', error);
//               alert('Error updating 1stQuality value.');
//             });

//         } else {
//           console.error('No order data found');
//           alert('No order found with this order number.');
//         }
//       })
//       .catch((error) => {
//         console.error('Error fetching order data:', error);
//         alert('Error fetching order data.');
//       });
//   };

//   const handleUpdateFirstQualityBy3 = () => {
//     const orderRef = ref(database, 'orders');
//     const orderQuery = query(orderRef, orderByChild('orderNumber'), equalTo(orderNumber));

//     get(orderQuery)
//       .then((snapshot) => {
//         if (snapshot.exists()) {
//           let orderKey = null;
//           let currentFirstQuality = 0;
//           snapshot.forEach(childSnapshot => {
//             orderKey = childSnapshot.key; // Get the key of the order
//             currentFirstQuality = childSnapshot.val()['1stQuality'] || 0; // Retrieve current 1stQuality value, default to 0 if not present
//           });

//           // Increment the 1stQuality value by 2
//           const newFirstQuality = currentFirstQuality + 3;

//           // Update the 1stQuality value in Firebase
//           const orderUpdateRef = ref(database, `orders/${orderKey}`);
//           update(orderUpdateRef, { '1stQuality': newFirstQuality })
//             .then(() => {
//               alert(`1stQuality value updated to ${newFirstQuality}`);
//             })
//             .catch((error) => {
//               console.error('Error updating 1stQuality value:', error);
//               alert('Error updating 1stQuality value.');
//             });

//         } else {
//           console.error('No order data found');
//           alert('No order found with this order number.');
//         }
//       })
//       .catch((error) => {
//         console.error('Error fetching order data:', error);
//         alert('Error fetching order data.');
//       });
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         value={orderNumber}
//         onChange={handleInputChange}
//         placeholder="Enter order number"
//       />
//       <button onClick={handleUpdateFirstQuality}>1stQuality +1</button>
//       <button onClick={handleUpdateFirstQualityBy3}>1stQuality +3</button>
//     </div>
//   );
// }

// export default UpdateFirstQuality;


// import React, { useState } from 'react';
// import { database } from '../Firebase';
// import { ref, query, orderByChild, equalTo, get, update } from "firebase/database";

// function UpdateFirstQualityLine1() {
//   const [orderId, setOrderId] = useState('');

//   const handleInputChange = (e) => {
//     setOrderId(e.target.value);
//   };

//   const handleUpdateFirstQuality = () => {
//     const line1Ref = ref(database, 'Line 1');
//     const orderQuery = query(line1Ref, orderByChild('orderId'), equalTo(orderId));

//     get(orderQuery)
//       .then((snapshot) => {
//         if (snapshot.exists()) {
//           let orderKey = null;
//           let currentFirstQuality = 0;
//           snapshot.forEach(childSnapshot => {
//             orderKey = childSnapshot.key; // Get the key of the order
//             currentFirstQuality = childSnapshot.val()['1stQuality'] || 0; // Retrieve current 1stQuality value, default to 0 if not present
//           });

//           // Increment the 1stQuality value by 2
//           const newFirstQuality = currentFirstQuality + 1;

//           // Update the 1stQuality value in Firebase
//           const orderUpdateRef = ref(database, `Line 1/${orderKey}`);
//           update(orderUpdateRef, { '1stQuality': newFirstQuality })
//             .then(() => {
//               alert(`1stQuality value updated to ${newFirstQuality}`);
//             })
//             .catch((error) => {
//               console.error('Error updating 1stQuality value:', error);
//               alert('Error updating 1stQuality value.');
//             });

//         } else {
//           console.error('No order data found');
//           alert('No order found with this orderId.');
//         }
//       })
//       .catch((error) => {
//         console.error('Error fetching order data:', error);
//         alert('Error fetching order data.');
//       });
//   };

//   const handleUpdateFirstQualityBy3 = () => {
//     const line1Ref = ref(database, 'Line 1');
//     const orderQuery = query(line1Ref, orderByChild('orderId'), equalTo(orderId));

//     get(orderQuery)
//       .then((snapshot) => {
//         if (snapshot.exists()) {
//           let orderKey = null;
//           let currentFirstQuality = 0;
//           snapshot.forEach(childSnapshot => {
//             orderKey = childSnapshot.key; // Get the key of the order
//             currentFirstQuality = childSnapshot.val()['1stQuality'] || 0; // Retrieve current 1stQuality value, default to 0 if not present
//           });

//           // Increment the 1stQuality value by 2
//           const newFirstQuality = currentFirstQuality + 3;

//           // Update the 1stQuality value in Firebase
//           const orderUpdateRef = ref(database, `Line 1/${orderKey}`);
//           update(orderUpdateRef, { '1stQuality': newFirstQuality })
//             .then(() => {
//               alert(`1stQuality value updated to ${newFirstQuality}`);
//             })
//             .catch((error) => {
//               console.error('Error updating 1stQuality value:', error);
//               alert('Error updating 1stQuality value.');
//             });

//         } else {
//           console.error('No order data found');
//           alert('No order found with this orderId.');
//         }
//       })
//       .catch((error) => {
//         console.error('Error fetching order data:', error);
//         alert('Error fetching order data.');
//       });
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         value={orderId}
//         onChange={handleInputChange}
//         placeholder="Enter orderId"
//       />
//       <button onClick={handleUpdateFirstQuality}>1stQuality +1</button>
//       <button onClick={handleUpdateFirstQualityBy3}>1stQuality +3</button>
//     </div>
//   );
// }

// export default UpdateFirstQualityLine1;

//okkoma hariyat weda order id witari
// import React, { useState } from 'react';
// import { database } from '../Firebase';
// import { ref, query, orderByChild, equalTo, get, update } from "firebase/database";

// function UpdateFirstQuality() {
//   const [orderId, setOrderId] = useState('');
//   const [selectedLine, setSelectedLine] = useState('Line 1');

//   const handleInputChange = (e) => {
//     setOrderId(e.target.value);
//   };

//   const handleLineChange = (e) => {
//     setSelectedLine(e.target.value);
//   };

//   const handleUpdateFirstQuality = (increment) => {
//     const lineRef = ref(database, selectedLine);
//     const orderQuery = query(lineRef, orderByChild('orderId'), equalTo(orderId));

//     get(orderQuery)
//       .then((snapshot) => {
//         if (snapshot.exists()) {
//           let orderKey = null;
//           let currentFirstQuality = 0;
//           snapshot.forEach(childSnapshot => {
//             orderKey = childSnapshot.key; // Get the key of the order
//             currentFirstQuality = childSnapshot.val()['1stQuality'] || 0; // Retrieve current 1stQuality value, default to 0 if not present
//           });

//           // Increment the 1stQuality value
//           const newFirstQuality = currentFirstQuality + increment;

//           // Update the 1stQuality value in Firebase
//           const orderUpdateRef = ref(database, `${selectedLine}/${orderKey}`);
//           update(orderUpdateRef, { '1stQuality': newFirstQuality })
//             .then(() => {
//               alert(`1stQuality value updated to ${newFirstQuality}`);
//             })
//             .catch((error) => {
//               console.error('Error updating 1stQuality value:', error);
//               alert('Error updating 1stQuality value.');
//             });

//         } else {
//           console.error('No order data found');
//           alert('No order found with this orderId.');
//         }
//       })
//       .catch((error) => {
//         console.error('Error fetching order data:', error);
//         alert('Error fetching order data.');
//       });
//   };

//   return (
//     <div>
//       <select value={selectedLine} onChange={handleLineChange}>
//         <option value="Line 1">Line 1</option>
//         <option value="Line 2">Line 2</option>
//         <option value="Line 3">Line 3</option>
//         <option value="Line 4">Line 4</option>
//         <option value="Line 5">Line 5</option>
//         <option value="Line 6">Line 6</option>
//       </select>
      
//       <input
//         type="text"
//         value={orderId}
//         onChange={handleInputChange}
//         placeholder="Enter orderId"
//       />
      
//       <button onClick={() => handleUpdateFirstQuality(1)}>1stQuality +1</button>
//       <button onClick={() => handleUpdateFirstQuality(3)}>1stQuality +3</button>
//     </div>
//   );
// }

// export default UpdateFirstQuality;


import React, { useState } from 'react';
import { database } from '../Firebase';
import { ref, query, orderByChild, equalTo, get, update } from "firebase/database";

function UpdateFirstQuality() {
  const [orderId, setOrderId] = useState('');
  const [bundleId, setBundleId] = useState('');
  const [italyPo, setItalyPo] = useState('');
  const [selectedLine, setSelectedLine] = useState('Line 1');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'orderId') setOrderId(value);
    else if (name === 'bundleId') setBundleId(value);
    else if (name === 'italyPo') setItalyPo(value);
  };

  const handleLineChange = (e) => {
    setSelectedLine(e.target.value);
  };

  const handleUpdateFirstQuality = (increment) => {
    const lineRef = ref(database, selectedLine);
    const orderQuery = query(lineRef, orderByChild('orderId'), equalTo(orderId));

    get(orderQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          let orderKey = null;
          let currentFirstQuality = 0;
          let orderFound = false;
          
          snapshot.forEach(childSnapshot => {
            const orderData = childSnapshot.val();
            if (orderData.bundleId === bundleId && orderData.italyPo === italyPo) {
              orderKey = childSnapshot.key;
              currentFirstQuality = orderData['1stQuality'] || 0;
              orderFound = true;
            }
          });

          if (orderFound) {
            const newFirstQuality = currentFirstQuality + increment;
            const orderUpdateRef = ref(database, `${selectedLine}/${orderKey}`);
            update(orderUpdateRef, { '1stQuality': newFirstQuality })
              .then(() => {
                alert(`1stQuality value updated to ${newFirstQuality}`);
              })
              .catch((error) => {
                console.error('Error updating 1stQuality value:', error);
                alert('Error updating 1stQuality value.');
              });
          } else {
            alert('No matching order found with the given orderId, bundleId, and italyPo.');
          }
        } else {
          console.error('No order data found');
          alert('No order found with this orderId.');
        }
      })
      .catch((error) => {
        console.error('Error fetching order data:', error);
        alert('Error fetching order data.');
      });
  };

  return (
    <div>
      <select value={selectedLine} onChange={handleLineChange}>
        <option value="Line 1">Line 1</option>
        <option value="Line 2">Line 2</option>
        <option value="Line 3">Line 3</option>
        <option value="Line 4">Line 4</option>
        <option value="Line 5">Line 5</option>
        <option value="Line 6">Line 6</option>
      </select>
      
      <input 
        type="text"
        name="orderId"
        value={orderId}
        onChange={handleInputChange}
        placeholder="Enter orderId"
      />
      <input
        type="text"
        name="bundleId"
        value={bundleId}
        onChange={handleInputChange}
        placeholder="Enter bundleId"
      />
      <input
        type="text"
        name="italyPo"
        value={italyPo}
        onChange={handleInputChange}
        placeholder="Enter italyPo"
      />
      
      <button onClick={() => handleUpdateFirstQuality(1)}>1stQuality +1</button>
      <button onClick={() => handleUpdateFirstQuality(3)}>1stQuality +3</button>
    </div>
  );
}

export default UpdateFirstQuality;
