import React, { useState,useContext } from 'react';
import './Orderdetails.css'; 
import { database } from '../Firebase';
import { get,ref, push } from 'firebase/database';
import Titlepic from './Titlepic';
import SignOut from './SignOut';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../components/UserDetails';
import welcome from '../components/Images/img101.png';

export const Orderdetails = () => {
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

  // const handleSubmit = (e) => {
    
  //   e.preventDefault();
  //   const orderRef = ref(database, 'orders');
  //   const newOrder = {
  //     orderNumber,
  //     customer,
  //     orderType: showCustomOrderTypeInput ? customOrderType : orderType,
  //     orderCategory: showCustomOrderCategoryInput ? customOrderCategory : orderCategory,
  //     styleNumber,
  //     productCategory,
  //     colour,
  //     size,
  //     smv,
  //     italyPO,
  //     orderQuantity,
  //     colourCode,
  //     productionPO,
  //     psd,
  //     ped
  //   };
  //   push(orderRef, newOrder)
  //     .then(() => {
  //       console.log('Order added successfully');
  //       // Optionally, reset the form
  //       setOrderNumber('');
  //       setCustomer('');
  //       setOrderType('');
  //       setCustomOrderType('');
  //       setOrderCategory('');
  //       setCustomOrderCategory('');
  //       setStyleNumber('');
  //       setProductCategory('');
  //       setColour('');
  //       setSize('');
  //       setSmv('');
  //       setItalyPO('');
  //       setOrderQuantity('');
  //       setColourCode('');
  //       setProductionPO('');
  //       setPsd('');
  //       setPed('');
  //     })
  //     .catch((error) => {
  //       console.error('Error adding order: ', error);
  //     });
  //     navigate('/pages/OrderHome', { replace: true });
    
  // };
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const orderRef = ref(database, 'orders');
    const newOrder = {
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
    };
  
    try {
      // Check if the orderNumber already exists
      const snapshot = await get(orderRef);
      if (snapshot.exists()) {
        const orders = snapshot.val();
        const orderExists = Object.values(orders).some(
          (order) => order.orderNumber === orderNumber
        );
  
        if (orderExists) {
          alert(`Order number ${orderNumber} already exists!`);
          return;
        }
      }
  
      // Add the new order
      await push(orderRef, newOrder);
      console.log('Order added successfully');
  
      // Optionally, reset the form
      setOrderNumber('');
      setCustomer('');
      setOrderType('');
      setCustomOrderType('');
      setOrderCategory('');
      setCustomOrderCategory('');
      setStyleNumber('');
      setProductCategory('');
      setColour('');
      setSize('');
      setSmv('');
      setItalyPO('');
      setOrderQuantity('');
      setColourCode('');
      setProductionPO('');
      setPsd('');
      setPed('');
  
      // Navigate to OrderHome
      navigate('/pages/OrderHome', { replace: true });
    } catch (error) {
      console.error('Error adding order: ', error);
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
      <Titlepic/>
      <SignOut/>
      {/* Header with photo and gradient background */}


      {/* Order details */}
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

          <h2>Add Order</h2>
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
            {/* <div className='form-group1'>
              <label>Order Type</label>
              <select value={orderType} onChange={(e) => setOrderType(e.target.value)} required>
                <option value=''>Select Order Type</option>
                <option value='External'>External</option>
                <option value='Internal'>Internal</option>
                <option value='Other'>Other</option>
                {/* Add options as needed 
              </select>
            </div> */}

         {/* Order Type Field */}
         <div className='form-group1'>
                <label>Order Type</label>
                {showCustomOrderTypeInput ? (
                  <input 
                    type='text' 
                    placeholder='Enter Order Type' 
                    value={customOrderType} 
                    onChange={(e) => setCustomOrderType(e.target.value)} 
                    required 
                  />
                ) : (
                  <select value={orderType} onChange={handleOrderTypeChange} required>
                    <option value=''>Select Order Type</option>
                    <option value='External'>External</option>
                    <option value='Internal'>Internal</option>
                    <option value='Other'>Other</option>
                  </select>
                )}
              </div>

                    {/* Order Category Field */}
                    <div className='form-group1'>
                <label>Order Category</label>
                {showCustomOrderCategoryInput ? (
                  <input 
                    type='text' 
                    placeholder='Enter Order Category' 
                    value={customOrderCategory} 
                    onChange={(e) => setCustomOrderCategory(e.target.value)} 
                    required 
                  />
                ) : (
                  <select value={orderCategory} onChange={handleOrderCategoryChange} required>
                    <option value=''>Select Order Category</option>
                    <option value='1st Quality'>1st Quality</option>
                    <option value='Outlet'>Outlet</option>
                    <option value='Other'>Other</option>
                  </select>
                )}
              </div>

            {/* <div className='form-group1'>
              <label>Order Category</label>
              <select value={orderCategory} onChange={(e) => setOrderCategory(e.target.value)} required>
                <option value=''>Select Order Category</option>
                <option value='category'>category</option>
                {/* Add options as needed 
              </select>
            </div> */}
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
              <label>Italy PO</label>
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
            <button type='submit'>Add</button>
          </form>
        </div>
       
      </div> <br></br><br></br>
    </div>
    </div>
  );
};

export default Orderdetails;



