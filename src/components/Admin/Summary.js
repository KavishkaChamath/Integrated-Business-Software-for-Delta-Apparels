import React, { useState,useEffect } from 'react';
import { get, ref,onValue } from 'firebase/database';
import { database } from '../../Firebase'; // Adjust this import according to your Firebase configuration file
import Titlepic from '../Titlepic';
import SignOut from '../SignOut';
import { Helmet } from 'react-helmet';

const Summary = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [productionPo, setProductionPo] = useState('');
  const [summaryType, setSummaryType] = useState('');
  const [data, setData] = useState(null);
  const [extraData, setExtraData] = useState(null);
  const [cutDetails, setCutDetails] = useState([]);

  const [productionPoOptions, setProductionPoOptions] = useState([]);
  const [ordersData, setOrdersData] = useState({});
  const [showSearchResult, setShowSearchResult] = useState(false);
  
  useEffect(() => {
    if (orderNumber) {
      // Call the function to set production Po options when orderNumber changes
      setProductionPoOptionsFromOrders(ordersData); // Pass the ordersData as a parameter
    }
  }, [orderNumber]);

  const setProductionPoOptionsFromOrders = (ordersData) => {
    console.log(orderNumber); // Debugging the entered order number
    if (ordersData && orderNumber) {
      const productionPoList = [];
      
      // Loop through the orders data to find the specific order by orderNumber
      Object.keys(ordersData).forEach(orderId => {
        const order = ordersData[orderId];
  
        // Check if the order matches the entered orderNumber
        if (order.orderNumber === orderNumber) {
          if (order.productionPO) {
            // If productionPo exists, push it into the list
            productionPoList.push(order.productionPO);
          }
        }
      });
  
      // If we found productionPo values, update the state
      if (productionPoList.length > 0) {
        setProductionPoOptions(productionPoList);
        console.log('Available Production PO:', productionPoList);
      } else {
        // No production PO found for the entered order number
        setProductionPoOptions([]);
        console.log('No Production PO available for this order number');
      }
    }
  };

  useEffect(() => {

    // Fetch data from Orders node
    const ordersRef = ref(database, 'orders');
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log('Orders Data:', snapshot.val());
        setOrdersData(snapshot.val());
        setProductionPoOptionsFromOrders(snapshot.val());
      } else {
        console.log('No data available in Orders');
        setOrdersData({});
      }
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeOrders();
    };
  }, []);

  const [completeOrdersData, setCompleteOrdersData] = useState(null); // State to store orders data
  const [loading, setLoading] = useState(true); // State to manage loading state

  useEffect(() => {
    
    const ordersRef = ref(database, 'Complete Orders'); // Reference to the orders node

    // Fetch data from Firebase when the component loads
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        setCompleteOrdersData(snapshot.val()); // Set orders data to state
      } else {
        console.log('No data available');
        setCompleteOrdersData(null); // Set null if no data is available
      }
      setLoading(false); // Set loading to false after data is fetched
    });

    // Cleanup the subscription when the component is unmounted
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  // Render loading message while data is being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  const handleSearch = async () => {
    if (!orderNumber || !productionPo) {
      alert('Please enter the order number and production PO.');
      return;
    }
    if(!summaryType){
      alert('Please select a summary type.');
      return;
    }

    
    if (summaryType === 'Full Summary') {
      // Retrieve data from the Complete Orders node
      const completeOrdersRef = ref(database, `Complete Orders/${orderNumber}/${productionPo}`);
      const snapshot = await get(completeOrdersRef);
    
      if (snapshot.exists()) {
        setData(snapshot.val());
      } else {
        alert('No data found for the provided order number and production PO in Complete Orders.');
      }
    
      // Retrieve additional data from the orders node
      const ordersRef = ref(database, 'orders');
      const ordersSnapshot = await get(ordersRef);
    
      if (ordersSnapshot.exists()) {
        const ordersData = ordersSnapshot.val();
        setOrdersData(snapshot.val());
        let additionalData = null;

        // Loop through orders to find the matching order number and production PO
        Object.entries(ordersData).forEach(([orderKey, orderDetails]) => {
          if (
            orderDetails.orderNumber === orderNumber &&
            orderDetails.productionPO === productionPo
          ) {
            additionalData = orderDetails; // Store the matching order details
          }
        });

        if (additionalData) {
          console.log('Additional data from orders node:', additionalData);
          setExtraData(additionalData);
          // Use the additionalData variable as needed in your component
        } else {
          console.log('No matching data found for the provided order number and production PO in orders node.');
        }
      } else {
        console.log('No data found in orders node.');
      }

      await fetchCutDetails(orderNumber,productionPo);
      setShowSearchResult(true);


    }
    
    else if (summaryType === 'Line Summary') {
      // Retrieve data from all lines in the Line Summary node
      const lineSummaryRef = ref(database, `Line Summary/${orderNumber}/${productionPo}`);
      const snapshot = await get(lineSummaryRef);
      if (snapshot.exists()) {
        setData(snapshot.val());
      } else {
        alert('No data found for the provided order number and production PO in Line Summary.');
      }
    }
  };

  const fetchCutDetails = async (orderNumber, productionPo) => {
    const cutDetailsRef = ref(database, `Cuttingdetails/${orderNumber}/productionPOs/${productionPo}/cutNumbers`);

    try {
      const snapshot = await get(cutDetailsRef);
      if (snapshot.exists()) {
        const cutData = snapshot.val();
        const allCutNumbers = [];

        // Loop through all cut numbers and add their details to the array
        Object.entries(cutData).forEach(([cutNumber, cutDetails]) => {
          allCutNumbers.push({
            cutNumber,
            noOfPieces: cutDetails.noOfPieces || 0,
            ratio: cutDetails.ratio || 0,
          });
        });

        // Set the data into the state variable
        setCutDetails(allCutNumbers);
      } else {
        console.log('No cut details found for the specified order number and production PO.');
        setCutDetails([]); // Clear the state if no data is found
      }
    } catch (error) {
      console.error('Error retrieving cut details:', error);
    }
  };

  return (
    <div className="holder">
      <div>
        <Titlepic />
        <SignOut />
        <Helmet>
          <title>Order Summary</title>
        </Helmet>
        <center>
          <h2>Order Summary</h2>
        </center>
        <div>
          <input
            type="text"
            placeholder="Enter Order Number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
          {productionPoOptions.length > 0 ? (
            <select
              value={productionPo}
              onChange={(e) => setProductionPo(e.target.value)}
            >
              <option value="">Select Production PO</option>
              {productionPoOptions.map((po, index) => (
                <option key={index} value={po}>
                  {po}
                </option>
              ))}
            </select>
          ) : (
            <p>Checking for Production PO</p>
          )}
          <select
            value={summaryType}
            onChange={(e) => setSummaryType(e.target.value)}
          >
            <option value="">Select Summary Type</option>
            <option value="Full Summary">Full Summary</option>
            <option value="Line Summary">Line Summary</option>
          </select>
          <button className="search" onClick={handleSearch}>
            Search
          </button>
        </div>
  
        {showSearchResult ? (
          data && (
            <div>
              <center>
                <h3>Order Details</h3>
              </center>
              {summaryType === "Full Summary" ? (
                <div className="summary-box"><center>
                  <form className='order-form'>
            <div className='form-group1'>
            <p><span style={{marginRight:'52px'}}><label>Order Number : </label></span>
              {orderNumber}</p>
            </div>
            <div className='form-group1'>
            <p><span style={{marginRight:'55px'}}><label>Production PO :</label></span>
              {productionPo}</p>
            </div>
            <div className='form-group1'>
            <p><span style={{marginRight:'106px'}}><label>Italy PO :</label></span>
              {data?.italyPo || 'N/A'}</p>
            </div>
            <div className='form-group1'>
            <p><span style={{marginRight:'115px'}}><label>Colour :</label></span>
              {data?.colour || 'N/A'}</p>
            </div>
            <div className='form-group1'>
              <p><span style={{marginRight:'70px'}}><label>Colour Code :</label></span>
              {data?.colourCode || 'N/A'}</p>
            </div>
            <div className='form-group1'>
              <p><span style={{marginRight:'135px'}}><label>Size :</label></span>
              {data?.size || 'N/A'}</p>
            </div>
            <div className='form-group1'>
              <p><span style={{marginRight:'63px'}}><label>Style Number :</label></span>
              {data?.styleNumber || 'N/A'}</p>
            </div>
            <div className='form-group1'>
              <p><span style={{marginRight:'52px'}}><label>Order Quantity :</label></span>
              {extraData?.orderQuantity || 'N/A'}</p>
            </div>
            <div className='form-group1'>
              <p><span style={{marginRight:'42px'}}><label>Order Start Date :</label></span>
              {data?.OrderStartDate || 'N/A'}</p>
            </div>
            <div className='form-group1'>
            <p><span style={{marginRight:'46px'}}><label>Order End Date :</label></span>
              {data?.endDate ? new Date(data.endDate).toISOString().slice(0,10):'N/A'}</p>
            </div>
            <div className='form-group1'>
            <p><span style={{marginRight:'80px'}}><label>1st Quality :</label></span>
              {data?.['1stQuality'] || '0'}</p>
            </div>
            <div className='form-group1'>
              <p><span style={{marginRight:'80px'}}><label>2nd Quality :</label></span>
              {data?.['2ndQuality'] || '0'}</p>
            </div>
            <div className='form-group1'>
              <p><span style={{marginRight:'93px'}}><label>Rejection :</label></span>
              {data?.Rejection || '0'}</p>
            </div>
            <div className='form-group1'>
              <p><span style={{marginRight:'85px'}}><label>Customer :</label></span>
              {extraData?.customer || 'N/A'}</p>
            </div>
            <div className='form-group1'>
            <p><span style={{marginRight:'40px'}}><label>Order Category :</label></span>
            {extraData?.orderCategory || 'N/A'}</p>
              </div>

         {/* Order Type Field */}
         <div className='form-group1'>
         <p><span style={{marginRight:'73px'}}><label>Order Type :</label></span>
                 {extraData?.orderType || 'N/A'}</p>
              </div>

            <div className='form-group1'>
              <p><span style={{marginRight:'125px'}}><label>SMV :</label></span>
              {extraData?.smv || 'N/A'}</p>
            </div>
            
          </form></center>
                  {/* Full Summary Logic */}
                  <div style={{ marginTop: "20px" }}>
                    <h3>Cut Details</h3>
                    {cutDetails.length > 0 ? (
                      cutDetails.map((cut, index) => (
                        <div
                          key={index}
                          style={{
                            border: "1px solid black",
                            padding: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          <p>
                            <strong>Cut Number:</strong> {cut.cutNumber}
                          </p>
                          <p>
                            <strong>No of Pieces:</strong> {cut.noOfPieces}
                          </p>
                          <p>
                            <strong>Ratio:</strong> {cut.ratio}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p>No cut details available.</p>
                    )}
                  </div>
                </div>
              ) : (
                // Display data for each line in a separate table
                Object.entries(data).map(([line, details]) => {
                  const firstQuality = details["1stQuality"] || 0;
                  const secondQuality = details["2ndQuality"] || 0;
                  const rejection = details["Rejection"] || 0;
                  const totalSum = firstQuality + secondQuality + rejection;
  
                  // Calculate percentages
                  const firstQualityPercentage =
                    totalSum > 0
                      ? ((firstQuality / totalSum) * 100).toFixed(2)
                      : "N/A";
                  const rejectionPercentage =
                    totalSum > 0
                      ? ((rejection / totalSum) * 100).toFixed(2)
                      : "N/A";
  
                  return (
                    <div key={line}>
                      <h4>{line}</h4>
                      <table border="1">
                        <thead>
                          <tr>
                            <th>Order Number</th>
                            <th>Production PO</th>
                            <th>1st Quality</th>
                            <th>2nd Quality</th>
                            <th>Rejection</th>
                            <th>First Quality Percentage</th>
                            <th>Rejection Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{orderNumber}</td>
                            <td>{productionPo}</td>
                            <td>{details["1stQuality"]}</td>
                            <td>{details["2ndQuality"]}</td>
                            <td>{details["Rejection"]}</td>
                            <td>{firstQualityPercentage}%</td>
                            <td>{rejectionPercentage}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                })
              )}
            </div>
          )
        ) : (
          <div>
            {completeOrdersData ? (
              <table
                border={1}
                width="95%"
                align="center"
                className="summaryTbl"
              >
                <thead>
                  <tr>
                    <th>Order Number</th>
                    <th>Size</th>
                    <th>Style Number</th>
                    <th>Colour</th>
                    <th>Colour Code</th>
                    <th>Production PO</th>
                    <th>Italy PO</th>
                    <th>Rejection</th>
                    <th>1st Quality</th>
                    <th>2nd Quality</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(completeOrdersData).map((orderNumber) =>
                    Object.keys(completeOrdersData[orderNumber]).map(
                      (orderId) => {
                        const order =
                          completeOrdersData[orderNumber][orderId];
                        return (
                          <tr key={orderId}>
                            <td>{orderNumber}</td>
                            <td>{order.size}</td>
                            <td>{order.styleNumber}</td>
                            <td>{order.colour}</td>
                            <td>{order.colourCode}</td>
                            <td>{order.productionPO}</td>
                            <td>{order.italyPo}</td>
                            <td>{order.Rejection}</td>
                            <td>{order["1stQuality"]}</td>
                            <td>{order["2ndQuality"]}</td>
                            <td>{order.OrderStartDate}</td>
                            <td>
                              {order.endDate
                                ? new Date(order.endDate)
                                    .toISOString()
                                    .slice(0, 10)
                                : "N/A"}
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
            ) : (
              <p>No orders available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
};

export default Summary;
