// import React, { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import { database } from '../../Firebase'; // Adjust the import path as needed
// import { ref, query, orderByChild, equalTo, get } from 'firebase/database';

// const AssignEmployee = () => {
//   const [id, setId] = useState('');
//   const [employees, setEmployees] = useState([]);

//   const location = useLocation();
//   const { selectedLine } = location.state || { selectedLine: 'Line 1' };

//   useEffect(() => {
//     console.log('Selected Line:', selectedLine); // Debug: Log the selected line
  
//     // Create a reference to the 'employee' node
//     const employeeRef = ref(database, 'employees');
  
//     // Create a query to get employees with the selected line allocation
//     const employeeQuery = query(employeeRef, orderByChild('lineAllocation'), equalTo(selectedLine));
  
//     // Fetch data
//     get(employeeQuery)
//       .then((snapshot) => {
//         if (snapshot.exists()) {
//           const employeeData = [];
//           snapshot.forEach((childSnapshot) => {
//             employeeData.push(childSnapshot.val());
//           });
//           console.log('Employee Data:', employeeData); // Debug: Log retrieved data
//           setEmployees(employeeData);
//         } else {
//           console.log('No employees found for the selected line.');
//         }
//       })
//       .catch((error) => {
//         console.error('Error fetching employee data:', error);
//       });
//   }, [selectedLine]);

//   const handleInputChange = (e) => {
//     setId(e.target.value);
//   };

//   return (
//     <div>
//       <label htmlFor="idInput">Enter ID:</label>
//       <input
//         id="idInput"
//         type="tel"
//         value={id}
//         onChange={handleInputChange}
//         pattern="[0-9]*"
//         inputMode="numeric"
//         placeholder="Enter your ID"
//       />

//       <h2>Employees assigned to {selectedLine}</h2>
//       {employees.length > 0 ? (
//         <ul>
//           {employees.map((employee) => (
//             <li key={employee.employeeNumber}>
//               <strong>{employee.fullName}</strong> - {employee.designation}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No employees found for this line.</p>
//       )}
//     </div>
//   );
// };

// export default AssignEmployee;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { database } from '../../Firebase'; // Adjust the import path as needed
import { ref, query, orderByChild, equalTo, get, update } from 'firebase/database';

const AssignEmployee = () => {
  const [id, setId] = useState('');
  const [employees, setEmployees] = useState([]);

  const location = useLocation();
  const { selectedLine, orderNumber, italyPo, bundleId } = location.state || {};

  const navigate = useNavigate();

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
  }, [selectedLine]);

  const handleInputChange = (e) => {
    setId(e.target.value);
  };

  
  const handleAddToLine = () => {
    console.log('Selected Line:', selectedLine);
    console.log('Order Number:', orderNumber);
    console.log('Italy PO:', italyPo);
    console.log('Bundle ID:', bundleId);
    const lineRef = ref(database, `${selectedLine}`);
  
    // Query to find the specific order that matches orderNumber, italyPo, and bundleId
    const orderQuery = query(
      lineRef,
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
  

  return (
    <div>
      <label htmlFor="idInput">Enter ID:</label>
      <input
        id="idInput"
        type="tel"
        value={id}
        onChange={handleInputChange}
        pattern="[0-9]*"
        inputMode="numeric"
        placeholder="Enter your ID"
      />

      <h2>Employees assigned to {selectedLine}</h2>
      {employees.length > 0 ? (
        <ul>
          {employees.map((employee) => (
            <li key={employee.employeeNumber}>
              <strong>{employee.fullName}</strong> - {employee.designation}
              <button onClick={handleAddToLine}>Add to Line</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No employees found for this line.</p>
      )}
    </div>
  );
};

export default AssignEmployee;
