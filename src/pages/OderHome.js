import React,{useContext} from "react";
import { useNavigate } from 'react-router-dom';
import ShowOrder from "../components/ShowOder";
import Titlepic from "../components/Titlepic";
import SignOut from "../components/SignOut";
import { Helmet } from "react-helmet";
import { UserContext } from '../components/UserDetails';
import welcome from '../components/Images/img101.png';

export default function EmployeeHome(){

    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const handleClick = () => navigate('/components/Orderdetails');

    return(
        <div className="holder">
            <Helmet>
                <title>Order Home</title>
            </Helmet>
            <Titlepic />
            <SignOut />
            <table border={0} width='100%' align="right" >
        <tr>
            <th></th>
            <th width='300px'><h2 className="empList">Order List</h2></th>
            <th></th>
            <th className='welImg' width='50px'><img src={welcome} alt="Description of the image"/></th>
          <th width='100px'><p className='welcomeName'>{user?.username || 'User'}</p></th>
        </tr>
        </table>
            <div className="addButton">
            <button className="AddOrder" onClick={handleClick}>Add Order</button>
            </div>
            <ShowOrder/>
           
        </div>
    )
}