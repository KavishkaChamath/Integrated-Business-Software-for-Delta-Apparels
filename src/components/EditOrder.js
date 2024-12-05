import React, { useState, useEffect,useContext } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
import { ref, update } from 'firebase/database';
import { database } from '../Firebase'; 

import Titlepic from './Titlepic';
import SignOut from './SignOut';
import { Helmet } from 'react-helmet';

import { UserContext } from '../components/UserDetails';
import welcome from '../components/Images/img101.png';

const EditOrder = () => {
  const location = useLocation();
  const { orderData } = location.state || {};

  const [orderNumber, setOrderNumber] = useState('');
  const [customer, setCustomer] = useState('');
  const [orderType, setOrderType] = useState('');
  const [customOrderType, setCustomOrderType] = useState('');
  const [orderCategory, setOrderCategory] = useState('');
  const [customOrderCategory, setCustomOrderCategory] = useState('');
  const [styleNumber, setStyleNumber] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [colour, setColour] = useState('');
  const [size, setSize] = useState('');
  const [smv, setSmv] = useState('');
  const [italyPO, setItalyPO] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [colourCode, setColourCode] = useState('');
  const [productionPO, setProductionPO] = useState('');
  const [psd, setPsd] = useState('');
  const [ped, setPed] = useState('');
  const [showCustomOrderTypeInput, setShowCustomOrderTypeInput] = useState(false);
  const [showCustomOrderCategoryInput, setShowCustomOrderCategoryInput] = useState(false);

  const navigate = useNavigate();

  const { user } = useContext(UserContext);
  
  useEffect(() => {
    if (orderData) {
     setOrderNumber(orderData.orderNumber || '');
     setCustomer(orderData.customer || '');
     setOrderType(orderData.orderType || '');
     setCustomOrderType(orderData.customOrderType || '');
     setOrderCategory(orderData.orderCategory || '');
     setCustomOrderCategory(orderData.customOrderCategory || '');
     setStyleNumber(orderData.styleNumber || '');
     setProductCategory(orderData.productCategory|| '');
     setColour(orderData.colour || '');
     setSize(orderData.size || '');
     setSmv(orderData.smv || '');
     setItalyPO(orderData.italyPO || '');
     setOrderQuantity(orderData.orderQuantity|| '');
     setColourCode(orderData.colourCode|| '');
     setProductionPO(orderData.productionPO|| '');
     setPsd(orderData.psd|| '');
     setPed(orderData.ped|| '');
     
    }
  }, [orderData]);


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



  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (orderData && orderData.id) {
      const orderRef = ref(database, `orders/${orderData.id}`);
      update(orderRef, {
        orderNumber,
        customer,
        orderType: showCustomOrderTypeInput ? customOrderType : orderType,
        orderCategory: showCustomOrderCategoryInput ? customOrderCategory : orderCategory,
        styleNumber,
        productCategory,
        colour,
        size,
        smv,
        italyPO,
        orderQuantity,
        colourCode,
        productionPO,
        psd,
        ped
      })
      .then(() => {
        alert('Order data updated successfully');
        navigate('/pages/OrderHome');
      })
      .catch((error) => {
        console.error('Error updating order data:', error);
      });
    }
  };

  const handleOrderTypeChange = (e) => {
    const selectedType = e.target.value;
    setOrderType(selectedType);
    
    if (selectedType === 'Other') {
      setShowCustomOrderTypeInput(true);
      setCustomOrderType(''); // Reset custom order type if "Other" is selected
    } else {
      setShowCustomOrderTypeInput(false);
    }
  };

  const handleOrderCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setOrderCategory(selectedCategory);
    
    if (selectedCategory === 'Other') {
      setShowCustomOrderCategoryInput(true);
      setCustomOrderCategory(''); // Reset custom order category if "Other" is selected
    } else {
      setShowCustomOrderCategoryInput(false);
    }
  };

  const handleDateInput = (e) => {
    const value = e.target.value;
    if (value.length === 4) {
      // Automatically move cursor to the month part (if supported by browser)
      e.target.value += '-'; // Adding a hyphen to move to the month
    }
  };

  return (
    
    <div>
      <Helmet>
        <title>Edit Order</title>
      </Helmet>
      <Titlepic/>
      <SignOut/>

      <div className='holder'>
      <table border={0} width='100%' align="right" >
        <tr>
            <th></th>
            <th width='300px'></th>
            <th></th>
            <th className='welImg' width='50px'><img src={welcome} alt="Description of the image"/></th>
          <th width='100px'><p className='welcomeName'>{user?.username || 'User'}</p></th>
        </tr>
        </table>
      <button className='homeBtn' onClick={navigateHome}>
              Home
      </button>
      <div className='ordwrapper'>
        <div className="transparent-box">
          <h2>Edit Order</h2>
          <form className='order-form' onSubmit={handleSubmit}>
            <div className='form-group1'>
              <label>Order Number</label>
              <input type='text' placeholder='Order Number' value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Customer</label>
              <input type='text' placeholder='Customer' value={customer}
                onChange={(e) => setCustomer(e.target.value)} required />
            </div>
         {/* Order Type Field */}
         <div className='form-group1'>
                <label>Order Type</label>
                  <input 
                    type='text' 
                    placeholder='Enter Order Type' 
                    value={orderType} 
                    onChange={(e) => setOrderType(e.target.value)} 
                    required 
                  />              
              </div>

                    {/* Order Category Field */}
                    <div className='form-group1'>
                <label>Order Category</label>
                  <input 
                    type='text' 
                    placeholder='Enter Order Category' 
                    value={orderCategory} 
                    onChange={(e) => setOrderCategory(e.target.value)} 
                    required 
                  />       
              </div>
            <div className='form-group1'>
              <label>Style Number</label>
              <input type='text' placeholder='Style Number' value={styleNumber}
                onChange={(e) => setStyleNumber(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Product Category</label>
              <input type='text' placeholder='Product Category' value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Colour</label>
              <input type='text' placeholder='Colour' value={colour}
                onChange={(e) => setColour(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Size</label>
              <input type='text' placeholder='Size' value={size}
                onChange={(e) => setSize(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>SMV</label>
              <input type='text' placeholder='SMV' value={smv}
                onChange={(e) => setSmv(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Ithaly PO</label>
              <input type='text' placeholder='Italy PO' value={italyPO}
                onChange={(e) => setItalyPO(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Order Quantity</label>
              <input type='text' placeholder='Order Quantity' value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Colour Code</label>
              <input type='text' placeholder='Colour Code' value={colourCode}
                onChange={(e) => setColourCode(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Production PO</label>
              <input type='text' placeholder='Production PO' value={productionPO}
                onChange={(e) => setProductionPO(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>PSD</label>
              <input type='date'  placeholder='PSD' value={psd}
                onChange={(e) => {setPsd(e.target.value); handleDateInput(e);
                }} 
                required 
                max="9999-12-31" />
            </div>
            <div className='form-group1'>
              <label>PED</label>
              <input type='date' placeholder='PED' value={ped}
                onChange={(e) => {setPed(e.target.value); handleDateInput(e);
                }} 
                required 
                max="9999-12-31" />
            </div>
            <button type='submit'>Save</button>
          </form>
        </div>
      </div>
    </div>
    </div>
    );
};

export default EditOrder;
