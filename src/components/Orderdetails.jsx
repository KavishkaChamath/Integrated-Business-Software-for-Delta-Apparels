// import React from 'react';
// import './Orderdetails.css'; 



// export const Orderdetails = () => {
//   return (
//     <div>
      
//       {/* Header with photo and gradient background */}
//       <header className="header">
//         <div className="header-content">
//           <h1>Order Details</h1>
//         </div>
//       </header>

//       {/* Order details */}
//       <div className='wrapper'>
//         <div className="transparent-box">
//           <h2>Add Order</h2>
//           <form className='order-form'>
//             <div className='form-group1'>
//               <label>Order Number </label>
//               <input type='text' placeholder='Order Number' required />
//             </div>
//             <div className='form-group1'>
//               <label>Customer </label>
//               <input type='text' placeholder='Customer' required />
//             </div>
//             <div className='form-group1'>
//               <label>Order type  </label>
//               <select required>
//                 <option value=''>Select Designation</option>
//               </select>
//             </div>
//             <div className='form-group1'>
//               <label>Order Category</label>
//               <select required>
//                 <option value=''>Select Designation</option>
//               </select>
//             </div>
//             <div className='form-group1'>
//               <label>Style Number </label>
//               <input type='text' placeholder='Style Number' required />
//             </div>
//             <div className='form-group1'>
//               <label>Product Category</label>
//               <input type='text' placeholder='Product Category' required />
//             </div>
//             <div className='form-group1'>
//               <label>Colour  </label>
//               <input type='text' placeholder='Colour' required />
//             </div>
//             <div className='form-group1'>
//               <label>Size</label>
//               <input type='text' placeholder='Size' required />
//             </div>
//             <div className='form-group1'>
//               <label>SMV</label>
//               <input type='text' placeholder='SMV' required />
//             </div>
//             <div className='form-group1'>
//               <label>Ithaly PO</label>
//               <input type='text' placeholder='Ithaly PO' required />
//             </div>
//             <div className='form-group1'>
//               <label>Order Quantity</label>
//               <input type='text' placeholder='Order Quantity' required />
//             </div>
//             <div className='form-group1'>
//               <label>PSD</label>
//               <input type='text' placeholder='PSD' required />
//             </div>
//             <div className='form-group1'>
//               <label>Colour Code</label>
//               <input type='text' placeholder='Colour Code' required />
//             </div>
//             <div className='form-group1'>
//               <label>Production PO</label>
//               <input type='text' placeholder='Production PO' required />
//             </div>
//             <div className='form-group1'>
//               <label>PED</label>
//                <input type='text' placeholder='PED' required />
//             </div>
//             <button type='submit'>Add</button>
//           </form>
//         </div>
//       </div>
    
//     </div>
//   );
// };

// export default Orderdetails;




import React, { useState } from 'react';
import './Orderdetails.css'; 
import { database } from '../Firebase';
import { ref, push } from 'firebase/database';
import Titlepic from './Titlepic';
import SignOut from './SignOut';
import { useNavigate } from 'react-router-dom';

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

  const handleSubmit = (e) => {
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
    push(orderRef, newOrder)
      .then(() => {
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
      })
      .catch((error) => {
        console.error('Error adding order: ', error);
      });
      navigate('/pages/OrderHome');
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
      <div className='wrapper'>
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
      </div>
    </div>
    </div>
  );
};

export default Orderdetails;



