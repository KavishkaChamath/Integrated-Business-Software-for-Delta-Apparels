import React from "react";
import { useNavigate } from 'react-router-dom';
import ShowOrder from "../components/ShowOder";
import Titlepic from "../components/Titlepic";
import SignOut from "../components/SignOut";

export default function EmployeeHome(){

    const navigate = useNavigate();
    const handleClick = () => navigate('/components/Orderdetails');

    return(
        <div className="holder">
            <Titlepic />
            <SignOut />
            <center><h2> Order List</h2></center>
            <button className="AddOrder" onClick={handleClick}>Add Order</button>
            <ShowOrder/>
           
        </div>
    )
}