import React from "react";
import ShowData from '../components/ShowData';
import { useNavigate } from 'react-router-dom';
import SignOut from "../components/SignOut";
import Titlepic from "../components/Titlepic";
import { Helmet } from "react-helmet";
import { useContext } from 'react';

import { UserContext } from '../components/UserDetails';
import welcome from '../components/Images/img101.png';


export default function EmployeeHome(){

    const navigate = useNavigate();
    const handleClick = () => navigate('/pages/AddEmployee');
    const { user } = useContext(UserContext);

    return(
        <div className="holder">
        <div>
            <Helmet>
                <title>Employee Home</title>
            </Helmet>
            <Titlepic/>
            <SignOut/>
        

        <table border={0} width='100%' align="right" >
        <tr>
            <th></th>
            <th width='300px'><h2 className="empList">Employee List</h2></th>
            <th></th>
            <th className='welImg' width='50px'><img src={welcome} alt="Description of the image"/></th>
          <th width='100px'><p className='welcomeName'>{user?.username || 'User'}</p></th>
        </tr>
        </table>

            <div className="addButton">
            <button className="AddEmp" onClick={handleClick}>Add Employee</button>
            </div>
            <ShowData/>
           
        </div>

        </div>
        
    )
}