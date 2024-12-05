import React, { useEffect, useState,useContext   } from 'react';
import { ref, onValue,set,get } from 'firebase/database';
import { database } from '../Firebase'; // Make sure to import your Firebase configuration
import './Orderdetails.css';
import Titlepic from '../components/Titlepic'
import SignOut from './SignOut';
import { Helmet } from 'react-helmet';
import { UserContext } from './UserDetails';
import { useNavigate } from 'react-router-dom';
import welcome from '../components/Images/img101.png';

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

  const { user } = useContext(UserContext);

  const navigate = useNavigate()

  const navigateHome = ()=>{
    if (user && user.occupation) { // Check if `user` and `occupation` exist
      if (user.occupation === "IT Section") {
        navigate('/pages/ItHome');
      } else if (user.occupation === "Admin") {
        navigate('/pages/Admin');
      } else {
        console.log("User occupation not recognized!");
      }
    } else {
      alert("User data is not available. Please try again.");
    }
  }

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

    // Call this whenever `filteredOrders` changes
    useEffect(() => {
      if (filteredOrders.length > 0) {
        calculateAndSetCutQuantities();
      }
    }, [filteredOrders]);

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
      console.log("Filtered orders:", filtered);

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
      const color = order.colour;
  
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
              colour:color,
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
         // alert(`Bundle data for order ${order.orderNumber} saved successfully.`);
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

  const [remainingBalances, setRemainingBalances] = useState({});

async function calculateCutQuantity(orderNumber, productionPO) {
  const orderRef = ref(database, `Cuttingdetails/${orderNumber}/productionPOs/${productionPO}`);
  console.log(`Fetching data for Order Number: ${orderNumber}, Production PO: ${productionPO}`);

  try {
    const snapshot = await get(orderRef);

    if (!snapshot.exists()) {
      console.log(`Production PO ${productionPO} does not exist for Order Number ${orderNumber}.`);
      return `Production PO ${productionPO} does not exist for order number ${orderNumber}.`;
    }

    const productionData = snapshot.val();
    console.log(`Fetched data for Production PO ${productionPO}:`, productionData);

    const cutNumbers = productionData.cutNumbers;

    if (!cutNumbers) {
      console.log(`No cut details available for Production PO ${productionPO}.`);
      return `No cut details available for Production PO ${productionPO} in order number ${orderNumber}.`;
    }

    let totalCutQuantity = 0;

    if (Array.isArray(cutNumbers)) {
      for (const cut of cutNumbers) {
        if (cut) {
          const noOfPieces = parseInt(cut.noOfPieces, 10) || 0;
          const ratio = parseInt(cut.ratio, 10) || 0;
          console.log(`Processing cut (Array): noOfPieces=${noOfPieces}, ratio=${ratio}`);
          totalCutQuantity += noOfPieces * ratio;
        }
      }
    } else {
      for (const key in cutNumbers) {
        if (cutNumbers[key]) {
          const noOfPieces = parseInt(cutNumbers[key].noOfPieces, 10) || 0;
          const ratio = parseInt(cutNumbers[key].ratio, 10) || 0;
          console.log(`Processing cut (Object, key=${key}): noOfPieces=${noOfPieces}, ratio=${ratio}`);
          totalCutQuantity += noOfPieces * ratio;
        }
      }
    }

    console.log(`Total cut quantity for Production PO ${productionPO}: ${totalCutQuantity}`);
    return ` ${totalCutQuantity}`;
  } catch (error) {
    console.error("Error fetching data from Firebase:", error);
    return "An error occurred while calculating cut quantity.";
  }
}

const calculateAndSetCutQuantities = async () => {
  const updatedCutQuantities = {};
  const updatedRemainingBalances = {};

  for (const order of filteredOrders) {
    const { orderNumber, productionPO, orderQuantity } = order;
    console.log("data", orderNumber, productionPO);

    if (productionPO) {
      // Ensure productionPO is an object or array before iterating over it
      if (typeof productionPO === 'object' && !Array.isArray(productionPO)) {
        console.log("productionPO:", productionPO);

        updatedRemainingBalances[orderNumber] = updatedRemainingBalances[orderNumber] || {}; // Ensure nested structure

        for (const poKey of Object.keys(productionPO)) {
          console.log("poKey:", poKey);  // Check each key
          const sanitizedPO = sanitizeKey(poKey);

          const quantity = await calculateCutQuantity(orderNumber, sanitizedPO);
          console.log(`Calculated quantity for Order Number ${orderNumber}, Production PO ${sanitizedPO}:`, quantity);
          updatedCutQuantities[`${orderNumber}_${sanitizedPO}`] = quantity;

          console.log("or qun"+orderQuantity)
          // Calculate remaining balance
          const remainingBalance = orderQuantity - quantity;
          console.log(`Remaining balance for Order Number ${orderNumber}, Production PO ${sanitizedPO}:`, remainingBalance);

          // Properly nest the remaining balance
          updatedRemainingBalances[orderNumber][sanitizedPO] = remainingBalance;
          
        }
      } else {
        // If productionPO is a single value (like a number), handle it differently
        console.log(`Production PO ${productionPO} is a single value, skipping keys loop.`);
        const sanitizedPO = sanitizeKey(productionPO.toString());  // Treat as a string key
        const quantity = await calculateCutQuantity(orderNumber, sanitizedPO);
        updatedCutQuantities[`${orderNumber}_${sanitizedPO}`] = quantity;
        console.log("order qun"+orderQuantity)
        // Calculate remaining balance
        const remainingBalance = orderQuantity - quantity;
        console.log(`Remaining balance for Order Number ${orderNumber}, Production PO ${sanitizedPO}:`, remainingBalance);

        // Properly nest the remaining balance
        updatedRemainingBalances[orderNumber] = updatedRemainingBalances[orderNumber] || {};
        updatedRemainingBalances[orderNumber][sanitizedPO] = remainingBalance;
        console.log("balance" + remainingBalance);
      }
    } else {
      console.log(`No productionPO for Order Number ${orderNumber}`);
    }
  }

  console.log("Updated cut quantities:", updatedCutQuantities);
  console.log("Updated remaining balances:", updatedRemainingBalances);
  setCutQuantities(updatedCutQuantities);
  setRemainingBalances(updatedRemainingBalances);
};


return (
  <div className="holder">
    <Helmet>
      <title>Cut Details</title>
    </Helmet>
    <Titlepic />
    <SignOut />
    <table border={0} width='100%' align="right" >
        <tr>
            <th></th>
            <th width='300px'></th>
            <th></th>
            <th className='welImg' width='50px'><img src={welcome} alt="Description of the image"/></th>
          <th width='100px'><p className='welcomeName'>{user?.username || 'User'}</p></th>
        </tr>
        </table>
    <button className="homeBtn" onClick={navigateHome}>
      Home
    </button>
    <div>
      <input
        className="searchBar"
        type="text"
        placeholder="Search by Order Number or Customer Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        required
      />
      <button className="search" onClick={handleSearch}>
        Search
      </button>
    </div>

    {noMatchFound && <p>No order with that order number.</p>}

    {showResults && (
      <div className="cutTable">
        <table border="1" align="center">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Size</th>
              <th>Style</th>
              <th>Color</th>
              <th>Color Code</th>
              <th>Remaning Balance</th>
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
            {filteredOrders.map((order) => {
              const sanitizedPO = sanitizeKey(order.productionPO); // Sanitize production PO for key formatting
              const calculatedCutQuantity =
                cutQuantities[`${order.orderNumber}_${sanitizedPO}`] || 0;
                const remainingBalance = remainingBalances[`${order.orderNumber}_${sanitizedPO}`] ?? "N/A";
                console.log(remainingBalance)
              return (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.size}</td>
                  <td>{order.styleNumber}</td>
                  <td>{order.colour}</td>
                  <td>{order.colourCode}</td>
                  <td>
                    {remainingBalances[order.orderNumber]?.[sanitizeKey(order.productionPO)] !== undefined 
                      ? remainingBalances[order.orderNumber]?.[sanitizeKey(order.productionPO)] < 0 
                        ? `Overcut: ${Math.abs(remainingBalances[order.orderNumber]?.[sanitizeKey(order.productionPO)])}` 
                        : remainingBalances[order.orderNumber]?.[sanitizeKey(order.productionPO)]
                      : "Calculating..."}
                  </td>
                  <td>{order.productionPO}</td>
                  <td>{order.italyPO}</td>
                  <td>
                    <input
                      type="text"
                      value={cutNumbers[order.id] || ''}
                      onChange={(e) =>
                        handleInputChange(e, order.id, 'cutNumbers', setCutNumbers)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={noOfPieces[order.id] || ''}
                      onChange={(e) =>
                        handleInputChange(e, order.id, 'noOfPieces', setNoOfPieces)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={ratios[order.id] || ''}
                      onChange={(e) =>
                        handleInputChange(e, order.id, 'ratios', setRatios)
                      }
                    />
                  </td>
                  <td>{cutQuantities[order.id] || 0}</td>
                  {showActions && (
                    <td>
                      {/* Add your action buttons here */}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Save Button */}
        <button onClick={saveData} className="save-button">
          Create Bundle
        </button>
      </div>
    )}
  </div>
);
};


export default CuttingDetailsForm;



