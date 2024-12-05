import React, { useState, useEffect } from 'react';
import { get, ref, onValue } from 'firebase/database';
import { database } from '../../Firebase';
import { Helmet } from 'react-helmet';
import Titlepic from '../Titlepic';
import SignOut from '../SignOut';

const LineOperationsTable = () => {
  const [lineOperationsData, setLineOperationsData] = useState(null);
  const [ordersData, setOrdersData] = useState({});
  const [lineSummaryData, setLineSummaryData] = useState({});
  const [loading, setLoading] = useState(true);

  const [orderNumber, setOrderNumber] = useState('');
  const [productionPo, setProductionPo] = useState('');
  const [summaryType, setSummaryType] = useState('');
  const [data, setData] = useState(null);

  const [extraData, setExtraData] = useState(null);
  const [cutDetails, setCutDetails] = useState([]);

  const [matchingBundles, setMatchingBundles] = useState([]);

  const [productionPoOptions, setProductionPoOptions] = useState([]);
  
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
    // Fetch data from Line Operations node
    const lineOperationsRef = ref(database, 'Line Operations');
    const unsubscribeLineOperations = onValue(lineOperationsRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log('Line Operations Data:', snapshot.val());
        setLineOperationsData(snapshot.val());
      } else {
        console.log('No data available in Line Operations');
        setLineOperationsData(null);
      }
    });

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
      setLoading(false);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeLineOperations();
      unsubscribeOrders();
    };
  }, []);

  useEffect(() => {
    // Fetch Line Summary data using order numbers and production POs from loaded data
    if (lineOperationsData) {
      const newLineSummaryData = {};
      Object.entries(lineOperationsData).forEach(([orderNumber, productionPos]) => {
        Object.entries(productionPos).forEach(([productionPo]) => {
          const lineSummaryRef = ref(database, `Line Summary/${orderNumber}/${productionPo}`);
          onValue(lineSummaryRef, (snapshot) => {
            if (snapshot.exists()) {
              newLineSummaryData[`${orderNumber}-${productionPo}`] = snapshot.val();
            }
          });
        });
      });
      setLineSummaryData(newLineSummaryData);
    }
  }, [lineOperationsData]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!lineOperationsData) {
    return <p>No data available</p>;
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
      const completeOperationsRef = ref(database, `Line Operations/${orderNumber}/${productionPo}`);
      const snapshot = await get(completeOperationsRef);
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

    } else if (summaryType === 'Line Summary') {
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

  async function fetchAndDisplayData(orderNumber, productionPo) {
    if (!orderNumber || !productionPo) {
      alert('Please enter the order number and production PO.');
      return;
    }
    const currentOperationsRef = ref(database, 'currentOperations');

    try {
      const snapshot = await get(currentOperationsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const bundles = [];

        // Loop through lines in currentOperations
        Object.entries(data).forEach(([line, bundlesData]) => {
          // Loop through bundles in each line
          Object.entries(bundlesData).forEach(([bundleId, bundleDetails]) => {
            if (
              bundleDetails.orderId === orderNumber &&
              bundleDetails.productionPO === productionPo
            ) {
              // If order number and production PO match, store the bundle details
              bundles.push({
                line,
                bundleId,
                firstQuality: bundleDetails['1stQuality'] || 0,
                secondQuality: bundleDetails['2ndQuality'] || 0,
                rejection: bundleDetails['Rejection'] || 0
              });
            }
          });
        });

        if (bundles.length > 0) {
          // Set the matching bundles to state
          setMatchingBundles(bundles);
        } else {
          console.log("No matching bundles found for the specified Order Number and Production PO");
          setMatchingBundles([]); // Clear the previous results
        }
      } else {
        alert('No data found in current operations.');
      }
    } catch (error) {
      console.error('Error retrieving data from Firebase:', error);
    }
  }



  return (

      <div className="holder">
            <div>
      <Helmet>
        <title>Order Status</title>
      </Helmet>
      <Titlepic />
      <SignOut />
      <div>
        <br></br>
        <input
          type="text"
          placeholder="Enter Order Number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
        />
            {productionPoOptions.length > 0 ? (
            <select value={productionPo} onChange={(e) => setProductionPo(e.target.value)}>
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
        <button className="search" onClick={handleSearch}>Search</button>
        <button className="load" onClick={() => fetchAndDisplayData(orderNumber, productionPo)}>Load Current Bundle Data</button>

      </div>
      <div className='OngoingTbl'>
      <center><h3>Ongoing Operations Data</h3></center>
      <table border="1" align="center" style={{ borderCollapse: 'collapse', width: '95%' }}>
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Production PO</th>
            <th>Italy PO</th>
            <th>Quantity</th>
            <th>Colour</th>
            <th>Colour Code</th>
            <th>Size</th>
            <th>Style Number</th>
            <th>1st Quality</th>
            <th>2nd Quality</th>
            <th>Rejection</th>
            <th>First Quality Percentage</th>
            <th>Completed Order Progress</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(lineOperationsData).map(([orderNumber, productionPos]) =>
            Object.entries(productionPos).map(([productionPo, details]) => {
              const italyPo = details['italyPo'];
              const matchingOrder = Object.entries(ordersData).find(
                ([key, order]) =>
                  order.orderNumber === orderNumber &&
                  order.italyPO === italyPo &&
                  order.productionPO === productionPo
              );

            //  console.log('Matching Order:', matchingOrder);

              const quantity = matchingOrder ? matchingOrder[1].orderQuantity : 'N/A';
              const firstQuality = details['1stQuality'] || 0;
              const percentage = quantity !== 'N/A' ? ((firstQuality / quantity) * 100).toFixed(2) : 'N/A';

              const secondQuality = details['2ndQuality'] || 0;
              const rejection = details['Rejection'] || 0;
              const totalSum = firstQuality + secondQuality + rejection;
              const progress = quantity !== 'N/A' ? ((totalSum / quantity) * 100).toFixed(2) : 'N/A';

              return (
                <tr key={`${orderNumber}-${productionPo}`}>
                  <td>{orderNumber}</td>
                  <td>{productionPo}</td>
                  <td>{italyPo}</td>
                  <td>{quantity}</td>
                  <td>{details['colour']}</td>
                  <td>{details['colourCode']}</td>
                  <td>{details['size']}</td>
                  <td>{details['styleNumber']}</td>
                  <td>{firstQuality}</td>
                  <td>{details['2ndQuality']}</td>
                  <td>{details['Rejection']}</td>
                  <td>{percentage + "%"}</td>
                  <td>{progress + "%"}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      </div>
    {data && (
  <div>
    <h3>Search Results</h3>
    {summaryType === 'Full Summary' ? (
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
                    {data?.endDate ? new Date(data.endDate).toISOString().slice(0,10):'Not finsh yet'}</p>
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
                <div style={{ marginTop: '20px' }}>
                    <h3>Cut Details</h3>
                    {cutDetails.length > 0 ? (
                      cutDetails.map((cut, index) => (
                        <div key={index} style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
                          <p><strong>Cut Number:</strong> {cut.cutNumber}</p>
                          <p><strong>No of Pieces:</strong> {cut.noOfPieces}</p>
                          <p><strong>Ratio:</strong> {cut.ratio}</p>
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
        const firstQuality = details['1stQuality'] || 0;
        const secondQuality = details['2ndQuality'] || 0;
        const rejection = details['Rejection'] || 0;
        const totalSum = firstQuality + secondQuality + rejection;

        // Calculate percentages
        const firstQualityPercentage = totalSum > 0 ? ((firstQuality / totalSum) * 100).toFixed(2) : 'N/A';
        const rejectionPercentage = totalSum > 0 ? ((rejection / totalSum) * 100).toFixed(2) : 'N/A';

        return ( // Added the return statement here
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
                  <td>{details['1stQuality']}</td>
                  <td>{details['2ndQuality']}</td>
                  <td>{details['Rejection']}</td>
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
)}

      {/* Conditionally render the matching bundles */}
      {matchingBundles.length > 0 && (
        <div>
          <h3>Ongoing Bundles</h3>
          {matchingBundles.map((bundle, index) => (
            <div key={index}>
              <h4>{bundle.line}</h4>
              <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th>Bundle ID</th>
                    <th>1st Quality</th>
                    <th>2nd Quality</th>
                    <th>Rejection</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{bundle.bundleId}</td>
                    <td>{bundle.firstQuality}</td>
                    <td>{bundle.secondQuality}</td>
                    <td>{bundle.rejection}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

  </div>
  </div>
    
  );
};

export default LineOperationsTable;
