import React, { useState } from 'react';
import { get, ref } from 'firebase/database';
import { database } from '../../Firebase'; // Adjust this import according to your Firebase configuration file

const Summary = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [productionPo, setProductionPo] = useState('');
  const [summaryType, setSummaryType] = useState('');
  const [data, setData] = useState(null);
  const [extraData, setExtraData] = useState(null);
  const [cutDetails, setCutDetails] = useState([]);

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
    <div>
      <h2>Order Summary</h2>
      <div>
        <input
          type="text"
          placeholder="Enter Order Number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Production PO"
          value={productionPo}
          onChange={(e) => setProductionPo(e.target.value)}
        />
        <select
          value={summaryType}
          onChange={(e) => setSummaryType(e.target.value)}
        >
          <option value="">Select Summary Type</option>
          <option value="Full Summary">Full Summary</option>
          <option value="Line Summary">Line Summary</option>
        </select>
        <button onClick={handleSearch}>Search</button>
      </div>

      {data && (
        <div>
          <h3>Order Details</h3>
          {summaryType === 'Full Summary' ? (
            <div style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 20px' }}>
              {/* <p><strong>Order Number:</strong></p> <p>{orderNumber}</p>
              <p><strong>Production PO:</strong></p> <p>{productionPo}</p>
              <p><strong>Italy Po:</strong></p> <p>{data.italyPo}</p>
              <p><strong>Colour:</strong></p> <p>{data.colour}</p>
              <p><strong>Colour Code:</strong></p> <p>{data.colourCode}</p>
              <p><strong>Size:</strong></p> <p>{data.size}</p>
              <p><strong>Style Number:</strong></p> <p>{data.styleNumber}</p>
              <p><strong>Quantity:</strong></p> <p>{extraData.orderQuantity}</p>
              <p><strong>Order Start Date:</strong></p> <p>{data['OrderStartDate']}</p>
              <p><strong>Order End Date:</strong></p> <p>{data.endDate}</p>
              <p><strong>1st Quality:</strong></p> <p>{data['1stQuality']}</p>
              <p><strong>2nd Quality:</strong></p> <p>{data['2ndQuality']}</p>
              <p><strong>Rejection:</strong></p> <p>{data['Rejection']}</p>
              <p><strong>Customer:</strong></p> <p>{extraData?.extraData.customer}</p>
              <p><strong>Order Category:</strong></p> <p>{extraData.orderCategory}</p>
              <p><strong>Order Type:</strong></p> <p>{extraData.orderType}</p>
              <p><strong>SMV:</strong></p> <p>{extraData.smv}</p>
              <p><strong>Product Category:</strong></p> <p>{extraData.productCategory}</p> */}
              
              
              <p><strong>Order Number:</strong></p> <p>{orderNumber}</p>
              <p><strong>Production PO:</strong></p> <p>{productionPo}</p>
              <p><strong>Italy Po:</strong></p> <p>{data?.italyPo || 'N/A'}</p>
              <p><strong>Colour:</strong></p> <p>{data?.colour || 'N/A'}</p>
              <p><strong>Colour Code:</strong></p> <p>{data?.colourCode || 'N/A'}</p>
              <p><strong>Size:</strong></p> <p>{data?.size || 'N/A'}</p>
              <p><strong>Style Number:</strong></p> <p>{data?.styleNumber || 'N/A'}</p>
              <p><strong>Quantity:</strong></p> <p>{extraData?.orderQuantity || 'N/A'}</p>
              <p><strong>Quantity:</strong></p> <p>{extraData?.orderQuantity || 'N/A'}</p>
              <p><strong>Order Start Date:</strong></p> <p>{data?.OrderStartDate || 'N/A'}</p>
              <p><strong>Order End Date:</strong></p> <p>{data?.endDate || 'N/A'}</p>
              <p><strong>1st Quality:</strong></p> <p>{data?.['1stQuality'] || '0'}</p>
              <p><strong>2nd Quality:</strong></p> <p>{data?.['2ndQuality'] || '0'}</p>
              <p><strong>Rejection:</strong></p> <p>{data?.Rejection || '0'}</p>
              <p><strong>Customer:</strong></p> <p>{extraData?.customer || 'N/A'}</p>
              <p><strong>Order Category:</strong></p> <p>{extraData?.orderCategory || 'N/A'}</p>
              <p><strong>Order Type:</strong></p> <p>{extraData?.orderType || 'N/A'}</p>
              <p><strong>SMV:</strong></p> <p>{extraData?.smv || 'N/A'}</p>
              <p><strong>Product Category:</strong></p> <p>{extraData?.productCategory || 'N/A'}</p>
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
    </div>
  );
};

export default Summary;
