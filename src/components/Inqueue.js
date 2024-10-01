import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../Firebase'; // Assuming you've initialized Firebase
import Titlepic from './Titlepic';
import SignOut from './SignOut';
import { Helmet } from 'react-helmet';

const InqueueTable = () => {
  const [linesData, setLinesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInqueueData();
  }, []);

  // Fetch data from the Inqueue node in Firebase
  const fetchInqueueData = async () => {
    const inqueueRef = ref(database, 'Inqueue');
    try {
      const snapshot = await get(inqueueRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Fetch additional order details for each bundle
        await fetchOrderDetailsForBundles(data);
      } else {
        setError('No data found in Inqueue.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching Inqueue data:', err);
      setError('Error fetching data.');
      setLoading(false);
    }
  };

  // Function to fetch additional order details for each bundle
  const fetchOrderDetailsForBundles = async (linesData) => {
    const updatedLinesData = { ...linesData };

    for (const lineKey of Object.keys(linesData)) {
      const bundles = linesData[lineKey];

      for (const bundleId of Object.keys(bundles)) {
        const bundle = bundles[bundleId];
        //const orderNumber = bundle.orderNumber;
        const { orderNumber, italyPo, productionPo } = bundle;

      if (!orderNumber || !italyPo || !productionPo) {
        console.warn('Missing data in bundle:', bundle);
        continue;
      }

        // Fetch additional order details from the 'orders' node using the orderNumber
        const orderDetails = await fetchOrderDetails(orderNumber,italyPo,productionPo);

        // Merge the additional order details into the bundle data
        updatedLinesData[lineKey][bundleId] = {
          ...bundle,
          ...orderDetails, // Add the fetched order details to the bundle
        };
      }
    }

    // Update the state with the combined data
    setLinesData(updatedLinesData);
    setLoading(false);
  };

  // Function to fetch order details based on orderNumber
const fetchOrderDetails = async (orderNumber,italyPo,productionPo) => {
    const ordersRef = ref(database, 'orders'); // Reference to all orders
    try {
      const snapshot = await get(ordersRef);
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        // Loop through the orders to find the matching orderNumber
        for (const orderId in ordersData) {
          const order = ordersData[orderId];
          if (order.orderNumber === orderNumber &&
            order.italyPO === italyPo &&
            order.productionPO === productionPo) {
            // Order found, return the details
            return {
              styleNumber: order.styleNumber || 'N/A',
              italypo: order.italyPO || 'N/A',
               productionpo: order.productionPO || 'N/A',
              color: order.colour || 'N/A',
              colorCode: order.colourCode || 'N/A',
            };
          }
        }
        // If no matching order is found, return N/A
        console.warn(`No order details found for Order Number: ${orderNumber}`);
        return {
          styleNumber: 'N/A',
          color: 'N/A',
          colorCode: 'N/A',
        };
      } else {
        console.warn('No orders found in the database.');
        return {
          styleNumber: 'N/A',
          color: 'N/A',
          colorCode: 'N/A',
        };
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      return {
        styleNumber: 'N/A',
        color: 'N/A',
        colorCode: 'N/A',
      };
    }
  };
  

  // Render the tables for each line with additional order details
  const renderTablesForLines = () => {
    return Object.keys(linesData).map((lineKey) => {
      const bundles = linesData[lineKey];
      return (
        <div key={lineKey}>
          <h2>{lineKey}</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Bundle ID</th>
                <th>Order Number</th>
                <th>Size</th>
                <th>Number of Pieces</th>
                <th>Style Number</th>
                <th>Italy PO</th>
                <th>Production PO</th>
                <th>Color</th>
                <th>Color Code</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(bundles).map(([bundleId, bundleDetails]) => (
                <tr key={bundleId}>
                  <td>{bundleId}</td>
                  <td>{bundleDetails.orderNumber}</td>
                  <td>{bundleDetails.size}</td>
                  <td>{bundleDetails.noOfPieces}</td>
                  <td>{bundleDetails.styleNumber}</td>
                  <td>{bundleDetails.italypo}</td>
                  <td>{bundleDetails.productionpo}</td>
                  <td>{bundleDetails.color}</td>
                  <td>{bundleDetails.colorCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    });
  };

  return (
    <div>
      <Helmet>
        <title>Inqueue </title>
      </Helmet>
      <Titlepic />
      <SignOut />
      <h1>Inqueue Bundles Data</h1>
      {loading && <p>Loading data...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && renderTablesForLines()}
    </div>
  );
};

export default InqueueTable;
