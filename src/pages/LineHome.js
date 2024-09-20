import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SignOut from '../components/SignOut';
import Titlepic from '../components/Titlepic';
import { database } from '../Firebase'; // Adjust the import path as needed
import { ref, get, set,remove, onValue, serverTimestamp } from 'firebase/database';
import Modal from '../components/Line/Model';
import BreakTimeModal from '../components/Line/BreakTimeModel';
import RejectionModal from '../components/Line/PasswordModel';
import {  query, orderByChild, equalTo, update, runTransaction } from 'firebase/database';
import Timer from '../components/Line/Timer';

export default function LineHome() {
  const [orderNumber, setOrderNumber] = useState('');
  const [bundleId, setBundleId] = useState('');
   const [italyPo, setItalyPo] = useState('');
  // const[productionPO,serProductioPo]=useState('');
  const [firstQuality, setFirstQuality] = useState(0);

  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  // const location = useLocation();
  // const { selectedLine, orderNumber: prevOrderNumber, italyPo: prevItalyPo, bundleId: prevBundleId } = location.state || { selectedLine: 'Line 1' };

  const [id, setId] = useState('');
  const [employees, setEmployees] = useState([]);

  //const navigate = useNavigate();


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBreakTimeModalOpen, setIsBreakTimeModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


  const [selectedLine, setSelectedLine] = useState('');
  const navigate = useNavigate();
 
  
  // Function to get the current date and time in YYYY-MM-DD HH:MM:SS format
const getCurrentDateTime = () => {
  const today = new Date();

  // Get date components
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  // Get time components
  const hours = String(today.getHours()).padStart(2, '0');
  const minutes = String(today.getMinutes()).padStart(2, '0');
  const seconds = String(today.getSeconds()).padStart(2, '0');

  // Combine date and time
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());

  useEffect(() => {
    // Update the time every second
    const interval = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime());
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    retrievemembersData(selectedLine);
    retrieveTotalFirstQuality(selectedLine);
  }, [selectedLine]);

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


    const validateInputs = () => {
      return selectedBundle !== "" || (selectedIncompleteBundle !== "" || selectedBundle !== "");
    };

  const handleStart = async ()  => {
    setIsStarted(true);
    setIsPaused(false);
    setIsFinished(false);

    const id = setInterval(() => {
      setTimer(prevTime => prevTime + 1);
    }, 1000);
    setIntervalId(id);

    const currentDate = new Date().toISOString().split('T')[0];

    let inqueueRef;
    let operationsRef;
    if (selectedIncompleteBundle) {
      operationsRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
      inqueueRef = ref(database, `Inqueue/${selectedLine}/${selectedIncompleteBundle}`);
      retrieveFirstQuality(selectedLine);
      countQualities();
    } else if (selectedBundle) {
      operationsRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
      inqueueRef = ref(database, `Inqueue/${selectedLine}/${selectedBundle}`);
    } else {
      console.error("No valid selection made.");
      return;
    }
    const snapshot = await get(operationsRef);

    if (!snapshot.exists()) {
    const inqueueSnapshot = await get(inqueueRef);
    let noOfPieces = 0;
    let ItalyPo="";
    let ProductionPo="";
    let Size="";
      
    if (inqueueSnapshot.exists()) {
      const inqueueData = inqueueSnapshot.val();
      noOfPieces = inqueueData.noOfPieces || 0; // Retrieve noOfPieces from Inqueue, default to 0 if not found
      ItalyPo = inqueueData.italyPo || ''; // Retrieve italyPo from Inqueue, default to empty string if not found
      ProductionPo = inqueueData.productionPo || ''; 
      Size = inqueueData.size || '';
    } else {
      console.warn("Missing data in inqueue");
      return;
    }
  
    const newData = {
      lineNumber: selectedLine,
      orderId: orderData.orderNumber,
      bundleId: selectedBundle,
      italyPo: ItalyPo, // Use the retrieved italyPo
      productionPO: ProductionPo, // Use the retrieved productionPo
      size: Size,
      styleNumber: orderData.styleNumber,
      colour: orderData.colour,
      colourCode: orderData.colourCode,
      "1stQuality": 0,
      "2ndQuality": 0,
      "Rejection": 0,
      noOfPieces: noOfPieces, // Set noOfPieces from Inqueue
      startDate: serverTimestamp(),
      endDate: '',
      timer: 0,
    };
  

      set(operationsRef, newData)
      .then(() => {
        console.log('Data saved successfully to current operations node!');
       // remove(inqueueRef);
      })
      .catch((error) => {
          console.error('Error adding data:', error);
        });
      // Use a transaction to ensure atomicity
    // await runTransaction(inqueueRef, (currentData) => {
    //   if (currentData) {
    //     return null; // Delete data by returning null
    //   } else {
    //     return currentData; // No data to delete
    //   }
    // }).then(async () => {
    //   await set(operationsRef, newData);
    //   console.log('Data saved successfully to current operations node!');
    // }).catch((error) => {
    //   console.error('Error handling transaction:', error);
    // });
    }else{
      console.log("Starting incomplete order.")
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);

    if (!isPaused) {
      clearInterval(intervalId);
    } else {
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
    clearInterval(intervalId);

    setSelectedBundle("");          
    setSelectedIncompleteBundle(""); 
    setFirstQuality("");
    setPendingValue(null);
    setOrderData(null);
    setIncompleteBundleData(null);
   // const operationsRef = ref(database, `currentOperations/${orderNumber}`);


  };

  useEffect(() => {
    return () => {
      clearInterval(intervalId);
    };
  }, [intervalId]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

 
 
  
  const checkAndUpdateGuestMembers = (lineNumber, changeInGuestMembers, id) => {
    const employeesRef = ref(database, 'employees');
  
    // Query the database to see if there's an employee with the given ID
    const queryRef = query(employeesRef, orderByChild('employeeNumber'), equalTo(id));
  
    get(queryRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log('Employee found:', snapshot.val());
  
          // Create a reference to a temporary node to get the server timestamp
          const tempRef = ref(database, 'serverTime/temp');
  
          // Set the server timestamp temporarily to fetch it
          return set(tempRef, { timestamp: serverTimestamp() })
            .then(() => get(tempRef))
            .then((timestampSnapshot) => {
              if (timestampSnapshot.exists()) {
                const serverTimestampValue = timestampSnapshot.val().timestamp;
                const serverDate = new Date(serverTimestampValue);
  
                // Format the server date to 'YYYY-MM-DD'
                const currentDate = serverDate.toISOString().split('T')[0];
                const workingMembersRef = ref(database, `dailyUpdates/${currentDate}/${lineNumber}`);
  
                // Get the current data for the specific date and line
                return get(workingMembersRef)
                  .then((workingSnapshot) => {
                    let currentGuestMembers = 0;
  
                    if (workingSnapshot.exists()) {
                      const data = workingSnapshot.val();
                      currentGuestMembers = data.guestMembers || 0;
                    }
  
                    // Ensure both currentGuestMembers and changeInGuestMembers are numbers
                    if (isNaN(currentGuestMembers) || isNaN(changeInGuestMembers)) {
                      throw new Error('Invalid number provided for updating guest members.');
                    }
  
                    // Update the members count
                    const updatedGuestMembers = currentGuestMembers + changeInGuestMembers;
  
                    // Ensure the result is a valid number
                    if (isNaN(updatedGuestMembers)) {
                      throw new Error('The updated guest members count resulted in NaN.');
                    }
  
                    // Update the database with the new guestMembers count
                    return update(workingMembersRef, {
                      guestMembers: updatedGuestMembers,
                    });
                  })
                  .then(() => {
                    console.log(`Guest members count updated successfully for line: ${lineNumber} on date: ${currentDate}`);
                    alert("Employee added as a guest to the line");
                    setId(''); // Clear input after update
                  })
                  .catch((error) => {
                    console.error('Error updating guest members:', error);
                  })
                  .finally(() => {
                    // Clean up the temporary node
                    //console.log('Attempting to remove temporary server timestamp node.');
                    remove(tempRef).then(() => {
                      //console.log('Temporary server timestamp node removed successfully.');
                    }).catch((error) => {
                      console.error('Error removing temporary server timestamp node:', error);
                    });
                  });
              } else {
                console.error('Error fetching server timestamp.');
                alert('Error fetching server timestamp.');
                throw new Error('Server timestamp not found.');
              }
            })
            .catch((error) => {
              console.error('Error setting or fetching server timestamp:', error);
            });
        } else {
          console.log('No matching employee found for the provided ID.');
          alert('No matching employee found for the provided ID.');
        }
      })
      .catch((error) => {
        console.error('Error fetching employee data:', error);
      });
      // .finally(() => {
      //   console.log('Execution of checkAndUpdateGuestMembers function has completed.');
      // });
  };
  
  
  
  const updateWorkingMembers = (lineNumber, changeInHostMembers) => {
    const tempRef = ref(database, 'serverTime/temp');
  
    set(tempRef, { timestamp: serverTimestamp() })
      .then(() => {
        console.log('Server timestamp set successfully.');
        return get(tempRef);
      })
      .then((timestampSnapshot) => {
        if (timestampSnapshot.exists()) {
          const serverTimestampValue = timestampSnapshot.val().timestamp;
          const serverDate = new Date(serverTimestampValue);
  
          const currentDate = serverDate.toISOString().split('T')[0];
          const workingMembersRef = ref(database, `dailyUpdates/${currentDate}/${lineNumber}`);
  
          return get(workingMembersRef)
            .then((snapshot) => {
              let currentHostMembers = 0;
  
              if (snapshot.exists()) {
                const data = snapshot.val();
                currentHostMembers = data.hostMembers || 0;
              }
  
              if (isNaN(currentHostMembers) || isNaN(changeInHostMembers)) {
                throw new Error('Invalid number provided for updating host members.');
              }
  
              const updatedHostMembers = currentHostMembers + changeInHostMembers;
  
              if (isNaN(updatedHostMembers)) {
                throw new Error('The updated host members count resulted in NaN.');
              }
  
              return update(workingMembersRef, {
                hostMembers: updatedHostMembers,
              });
            })
            .then(() => {
              console.log(`Host members count updated successfully for line: ${lineNumber} on date: ${currentDate}`);
              alert("Member added to line as a host");
              setId(''); // Clear input after update
            })
            .catch((error) => {
              console.error('Error updating host members:', error);
            });
        } else {
          console.error('Error fetching server timestamp.');
          alert('Error fetching server timestamp.');
          throw new Error('Server timestamp not found.');
        }
      })
      .catch((error) => {
        console.error('Error setting or fetching server timestamp:', error);
      })
      .finally(() => {
        //console.log('Attempting to remove temporary server timestamp node.');
        remove(tempRef).then(() => {
         // console.log('Temporary server timestamp node removed successfully.');
        }).catch((error) => {
          console.error('Error removing temporary server timestamp node:', error);
        });
      });
  };
  
 

  //Assign employee part
  
  
  

  useEffect(() => {
    console.log('Selected Line:', selectedLine); // Debug: Log the selected line
  
    // Create a reference to the 'employee' node
    const employeeRef = ref(database, 'employees');
  
    // Create a query to get employees with the selected line allocation
    const employeeQuery = query(employeeRef, orderByChild('lineAllocation'), equalTo(selectedLine));
  
    // Fetch data
    get(employeeQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const employeeData = [];
          snapshot.forEach((childSnapshot) => {
            employeeData.push(childSnapshot.val());
          });
          console.log('Employee Data:', employeeData); // Debug: Log retrieved data
          setEmployees(employeeData);
        } else {
          console.log('No employees found for the selected line.');
        }
      })
      .catch((error) => {
        console.error('Error fetching employee data:', error);
      });
      // if (selectedLine) {
      //   retrieveAndSetDropdownOptions(selectedLine);
      // }
  }, [selectedLine]);


  const handleInputChange1 = (e) => {
    setId(e.target.value);
  };

  
  const handleAddToLine = () => {
    console.log('Order Number:', orderNumber);
console.log('Italy PO:', italyPo);
console.log('Bundle ID:', bundleId);

// Change the reference to point to the "currentOperations" node instead of the selected line
const operationsRef = ref(database, 'currentOperations');
  
    // Query to find the specific order that matches orderNumber, italyPo, and bundleId
    // Query to find the specific order that matches orderNumber, italyPo, and bundleId within "currentOperations"
    const orderQuery = query(
      operationsRef,
      orderByChild('orderId'),
      equalTo(orderNumber)
    );
  
    get(orderQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          let foundOrder = null;
  
          snapshot.forEach((childSnapshot) => {
            const orderData = childSnapshot.val();
            if (orderData.italyPo === italyPo && orderData.bundleId === bundleId) {
              foundOrder = childSnapshot;
            }
          });
  
          if (foundOrder) {
            const currentHostMembers = foundOrder.val().hostMembers || 0;
            const updatedHostMembers = currentHostMembers + 1;
  
            update(foundOrder.ref, { hostMembers: updatedHostMembers })
              .then(() => {
                console.log('Host members count updated successfully!');
               
                
              })
              .catch((error) => {
                console.error('Error updating host members count:', error);
              });
          } else {
            console.log('No matching order found for the specified details.');
          }
        } else {
          console.log('Selected line does not exist in the database.');
        }
      })
      .catch((error) => {
        console.error('Error fetching line data:', error);
      });
  };

  
  
  // const updateCurrentOperations = () => {

    
  //   const employeesRef = ref(database, 'employees');
  // console.log(id);
  //   // Query to check if the employee exists
  //   const employeeQuery = query(
  //     employeesRef,
  //     orderByChild('employeeNumber'),
  //     equalTo(id)
  //   );

  // get(employeeQuery)
  //   .then((employeeSnapshot) => {
  //     if (employeeSnapshot.exists()) {
  //       // Employee exists, proceed with updating the current operations
  //       const operationsRef = ref(database, 'currentOperations');
        
  //       // Query to find the specific order that matches orderNumber, italyPo, and bundleId
  //       const orderQuery = query(
  //         operationsRef,
  //         orderByChild('orderId'),
  //         equalTo(orderNumber)
  //       );
    
  //       get(orderQuery)
  //         .then((orderSnapshot) => {
  //           if (orderSnapshot.exists()) {
  //             let foundOrder = null;
    
  //             orderSnapshot.forEach((childSnapshot) => {
  //               const orderData = childSnapshot.val();
  //               if (orderData.italyPo === italyPo && orderData.bundleId === bundleId) {
  //                 foundOrder = childSnapshot;
  //               }
  //             });
    
  //             if (foundOrder) {
  //               const currentGuestMembers = foundOrder.val().guestMembers || 0;
  //               const updatedGuestMembers = currentGuestMembers + 1;
    
  //               update(foundOrder.ref, { guestMembers: updatedGuestMembers })
  //                 .then(() => {
  //                   console.log('Guest members count updated successfully!');
  //                   // Additional actions can be placed here if needed
  //                 })
  //                 .catch((error) => {
  //                   console.error('Error updating guest members count:', error);
  //                 });
  //             } else {
  //               console.log('No matching order found for the specified details.');
  //             }
  //           } else {
  //             console.log('Selected order does not exist in the database.');
  //           }
  //         })
  //         .catch((error) => {
  //           console.error('Error fetching order data:', error);
  //         });
  //     } else {
  //       console.log('No employee found with the given ID.');
  //     }
  //   })
  //   .catch((error) => {
  //     console.error('Error fetching employee data:', error);
  //   });
  // };
  
  const updateCurrentOperations = (orderNumber, italyPo, bundleId, id, selectedLine) => {
    const employeesRef = ref(database, 'employees');
  
    // Query to check if the employee exists
    const employeeQuery = query(
      employeesRef,
      orderByChild('employeeNumber'),
      equalTo(id)
    );
  
    get(employeeQuery)
      .then((employeeSnapshot) => {
        if (employeeSnapshot.exists()) {
          // Employee exists, now check line allocation
          const employeeData = employeeSnapshot.val();
          let lineAllocation = null;
  
          // Since snapshot may have multiple children, iterate over them to get the employee data
          employeeSnapshot.forEach((childSnapshot) => {
            lineAllocation = childSnapshot.val().lineAllocation;
          });
  
          const operationsRef = ref(database, 'currentOperations');
          // const orderQuery = query(
          //   operationsRef,
          //   orderByChild('orderId'),
          //   equalTo(orderNumber)
          // );
          const orderQuery = query(
            ref(database, `currentOperations/${orderData.orderNumber}/${selectedBundle}`)
          );
  
          get(orderQuery)
            .then((orderSnapshot) => {
              if (orderSnapshot.exists()) {
                let foundOrder = null;
  
                orderSnapshot.forEach((childSnapshot) => {
                  const orderData = childSnapshot.val();
                  if (orderData.italyPo === italyPo && orderData.bundleId === bundleId) {
                    foundOrder = childSnapshot;
                  }
                });
  
                if (foundOrder) {
                  if (lineAllocation === selectedLine) {
                    // Update hostMembers
                    const currentHostMembers = foundOrder.val().hostMembers || 0;
                    const updatedHostMembers = currentHostMembers + 1;
  
                    update(foundOrder.ref, { hostMembers: updatedHostMembers })
                      .then(() => {
                        console.log('Host members count updated successfully!');
                        updateWorkingMembers(selectedLine,1);
                      })
                      .catch((error) => {
                        console.error('Error updating host members count:', error);
                      });
                  } else {
                    // Update guestMembers
                    const currentGuestMembers = foundOrder.val().guestMembers || 0;
                    const updatedGuestMembers = currentGuestMembers + 1;
  
                    update(foundOrder.ref, { guestMembers: updatedGuestMembers })
                      .then(() => {
                        console.log('Guest members count updated successfully!');
                        checkAndUpdateGuestMembers(selectedLine,1,id);
                      })
                      .catch((error) => {
                        console.error('Error updating guest members count:', error);
                      });
                  }
                } else {
                  console.log('No matching order found for the specified details.');
                }
              } else {
                console.log('Selected order does not exist in the database.');
              }
            })
            .catch((error) => {
              console.error('Error fetching order data:', error);
            });
        } else {
          console.log('No employee found with the given ID.');
          alert("No employee found with the given ID.");
        }
      })
      .catch((error) => {
        console.error('Error fetching employee data:', error);
      });
  };
  
  const updateGuest = () => {
    updateWorkingMembers(selectedLine,1);
    //updateCurrentOperations(orderData.orderNumber, italyPo, bundleId, id, selectedLine);
    retrievemembersData(selectedLine);
  };
  const updateHost = () => {
    handleAddToLine();
    
    retrievemembersData(selectedLine);  
  };
  

 
 const [data, setData] = useState(null);

//const currentDate = getCurrentDate();

  const retrievemembersData = (line) => {
    const currentDate = getCurrentDate(); // Get the current date

    if (!line) {
      console.error("Line cannot be undefined");
      return;
    }

    const dbPath = `dailyUpdates/${currentDate}/${line}`;
    const dataRef = ref(database, dbPath);

    // Set up a real-time listener for the data
    const unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
      } else {
        console.log("No data available");
        setData({ hostMembers: 0, guestMembers: 0 });
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Return the unsubscribe function to clean up the listener
    return unsubscribe;
  };


   // Function to update 1stQuality
   const handleUpdateFirstQuality = (increment) => {
    
    // Reference to the specific path: currentOperations/{orderId}/{bundleId}
    //const orderUpdateRef = ref(database, `currentOperations/${orderData.orderNumber}/${selectedBundle}`);
     // Determine the path based on user selection
     const previousSelectedIncompleteBundle = selectedIncompleteBundle;
    let orderUpdateRef;
    if (selectedIncompleteBundle) {
      orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
    } else if (selectedBundle) {
      orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
    } else {
      console.error("No valid selection made.");
      return;
    }
    setSelectedIncompleteBundle(""); 
    get(orderUpdateRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const currentData = snapshot.val();
          const currentFirstQuality = currentData['1stQuality'] || 0;
          const newFirstQuality = currentFirstQuality + increment;
         //Update the 1stQuality field
          update(orderUpdateRef, { '1stQuality': newFirstQuality })
            .then(() => {
              console.log(`1stQuality updated to ${newFirstQuality}`);
             // alert(`1stQuality updated to ${newFirstQuality}`);
              setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
              retrieveFirstQuality(selectedLine);
              countQualities();
            })
            .catch((error) => {
              console.error('Error updating 1stQuality:', error);
              alert('Error updating 1stQuality.');
            });
        } else {
          alert('No data found for the selected order and bundle.');
        }
      })
      .catch((error) => {
        console.error('Error fetching order data:', error);
        alert('Error fetching order data.');
      });
  };


  const handleUpdateTotalFirstQuality = async (increment, lineNumber) => {
    try {
      // Create a reference to a temporary node to get the server timestamp
      const tempRef = ref(database, 'serverTime/temp');
  
      // Set the server timestamp temporarily to fetch it
      await set(tempRef, { timestamp: serverTimestamp() });
  
      // Fetch the server timestamp
      const snapshot = await get(tempRef);
      if (snapshot.exists()) {
        const serverTimestampValue = snapshot.val().timestamp;
        const serverDate = new Date(serverTimestampValue);
  
        // Format the server date to 'YYYY-MM-DD'
        const formattedServerDate = serverDate.toISOString().split('T')[0];
  
        // Construct the path for the daily updates under the server date and specific line
        const dailyUpdatesRef = ref(database, `dailyUpdates/${formattedServerDate}/${lineNumber}`);
  
        // Get the current data at the path
        const dailySnapshot = await get(dailyUpdatesRef);
        let currentTotalFirstQuality = 0;
  
        if (dailySnapshot.exists()) {
          currentTotalFirstQuality = dailySnapshot.val().total1stQuality || 0;
        }
  
        const newTotalFirstQuality = currentTotalFirstQuality + increment;
  
        // Update the total1stQuality field with the new value and add the server timestamp
        await update(dailyUpdatesRef, {
          total1stQuality: newTotalFirstQuality,
         // timestamp: serverTimestamp()  // Add the server timestamp here
        });
  
        console.log(`total1stQuality updated to ${newTotalFirstQuality} for ${lineNumber} on ${formattedServerDate}`);
        //alert(`total1stQuality updated to ${newTotalFirstQuality} for ${lineNumber} on ${formattedServerDate}`);
      } else {
        console.error('Error fetching server timestamp.');
        alert('Error fetching server timestamp.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred.');
    }
  };
  
  
  
  const handleUpdateQuality = () => {
   handleUpdateFirstQuality(1);
    handleUpdateTotalFirstQuality(1, selectedLine); // Pass the selected line dynamically  
    
  };

  const handleUpdateQualityBy3 = () => {
    handleUpdateFirstQuality(3);
    handleUpdateTotalFirstQuality(3, selectedLine); // Pass the selected line dynamically
  };


async function retrieveFirstQuality(selectedLine) {
  
  let orderUpdateRef;

  // Check user selection to define the correct path
  if (selectedIncompleteBundle) {
    orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
  } else if (selectedBundle) {
    orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
  } else {
    console.error("No valid selection made.");
    return null;
  }

  try {
    // Retrieve the data from the path
    const snapshot = await get(orderUpdateRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const firstQualityValue = data?.['1stQuality'];

      if (firstQualityValue !== undefined) {
        console.log("1stQuality:", firstQualityValue);
        setFirstQuality(firstQualityValue);
        return firstQualityValue;
      } else {
        console.error("1stQuality not found in the selected bundle.");
        return null;
      }
    } else {
      console.error("No data found at the selected bundle path.");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving 1stQuality:", error);
    return null;
  }
}

const [totalFirstQuality, setTotalFirstQuality] = useState(null);

const retrieveTotalFirstQuality = (lineNumber) => {
  if (!lineNumber) {
    console.error("Line number cannot be undefined");
    return;
  }

  // Create a reference to a temporary node to get the server timestamp
  const tempRef = ref(database, 'serverTime/temp');

  // Set the server timestamp temporarily to fetch it
  set(tempRef, { timestamp: serverTimestamp() })
    .then(() => {
      // Fetch the server timestamp
      return get(tempRef);
    })
    .then((snapshot) => {
      if (snapshot.exists()) {
        const serverTimestampValue = snapshot.val().timestamp;
        const serverDate = new Date(serverTimestampValue);

        // Format the server date to 'YYYY-MM-DD'
        const currentDate = serverDate.toISOString().split('T')[0];

        // Construct the path for the daily updates under the server date and specific line
        const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${lineNumber}`);

        // Set up a real-time listener for the total1stQuality value
        const unsubscribe = onValue(dailyUpdatesRef, (snapshot) => {
          if (snapshot.exists()) {
            const totalFirstQuality = snapshot.val().total1stQuality || 0;
            console.log(`Real-time Total 1st Quality for ${lineNumber} on ${currentDate}: ${totalFirstQuality}`);
            setTotalFirstQuality(totalFirstQuality);
          } else {
            console.log(`No data found for ${lineNumber} on ${currentDate}`);
            setTotalFirstQuality(0); // Set to 0 if no data found
          }
        }, (error) => {
          console.error("Error fetching real-time data:", error);
        });

        // Return the unsubscribe function to clean up the listener
        return unsubscribe;
      } else {
        console.error('Error fetching server timestamp.');
        setTotalFirstQuality(0);
      }
    })
    .catch((error) => {
      console.error('Error setting or fetching server timestamp:', error);
    });
};

// Function to update 2ndQuality
const handleUpdateSecondQuality = () => {

  const previousSelectedIncompleteBundle = selectedIncompleteBundle;
     
  let orderUpdateRef;
    if (selectedIncompleteBundle) {
      orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
    } else if (selectedBundle) {
      orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
    } else {
      console.error("No valid selection made.");
      return;
    }
    setSelectedIncompleteBundle("");
  get(orderUpdateRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        const currentSecondQuality = currentData['2ndQuality'] || 0;
        const newSecondQuality = currentSecondQuality + 1;

        // Update the 1stQuality field
        update(orderUpdateRef, { '2ndQuality': newSecondQuality })
          .then(() => {
            console.log(`2ndQuality updated to ${newSecondQuality}`);
            setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
            alert(`2ndQuality updated to ${newSecondQuality}`);
            countQualities();
          })
          .catch((error) => {
            console.error('Error updating 2ndQuality:', error);
            alert('Error updating 2ndQuality.');
          });
      } else {
        alert('No data found for the selected order and bundle.');
      }
    })
    .catch((error) => {
      console.error('Error fetching order data:', error);
      alert('Error fetching order data.');
    });
};

// Function to update Rejection
const handleUpdateRejection = () => {

  const previousSelectedIncompleteBundle = selectedIncompleteBundle;

  let orderUpdateRef;
    if (selectedIncompleteBundle) {
      orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
    } else if (selectedBundle) {
      orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
    } else {
      console.error("No valid selection made.");
      return;
    }
    setSelectedIncompleteBundle("");
  get(orderUpdateRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        const currentRejection = currentData['Rejection'] || 0;
        const newRejection= currentRejection + 1;

        // Update the Rejection field
        update(orderUpdateRef, { 'Rejection': newRejection})
          .then(() => {
            console.log(`Rejection updated to ${newRejection}`);
            setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
            alert(`Rejection updated to ${newRejection}`);
            countQualities();
          })
          .catch((error) => {
            console.error('Error updating Rejection:', error);
            alert('Error updating Rejection.');
          });
      } else {
        alert('No data found for the selected order and bundle.');
      }
    })
    .catch((error) => {
      console.error('Error fetching order data:', error);
      alert('Error fetching order data.');
    });
};

// const [startTime, setStartTime] = useState(() => {
//   const savedStartTime = localStorage.getItem('startTime');
//   return savedStartTime ? parseInt(savedStartTime, 10) : null;
// });

// const [runTime, setRunTime] = useState(() => {
//   const savedRunTime = localStorage.getItem('runTime');
//   return savedRunTime ? JSON.parse(savedRunTime) : { hours: 0, minutes: 0 };
// });

useEffect(() => {
  const timeRef = ref(database, 'serverTime'); // A dummy reference to get server time

  // Save server timestamp temporarily to calculate server time
  set(timeRef, {
    timestamp: serverTimestamp(),
  }).then(() => {
    onValue(timeRef, (snapshot) => {
      const serverTime = snapshot.val()?.timestamp;
      if (serverTime) {
        const now = new Date(serverTime);

        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 30, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 30, 0);

        if (now >= start && now <= end) {
          // If there's no startTime, set it to the start time
          if (!startTime) {
            setStartTime(start.getTime());
            localStorage.setItem('startTime', start.getTime());
          }

          // Start the timer
          const intervalId = setInterval(() => {
            const currentTime = new Date();
            
            // Check if current time is within break periods
            const isBreakTime = (
              (currentTime.getHours() === 12 && currentTime.getMinutes() >= 27 && currentTime.getMinutes() < 28) ||
              (currentTime.getHours() === 15 && currentTime.getMinutes() >= 0 && currentTime.getMinutes() < 6)
            );

            if (isBreakTime && !isBreakTimeModalOpen) {
              setIsBreakTimeModalOpen(true); // Open break time modal during break time
            } else if (!isBreakTime && isBreakTimeModalOpen) {
              setIsBreakTimeModalOpen(false); // Close break time modal when break time is over
            }

            // Only update runtime if it's not break time
            if (!isBreakTime) {
              const elapsedTimeInSeconds = Math.floor((Date.now() - startTime) / 1000); // seconds

              const hours = Math.floor(elapsedTimeInSeconds / 3600);
              const minutes = Math.floor((elapsedTimeInSeconds % 3600) / 60);

              const newRunTime = { hours, minutes };
              setRunTime(newRunTime);
              localStorage.setItem('runTime', JSON.stringify(newRunTime));
            }
          }, 1000);

          // Clear interval when the component unmounts or when time ends
          return () => clearInterval(intervalId);
        }
      }
    });
  });
}, [isBreakTimeModalOpen]);

//const [startTime, setStartTime] = useState(null);
 const [runTime, setRunTime] = useState({ hours: 0, minutes: 0 });
// const [breakDuration1, setBreakDuration1] = useState(0); // For the first break (10:00 - 10:15)
// const [breakDuration2, setBreakDuration2] = useState(0); // For the second break (15:00 - 15:15)
// const [isBreakTimeActive, setIsBreakTimeActive] = useState(false);
// const [breakStartTime, setBreakStartTime] = useState(null);

// // Simulate server time
 const [serverTime, setServerTime] = useState(new Date());
 const [startTime, setStartTime] = useState(new Date().setHours(7, 30, 0, 0)); // 7:30 AM
const endTime = new Date().setHours(17, 30, 0, 0); // 5:30 PM

// useEffect(() => {
//   const intervalId = setInterval(() => {
//     const currentTime = new Date();

//     // Define break periods
//     const isBreak1 = currentTime.getHours() === 12 && currentTime.getMinutes() >= 15 && currentTime.getMinutes() < 17;
//     const isBreak2 = currentTime.getHours() === 15 && currentTime.getMinutes() >= 0 && currentTime.getMinutes() < 15;
//     const isBreakTime = isBreak1 || isBreak2;

//     if (isBreakTime) {
//       if (!isBreakTimeActive) {
//         setIsBreakTimeActive(true);
//         setBreakStartTime(currentTime.getTime());
//       }
//     } else {
//       if (isBreakTimeActive) {
//         const breakEndTime = currentTime.getTime();
//         const breakTime = breakEndTime - breakStartTime;

//         if (isBreak1) {
//           setBreakDuration1(15 * 60 * 1000); // 15 minutes in milliseconds
//         } else if (isBreak2) {
//           setBreakDuration2(15 * 60 * 1000); // 15 minutes in milliseconds
//         }

//         setIsBreakTimeActive(false);
//         setBreakStartTime(null);
//       }

//       // Calculate total break duration
//       const totalBreakDuration = breakDuration1 + breakDuration2;

//       if (startTime) {
//         // Calculate elapsed time minus break duration
//         const elapsedTimeInSeconds = Math.floor((Date.now() - startTime - totalBreakDuration) / 1000); // seconds
//         const hours = Math.floor(elapsedTimeInSeconds / 3600);
//         const minutes = Math.floor((elapsedTimeInSeconds % 3600) / 60);

//         setRunTime({ hours, minutes });
//       }
//     }

//     // Handle break time modal visibility (optional)
//     if (isBreakTime && !isBreakTimeModalOpen) {
//       setIsBreakTimeModalOpen(true);
//     } else if (!isBreakTime && isBreakTimeModalOpen) {
//       setIsBreakTimeModalOpen(false);
//     }
//   }, 1000);

//   return () => clearInterval(intervalId);
// }, [isBreakTimeActive, breakDuration1, breakDuration2, startTime,isBreakTimeModalOpen]);

//run the server time
useEffect(() => {
  // Simulate getting server time
  setServerTime(new Date());

  // Update the server time every second
  const intervalId = setInterval(() => {
    setServerTime((prevTime) => {
      if (prevTime) {
        return new Date(prevTime.getTime() + 1000); // Increment the time by 1 second
      }
      return null;
    });
  }, 1000);

  // Cleanup interval on component unmount
  return () => clearInterval(intervalId);
}, []);

const [runtime, setRuntime] = useState('');
useEffect(() => {
  
  // Function to calculate runtime based on server time
  const calculateRuntime = async () => {
      const serverTimeSnap = await get(ref(database, '/serverTime'));
      let serverTime = serverTimeSnap.val();

      if (!serverTime) {
          // Set the server timestamp in Firebase if not already set
          set(ref(database, '/serverTime'), serverTimestamp());
          serverTime = new Date();
      } else {
          serverTime = new Date(serverTime);
      }

      const startTime = new Date(serverTime);
      startTime.setHours(7, 30, 0); // Set to 7:30 AM

      const endTime = new Date(serverTime);
      endTime.setHours(17, 30, 0); // Set to 5:30 PM

      // Reset time to start the next day
      const resetTime = new Date(serverTime);
      resetTime.setHours(0, 0, 0, 0);

      if (serverTime >= startTime && serverTime <= endTime) {
          const elapsedTime = (serverTime - startTime) / 1000 / 60; // time in minutes
          const hours = Math.floor(elapsedTime / 60);
          const minutes = Math.floor(elapsedTime % 60);
          setRuntime(`${hours} hours ${minutes} minutes`);
      } else if (serverTime < startTime) {
          setRuntime(`0 hours 0 minutes`);
      } else if (serverTime > endTime && serverTime < resetTime) {
          const totalMinutes = 10 * 60; // Total minutes from 7:30 AM to 5:30 PM
          setRuntime(`${Math.floor(totalMinutes / 60)} hours ${totalMinutes % 60} minutes`);
      }// If the current time is after 5:30 PM, runtime should be 10 hours (the full workday)
      else if (serverTime > endTime) {
        setRuntime(`10 hours 0 minutes`);
      }else if (serverTime >= resetTime) {
          set(ref(database, '/runtime'), null); // Clear runtime at midnight
      }
  };

  const interval = setInterval(calculateRuntime, 1000); // Update runtime every second

  return () => clearInterval(interval); // Cleanup interval on component unmount
}, []);


const [bundles, setBundles] = useState([]);
const [selectedBundle, setSelectedBundle] = useState(""); // Track the selected bundle
const [bundleData, setBundleData] = useState(null); 
  // Function to fetch bundles based on the selected line
  useEffect(() => {

  //  const bundlesRef = ref(database, `Inqueue/${selectedLine}`);
  //  // const bundlesRef = ref(database, `currentOperations/${selectedLine}`);
    

  //   // Listen for changes in the selected line's bundles
  //   const unsubscribe = onValue(bundlesRef, (snapshot) => {
  //     const data = snapshot.val();
  //     if (data) {
  //       const bundleList = Object.keys(data);
  //       setBundles(bundleList);
  //     } else {
  //       setBundles([]); // Reset if no bundles found
  //     }
  //     setSelectedBundle(""); // Reset the selected bundle when the line changes
  //   });

  //   // Cleanup listener on component unmount
  //   return () => unsubscribe();
  const inqueueRef = ref(database, `Inqueue/${selectedLine}`);
  const operationsRef = ref(database, `currentOperations/${selectedLine}`);

  // Listen for changes in the selected line's bundles from Inqueue
  const unsubscribe = onValue(inqueueRef, (inqueueSnapshot) => {
    const inqueueData = inqueueSnapshot.val();

    if (inqueueData) {
      const inqueueBundles = Object.keys(inqueueData);

      // Get the bundles in current operations and filter
      get(operationsRef)
        .then((operationsSnapshot) => {
          const operationsData = operationsSnapshot.val();
          const operationsBundles = operationsData ? Object.keys(operationsData) : [];

          // Filter out bundles that are already in current operations
          const filteredBundles = inqueueBundles.filter(
            (bundle) => !operationsBundles.includes(bundle)
          );

          // Set only the bundles that are not in current operations
          setBundles(filteredBundles);
        })
        .catch((error) => {
          console.error('Error fetching current operations data:', error);
          setBundles([]); // Reset if error occurs
        });

    } else {
      setBundles([]); // Reset if no bundles found in Inqueue
    }

    // Reset the selected bundle when the line changes
    setSelectedBundle("");
  });

  // Cleanup listener on component unmount
  return () => unsubscribe();
  }, [selectedLine]);

  const [orderData, setOrderData] = useState(null);

useEffect(() => {
  if (selectedBundle) {
    console.log("Selected bundle:", selectedBundle);
    const bundleRef = ref(database, `Inqueue/${selectedLine}/${selectedBundle}`);
    
    // Retrieve the data of the selected bundle
    onValue(bundleRef, async (snapshot) => {
      const data = snapshot.val();
      console.log("Bundle data:", data); // Log the bundle data
      
      if (data) {
        setBundleData(data); // Store the bundle data
        
        // Extract order details from bundle data
        const { orderNumber, italyPo, productionPo } = data;
        
        if (orderNumber && italyPo && productionPo) {
          // Fetch all orders and filter client-side
          const ordersRef = ref(database, 'orders');
          onValue(ordersRef, (ordersSnapshot) => {
            const ordersData = ordersSnapshot.val();
            //console.log("Orders data:", ordersData); // Log the orders data
            
            let matchingOrder = null;

            if (ordersData) {
              // Loop through orders to find the one that matches all criteria
              for (const orderId in ordersData) {
                const order = ordersData[orderId];
                if (
                  order.orderNumber === orderNumber &&
                  order.italyPO === italyPo &&
                  order.productionPO === productionPo
                ) {
                  matchingOrder = order;
                  break;
                }
              }
            }

            // Set the matched order data
            setOrderData(matchingOrder || null);
          });
        } else {
          setOrderData(null); // Reset if no order details are available
        }
      } else {
        setBundleData(null); // Reset if no bundle data is found
        setOrderData(null);  // Reset the order data if no bundle data found
      }
    });
  }
}, [selectedBundle, selectedLine]);


//incomplete 
const [incompleteBundles, setIncompleteBundles] = useState([]);
const [selectedIncompleteBundle, setSelectedIncompleteBundle] = useState(""); // Track the selected incomplete bundle
const [incompleteBundleData, setIncompleteBundleData] = useState(null); 

// Function to fetch incomplete bundles based on the selected line
useEffect(() => {
  const operationsRef = ref(database, `currentOperations/${selectedLine}`);

  // Listen for changes in the selected line's incomplete bundles
  const unsubscribe = onValue(operationsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const incompleteBundleList = Object.keys(data);
      setIncompleteBundles(incompleteBundleList); // Store the list of incomplete bundles
    } else {
      setIncompleteBundles([]); // Reset if no incomplete bundles found
    }
    // Only reset the selectedIncompleteBundle if the line has changed
    if (selectedLine) {
      setSelectedIncompleteBundle(""); 
    }
  });

  // Cleanup listener on component unmount
  return () => unsubscribe();
}, [selectedLine]);


const [incompleteOrderData, setIncompleteOrderData] = useState(null); // Store incomplete order data

// Function to load the selected incomplete bundle data from currentOperations node
useEffect(() => {
  if (selectedIncompleteBundle) {
    console.log("Selected incomplete bundle:", selectedIncompleteBundle);
    const incompleteBundleRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
    
    // Retrieve the data of the selected incomplete bundle
    onValue(incompleteBundleRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Incomplete bundle data:", data); // Log the incomplete bundle data
      
      if (data) {
        setIncompleteBundleData(data); // Store the incomplete bundle data
      } else {
        setIncompleteBundleData(null); // Reset if incomplete bundle has no data
        //setIncompleteOrderData(null);  // Reset the incomplete order data if no bundle data is found
      }
    });
  }
}, [selectedIncompleteBundle, selectedLine]);

useEffect(() => {
  console.log("Incomplete bundles:", incompleteBundles);
  console.log("Selected incomplete bundle:", selectedIncompleteBundle);
}, [incompleteBundles, selectedIncompleteBundle]);


const [pendingValue, setPendingValue] = useState(null);

const countQualities = () => {
 
  let currentOperationsRef;
    if (selectedIncompleteBundle) {
      currentOperationsRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
    } else if (selectedBundle) {
      currentOperationsRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
    } else {
      console.error("No valid selection made.");
      return;
    }
  //const currentOperationsRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
  //const inqueueRef = ref(database, `Inqueue/${selectedLine}/${selectedBundle}`);
  let inqueueRef;
    if (selectedIncompleteBundle) {
      inqueueRef = ref(database, `Inqueue/${selectedLine}/${selectedIncompleteBundle}`);
    } else if (selectedBundle) {
      inqueueRef = ref(database, `Inqueue/${selectedLine}/${selectedBundle}`);
    } else {
      console.error("No valid selection made.");
      return;
    }
  get(currentOperationsRef)
    .then((currentSnapshot) => {
      if (currentSnapshot.exists()) {
        const currentFirstQuality = currentSnapshot.val()['1stQuality'] || 0;
        const currentSecondQuality = currentSnapshot.val()['2ndQuality'] || 0;
        const currentRejection = currentSnapshot.val()['Rejection'] || 0;
        const totalBundle = currentSnapshot.val()['noOfPieces'] || 0;

        const pending = totalBundle - currentFirstQuality -currentSecondQuality -currentRejection;
        setPendingValue(pending);  // Set the pending value in state
       }
    })
    .catch((error) => {
      console.error('Error fetching current 1stQuality value:', error);
      alert('Error fetching current 1stQuality value.');
    });
};

useEffect(() => {
  if (pendingValue !== null) {
    // Call the handleCheckPendingAndSave when pendingValue changes
    handleCheckPendingAndSave();
  }
}, [pendingValue]); // Dependency array with pendingValue

const isPendingLessThanThree = () => {
  if (pendingValue === null) return false; // Allow button if pending is null
  return pendingValue < 3;
};

const [isAuthenticated, setIsAuthenticated] = useState(false);
const [authSuccessCallback, setAuthSuccessCallback] = useState(null); // Callback for post-authentication

  // Open modal and set the action to execute after authentication
  const handleOpenPasswordModal = (actionToExecute) => {
    setAuthSuccessCallback(() => actionToExecute); // Set the function to execute after auth
    setIsPasswordModalOpen(true); // Open modal when the Rejection button is clicked
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true); // Mark the user as authenticated
    handleClosePasswordModal(); // Close the modal
    if (authSuccessCallback) {
      authSuccessCallback(); // Execute the passed action after authentication
    }
  };

  function handleCheckPendingAndSave() {
    // Step 1: Check if pending is equal to 0
    if (pendingValue === 0) {

      let currentOperationsRef;
      
      // Determine the current operations path based on selected bundle
      if (selectedIncompleteBundle) {
        currentOperationsRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);      
      } else if (selectedBundle) {
        currentOperationsRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`)
      } else {
        console.error("No valid selection made.");
        return;
      }
  
      // Step 2: Retrieve data from `currentOperations/{selectedLine}/{selectedBundle}`
      get(currentOperationsRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const orderData = snapshot.val(); // Get data from currentOperations
  
            // Prepare data to be used for updates
            const {
              italyPo,
              productionPO,
              styleNumber,
              colour,
              colourCode,
              size,
              "1stQuality": newFirstQuality,
              "2ndQuality": newSecondQuality,
              Rejection: newRejection,
            } = orderData;
  
            // Step 3: Check if data exists in Line Operations under `${orderData.orderId}/${orderData.size}`
            const lineOperationsRef = ref(database, `Line Operations/${orderData.orderId}/${orderData.productionPO}`);
            
            return get(lineOperationsRef).then((lineSnapshot) => {
              if (lineSnapshot.exists()) {
                const existingData = lineSnapshot.val();
  
                // If data exists, retrieve and update only the quality and rejection values
                const updatedFirstQuality = (existingData["1stQuality"] || 0) + (newFirstQuality || 0);
                const updatedSecondQuality = (existingData["2ndQuality"] || 0) + (newSecondQuality || 0);
                const updatedRejection = (existingData.Rejection || 0) + (newRejection || 0);
  
                // Update the existing data
                return set(lineOperationsRef, {
                  ...existingData, // Keep existing values
                  "1stQuality": updatedFirstQuality,
                  "2ndQuality": updatedSecondQuality,
                  Rejection: updatedRejection,
                 // startDate: existingData.startDate || serverTimestamp(), // Keep startDate if already set
                });
              } else {
                // If no data exists, set all values as new
                return set(lineOperationsRef, {
                  italyPo,
                  productionPO,
                  styleNumber,
                  colour,
                  colourCode,
                  size,
                  "1stQuality": newFirstQuality || 0,
                  "2ndQuality": newSecondQuality || 0,
                  Rejection: newRejection || 0,
                  startDate: serverTimestamp(), // Use Firebase server timestamp
                });
              }
            });
          } else {
            throw new Error("Order data not found in currentOperations");
          }
        })
        .then(() => {
          console.log("Order data successfully updated in Line Operations");
          alert("Bundle compeleted successfully.")
          handleFinish();
          remove(currentOperationsRef);
        })
        .catch((error) => {
          console.error("Error updating order data:", error);
        });
    } else {
      console.log("Pending is not 0, no action taken.");
    }
  }
  

  return (
    <div>
      <Titlepic />
      <SignOut />

      <div>
      <div>
      <h2>Select a Line</h2>
      <select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}>
      <option value="">Choose a Line</option>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i + 1} value={`Line ${i + 1}`}>
            Line {i + 1}
          </option>
        ))}
      </select>
      </div>
        <h1>Welcome to {selectedLine}</h1>
      </div>
      <div>
      <div>
      
      <h2>Select an Incomplete Bundle</h2>
      <select
        value={selectedIncompleteBundle}
        onChange={(e) => setSelectedIncompleteBundle(e.target.value)}
        disabled={isStarted}
      >
        <option value="">Choose an incomplete bundle</option> {/* Default option */}
        {incompleteBundles.length > 0 ? (
          incompleteBundles.map((bundle, index) => (
            <option key={index} value={bundle}>
              {bundle}
            </option>
          ))
        ) : (
          <option value="">No incomplete bundles available</option>
        )}
      </select>
    </div>

        {/* Bundle dropdown */}
      <h2>Select a Bundle</h2>
      <select
        value={selectedBundle}
        onChange={(e) => setSelectedBundle(e.target.value)}
        disabled={isStarted}
      >
        <option value="">Choose a bundle</option> {/* Default option */}
        {bundles.length > 0 ? (
          bundles.map((bundle, index) => (
            <option key={index} value={bundle}>
              {bundle}
            </option>
          ))
        ) : (
          <option value="">No bundles available</option>
        )}
      </select>

      {/* Display order details in a table */}
      {orderData &&(
        <div>
          <h2>Order Details</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Bundle ID</th>
                <th>Order Number</th>
                <th>Italy PO</th>
                <th>Production PO</th>
                <th>Size</th>
                <th>Style Number</th>
                <th>Color</th>
                <th>Color Code</th>
                <th>Bundle Quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedBundle}</td>
                <td>{orderData.orderNumber}</td>
                <td>{orderData.italyPO}</td>                
                <td>{orderData.productionPO}</td>
                <td>{orderData.size}</td>
                <td>{orderData.styleNumber}</td>
                <td>{orderData.colour}</td>
                <td>{orderData.colourCode}</td>
                <td>{bundleData.noOfPieces}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

    
      {/* Display operation details in a table */}
      {incompleteBundleData && (
        <div>
          <h2>Order Details</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Bundle ID</th>
                <th>Order Number</th>
                <th>Italy PO</th>
                <th>Style Number</th>
                <th>Production PO</th>
                <th>Color</th>
                <th>Color Code</th>
                <th>Start Date</th> 
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{incompleteBundleData.bundleId}</td>
                <td>{incompleteBundleData.orderId}</td>
                <td>{incompleteBundleData.italyPo}</td>
                <td>{incompleteBundleData.styleNumber}</td>
                <td>{incompleteBundleData.productionPO}</td>
                <td>{incompleteBundleData.colour}</td>     
                <td>{incompleteBundleData.colourCode}</td>    
                <td>{new Date(incompleteBundleData.startDate).toLocaleDateString()}</td>             
              </tr>
            </tbody>
          </table>
        </div>
      )}
     
    </div>
    {/* <td>{operationData.bundleId}</td>
                <td>{operationData.orderId}</td>
                <td>{operationData.italyPo}</td>
                <td>{operationData.startDate}</td>
                <td>{operationData.rejection}</td>
                <td>{operationData.firstQuality}</td> */}
      <div>
      {serverTime ? (
        <div>
          <p>Date: {serverTime.toLocaleDateString()}</p>
          <p>Time: {serverTime.toLocaleTimeString()}</p>
        </div>
      ) : (
        <p>Loading server time...</p>
      )}
        {/* <h2>Add Order to {selectedLine}</h2>
        <label>
          Order Number:
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => handleInputChange(e, setOrderNumber)} required
          />
        </label>
        <br />
        <label>
          Bundle ID:
          <input
            type="text"
            value={bundleId}
            onChange={(e) => handleInputChange(e, setBundleId)} required
          />
        </label>
        <br />
        <label>
          Italy PO:
          <input
            type="text"
            value={italyPo}
            onChange={(e) => handleInputChange(e, setItalyPo)} required
          />
        </label> */}
        <br />
        <button onClick={handleStart} disabled={!validateInputs() || isStarted && !isFinished}>Start</button>
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
          Stop
        </button>

        {isFinished && <p>Time Elapsed: {formatTime(timer)}</p>}
      </div>
      <button onClick={openModal}>Open Modal</button>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
      <div>
      <label htmlFor="idInput">Enter ID:</label>
      <input
        id="idInput"
        type="tel"
        value={id}
        onChange={handleInputChange1}
        pattern="[0-9]*"
        inputMode="numeric"
        placeholder="Enter your ID"
      />
      <button className='addGuest' onClick={updateGuest}>Add memeber to Line</button>
      <h2>Employees assigned to {selectedLine}</h2>
      {employees.length > 0 ? (
        <ul>
          {employees.map((employee) => (
            <li key={employee.employeeNumber}>
              <strong>{employee.fullName}</strong> - {employee.designation}
              <button onClick={updateHost}>Add to Line</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No employees found for this line.</p>
      )}
    </div>
        <button onClick={closeModal}>Close Modal</button>
      </Modal>
      {data ? (
    <div>
      <p>Host Members: {data.hostMembers ?? 0}</p>
      <p>Guest Members: {data.guestMembers ?? 0}</p>
    </div>
      ) : (
        <p>No memebers assigend for this {selectedLine} yet.</p>
      )}
      <div>
        {firstQuality !== null ? (
          <div>
            <p>1st Quality: {firstQuality}</p>
          </div>
        ) : (
          <p>No 1st Quality value assigned for this order yet.</p>
        )}
      </div>
      <div>
        {pendingValue !== null ? (
          <div>
            <p>Pending Pieces: {pendingValue}</p>
          </div>
        ):(
          <p> No pending data for this order yet.</p>
        )}
      </div>
      <button onClick={handleUpdateQuality} disabled={!isStarted || isPaused}>1stQuality +1</button>
      <button onClick={handleUpdateQualityBy3} disabled={!isStarted || isPaused || isPendingLessThanThree()}>1stQuality +3</button>
      <div>
        {totalFirstQuality !== null ? (
          <p>Total 1st Quality for today: {totalFirstQuality}</p>
        ) : (
          <p>No Total 1st Quality data available for today.</p>
        )}
      </div>

      <div>
      <button onClick={() => handleOpenPasswordModal(handleUpdateRejection)} disabled={!isStarted || isPaused}>
        Rejection
      </button>

      <button onClick={() => handleOpenPasswordModal(handleUpdateSecondQuality)} disabled={!isStarted || isPaused}>
        2nd Quality
      </button>

      {/* Modal for password authentication */}
      <RejectionModal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        onAuthSuccess={handleAuthSuccess} // Call success action after authentication
      />
    </div>
    
      <p>Runtime: {runTime.hours} hours and {runTime.minutes} minutes</p>
      <div>
      <BreakTimeModal isOpen={isBreakTimeModalOpen} onClose={() => setIsBreakTimeModalOpen(false)}>
      <h2>Break Time!</h2>
      <p>The break is from 12:37 PM to 12:40 PM and 3:00 PM to 3:15 PM.</p>
      </BreakTimeModal>
      <Timer/>
    </div>
    
    </div>
  );
}
