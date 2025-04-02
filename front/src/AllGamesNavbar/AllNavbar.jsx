import React from "react";
import styled from "styled-components";
import { useProfile } from '../context/ProfileContext';
import { useLocation, useNavigate } from "react-router-dom";



const NavbarContainer = styled.nav`
  margin-top: 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  // background: linear-gradient(45deg, #ff3333, #ff6666, #ff9999); // Premium red gradient
  background: black; // Solid red for simplicity
  padding: 14px 20px; // Adjusted padding for better spacing
  position: fixed;
  overflow-y: auto;
  z-index: 1000;
  width: 100%;
  box-shadow: 0 2px 10px rgba(251, 247, 247, 0.2);
  top: 0; // Ensures it sticks to top
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 21px;
`;

const LogoImage = styled.img`
  height: 40px; // Default height
  width: auto;
  object-fit: contain;
  
  // Responsive logo sizes for different devices
  @media (max-width: 480px) { // Mobile
    height: 30px;
  }
  
  @media (min-width: 481px) and (max-width: 768px) { // Tablet
    height: 35px;
  }
  
  @media (min-width: 769px) and (max-width: 1024px) { // Small desktop
    height: 38px;
  }
  
  @media (min-width: 1025px) { // Large desktop
    height: 40px;
  }
`;

const BalanceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 21px;
  
  @media (max-width: 480px) {
    margin-right: 10px;
  }
`;

const BalanceText = styled.div`
  font-size: 1rem;
  font-weight: 500;
  background: linear-gradient(45deg, #fff176, #ffeb3b); // Yellow gradient for contrast
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  padding-right: 10px;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ExposureText = styled.div`
  font-size: 0.8rem;
  color: #ffffff; // Changed to white for better contrast on red background
  margin-top: 2px;
  font-weight: ${props => props.amount > 0 ? '500' : '400'};
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const WalletIcon = styled.div`
  font-size: 1.5rem;
  margin-right: 21px;
  cursor: pointer;
  transition: transform 0.3s, color 0.3s;
  color: #ffffff;
  
  &:hover {
    transform: scale(1.1);
    color: #ffebee; // Light red hover effect
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-right: 10px;
  }
`;


export default function Navbar() {
  const { profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
   
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/"); 
  };

  return (
    <NavbarContainer>
      <LogoContainer>
        {/* <LogoText>98FASTBET</LogoText> */}
        <LogoImage 
          src="../logo-txt.png" 
          className="logo-name"
          alt="Logo"
        />
      </LogoContainer>
      
      <BalanceContainer>
        <BalanceText>
          Balance: ₹{profile.walletBalance}
        </BalanceText>
        <ExposureText amount={profile.exposureBalance}>
          Exposure: ₹{profile.exposureBalance ? profile.exposureBalance.toFixed(2) : '0.00'}
        </ExposureText>
      </BalanceContainer>

      {/* <WalletIcon onClick={handleLogout}>
        
      </WalletIcon> */}
    </NavbarContainer>
  );
}