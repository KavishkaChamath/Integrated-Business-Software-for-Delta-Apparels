import Titlepic from "../components/Titlepic";
import React, {useContext} from 'react'
import { useNavigate } from 'react-router-dom';
import SignOut from "../components/SignOut";
import './pages.css'
import { Helmet } from "react-helmet";

import { UserContext } from '../components/UserDetails';

export default function ItHome(){

    const { user } = useContext(UserContext);

    const navigate = useNavigate();
    const handleClick = () => navigate('/pages/EmployeeHome');
    const handleClick1 = () => navigate('/pages/OrderHome');
    const handleClick2 = () => navigate('/pages/CutHome');
    return(
        <div className="holder">
        <div>
            <Helmet>
                <Titlepic>It Home</Titlepic>
            </Helmet>
            <Titlepic/>
            <SignOut/>
            <div className="Ithome2">

            <button className="empbutton" onClick={handleClick}>Employee Detalis</button>
            <button className="orderbutton" onClick={handleClick1}>Order Detalis</button>
            <button className="cutbutton" onClick={handleClick2}>Cut Detalis</button>
            </div>
        </div>
        <div className="footer">
        <p>&copy; 2024 Delta Apparels</p>
      </div>
        </div>
    )
}