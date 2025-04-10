import React, { useState, useEffect, useRef, useCallback } from "react";
import "./T20.css";
import BetSection from "./RightSideBar";
import TournamentWinner from "./TournamentWinner";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import Navbar from '../AllGamesNavbar/AllNavbar';
import io from "socket.io-client";
import { OverMarketProvider, useOverMarket } from "../context/OverMarketContext";
import "react-toastify/dist/ReactToastify.css";
import { useProfile } from '../context/ProfileContext';
import axios from 'axios'
import { ToastContainer, toast } from "react-toastify";
import { crickMatchDetailData } from '../crickMatchDetail';

const socket = io(process.env.REACT_APP_BASE_URL);

const T20Content = () => {
  const [initialbalce,setInitialbalce]=useState(null);
  // const INITIAL_BALANCE = 15000;
  const { profile, fetchNameWallet } = useProfile();
  const [submitClick, setSubmitClick] = useState(0);
  const [oddsData, setOddsData] = useState({});
  const [data, setData] = useState([]);
  const [fancyData, setFancyData] = useState([]);
  const [selectedBet, setSelectedBet] = useState({ label: "", odds: "", type: "", rate: "" });
  const [stakeValue, setStakeValue] = useState("");
  const [profit, setProfit] = useState(0);
  const [myBets, setMyBets] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [TournamentWinnerClicked, setTournamentWinnerClicked] = useState(false);
  const [NormalClicked, setNormalClicked] = useState(false);
  const [balance, setBalance] = useState(15000);
  const [exposure, setExposure] = useState(0);
  const [marketOddsExposure, setMarketOddsExposure] = useState(0);
  const [overMarketExposure, setOverMarketExposure] = useState(0);
  const [prevMarketOddsExposure, setPrevMarketOddsExposure] = useState(0);
  const [prevOverMarketExposure, setPrevOverMarketExposure] = useState(0);
  const [newMarketOddsExposure, setNewMarketOddsExposure] = useState(0);
  // console.log(prevMarketOddsExposure, "prevMarketOddsExposure")
  // console.log(marketOddsExposure, "marketOddsExposure")
  
  const [backProfit, setBackProfit] = useState(0);
  const [layProfit, setLayProfit] = useState(0);
  const [team1Winnings, setTeam1Winnings] = useState(0);
  const [team2Winnings, setTeam2Winnings] = useState(0);
  const [betPopup, setBetPopup] = useState(null);
  const [sessionBets, setSessionBets] = useState([]);
  const [currentStake, setCurrentStake] = useState('');
  const [balanceChange, setBalanceChange] = useState(false);
  const [selectedBetLabel, setSelectedBetLabel] = useState('');
  const [selectedBetOdds, setSelectedBetOdds] = useState('');
  const [selectedBetType, setSelectedBetType] = useState('');
  const [insufficientBalancePopup, setInsufficientBalancePopup] = useState(false);
  const [insufficientBalanceMessage, setInsufficientBalanceMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [tiedmatchData, setTiedmatchData] = useState([]);

  const [showBetPopup, setShowBetPopup] = useState(false);

  const [bookmakerData, setBookmakerData] = useState([]);

  const openBetPopup = () => {
    setShowBetPopup(true);
  };

  const closeBetPopup = () => {
    setShowBetPopup(false);
  };

  const fetchWalletData2 = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) throw new Error('User ID not found');
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/getwalletandexposure/${userId}`);
      setInitialbalce(response.data.balance)
     
    
      console.log(response.data)
    } catch (err) {
     toast.error('Failed to fetch wallet data.');
    
    }
  };
  useEffect(() => {
    
    fetchWalletData2();
  }, [balance]);

  // console.log("marketOdddsExposore",marketOddsExposure);
  // console.log("overMarketExposure",overMarketExposure);
  const fetchWalletData = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) throw new Error('User ID not found');
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/getwalletandexposure/${userId}`);
      // setBalance(response.data.balance);
      // setMarketOddsExposure(response.data.exposureBalance)
      // setTeam1Winnings(response.data.teamAProfit)
      // setTeam2Winnings(response.data.teamBProfit)
    
      console.log(response.data)
    } catch (err) {
     toast.error('Failed to fetch wallet data.');
    
    }
  };

  useEffect(() => {
    fetchWalletData();
    
  }, []);


  const [previousBet, setPreviousBet] = useState({
    runs: null,
    profit: null,
    type: null,
    rate: null
  });

  const location = useLocation();
  const { id, iframeUrl, match } = location.state || {};
  console.log("Match ID:", id);
  console.log("Match Data:", match);

  const {
    overTeam1Winnings,
    overTeam2Winnings,
    handleOverBetPlacement,
    overMarketBets,
    calculateNetPositionForRun,
    calculateTotalExposure
  } = useOverMarket();

  const updateExposureAndBalance = useCallback(() => {
    const totalExposure = Math.abs(marketOddsExposure) + Math.abs(overMarketExposure);
    setExposure(totalExposure);
    // setBalance(initialbalce - totalExposure);
  }, [marketOddsExposure, overMarketExposure]);

  const calculateProfitLoss = useCallback((type, stake, odds, rate) => {
    const parsedStake = parseFloat(stake);
    const parsedOdds = parseFloat(odds);
    const parsedRate = parseFloat(rate);

    if (isNaN(parsedStake) || isNaN(parsedOdds) || isNaN(parsedRate)) {
      throw new Error('Invalid input values for calculation');
    }

    if (parsedRate < 100) {
      if (type.toLowerCase() === 'no') {
        return {
          profit: -parsedStake,
          loss: parsedStake,
          exposure: parsedStake,
          runs: parsedRate
        };
      } else {
        return {
          profit: (parsedStake * parsedOdds) / 100,
          loss: -parsedStake,
          exposure: parsedStake,
          runs: parsedRate
        };
      }
    }

    if (type.toLowerCase() === 'yes') {
      return {
        profit: (parsedStake * parsedOdds) / 100,
        loss: -parsedStake,
        exposure: parsedStake,
        runs: parsedRate
      };
    } else {
      return {
        profit: parsedStake,
        loss: -(parsedStake * parsedOdds) / 100,
        exposure: (parsedStake * parsedOdds) / 100,
        runs: parsedRate
      };
    }
  }, []);

  const handlePlaceBetSession = useCallback(() => {
    if (!betPopup || !betPopup.stake) return;

    try {
      const stake = parseFloat(betPopup.stake);
      const odds = parseFloat(betPopup.odds);
      const rate = parseFloat(betPopup.runs);

      if (isNaN(stake) || isNaN(odds) || isNaN(rate)) {
        throw new Error('Invalid bet values');
      }

      const { profit, loss, exposure } = calculateProfitLoss(
        betPopup.type,
        stake,
        odds,
        rate
      );

      const potentialExposure = exposure + exposure;
      if (potentialExposure > initialbalce) {
        throw new Error('Insufficient balance for this bet');
      }

      const newBet = {
        sessionId: betPopup.sessionId,
        type: betPopup.type,
        odds: odds,
        runs: rate,
        stake: stake,
        profit: profit,
        loss: loss,
        exposure: exposure,
        timestamp: new Date().toISOString(),
        isDirectDeduction: betPopup.type.toLowerCase() === 'no' && rate < 100
      };

      setSessionBets(prev => [...prev, newBet]);
      updateExposureAndBalance();
      setBetPopup(null);

    } catch (error) {
      console.error('Session bet error:', error);
      // alert(error.message);
      setInsufficientBalanceMessage(error.message);
      setInsufficientBalancePopup(true);
    }
  }, [betPopup, updateExposureAndBalance]);

  useEffect(() => {
    let totalExposure = 0;
    const groupedSessions = {};

    sessionBets.forEach((bet) => {
      const { sessionId, type, runs } = bet;
      if (!groupedSessions[sessionId]) {
        groupedSessions[sessionId] = { yes: [], no: [] };
      }
      groupedSessions[sessionId][type.toLowerCase()].push(bet);
    });

    Object.entries(groupedSessions).forEach(([sessionId, session]) => {
      const { yes, no } = session;

      if (yes.length > 0 || no.length > 0) {
        let sessionExposure = 0;
        const rate = yes.length > 0 ? yes[0].runs : (no.length > 0 ? no[0].runs : 0);

        if (rate < 100) {
          const yesStakes = yes.reduce((sum, bet) => sum + parseFloat(bet.stake), 0);
          const noStakes = no.reduce((sum, bet) => sum + parseFloat(bet.stake), 0);

          const noExposure = noStakes;
          const yesExposure = (yesStakes * parseFloat(yes[0]?.odds || 0)) / 100;

          sessionExposure = Math.max(noExposure, yesExposure);
        } else {
          let yesExposure = 0, noExposure = 0;

          yes.forEach(bet => {
            const { exposure } = calculateProfitLoss('yes', bet.stake, bet.odds, bet.runs);
            yesExposure += exposure;
          });

          no.forEach(bet => {
            const { exposure } = calculateProfitLoss('no', bet.stake, bet.odds, bet.runs);
            noExposure += exposure;
          });

          sessionExposure = Math.abs(yesExposure - noExposure);
        }

        totalExposure += sessionExposure;
      }
    });

    updateExposureAndBalance();
  }, [sessionBets, calculateProfitLoss, updateExposureAndBalance]);

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitClick((prev) => (prev + 1))
      console.log("ok1")


      if (selectedBet.label && selectedBet.odds && stakeValue > 0) {
        const userData = localStorage.getItem('user');
        if (!userData) {
  
          toast.success("User is not logged in. Please log in to place a bet.");
          return;
        }
        const objectId = JSON.parse(userData);
        const userId = objectId.id;
  
  
        const calculatedProfit = (parseFloat(stakeValue) * parseFloat(selectedBet.odds))
  
        let newBet;
        if (selectedBet.type === "khaai") {
    
            newBet = {
              userId,
              label: selectedBet.label,
              odds: parseFloat(selectedBet.odds),
              stake: ((parseFloat(selectedBet.odds) ) * parseFloat(stakeValue)).toFixed(2),
              profit: parseFloat(stakeValue),
              type: selectedBet.type,
              match: match,
              teamAprofit:-parseFloat(stakeValue),
              teamBprofit:+((parseFloat(selectedBet.odds) ) * parseFloat(stakeValue)).toFixed(2),
            };
          
        } else if (selectedBet.type === "Lgaai") {
       
            newBet = {
              userId,
              label: selectedBet.label,
              odds: parseFloat(selectedBet.odds),
              stake: parseFloat(stakeValue),
              profit: ((parseFloat(selectedBet.odds)) * parseFloat(stakeValue)).toFixed(2),
              type: selectedBet.type,
              match: match,
              teamAprofit:+((parseFloat(selectedBet.odds) ) * parseFloat(stakeValue)).toFixed(2),
              teamBprofit:-parseFloat(stakeValue),
            };
   
        } else if (selectedBet.type === "YES") {
  
          newBet = {
            userId,
            label: selectedBet.label,
            odds: parseFloat(selectedBet.rate),
            run: parseFloat(selectedBet.odds),
            stake: parseFloat(stakeValue),
            profit: ((parseFloat(selectedBet.rate) / 100) * parseFloat(stakeValue)).toFixed(2),
            type: selectedBet.type,
            match:match
          };
  
        } else if (selectedBet.type === "NO") {
  
          newBet = {
            userId,
            label: selectedBet.label,
            odds: parseFloat(selectedBet.rate),
            run: parseFloat(selectedBet.odds),
            stake: ((parseFloat(selectedBet.rate) / 100) * parseFloat(stakeValue)).toFixed(2),
            profit: parseFloat(stakeValue),
            type: selectedBet.type,
            match:match
          };
        }
  
        try {
          const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/bets`, newBet); // Send request to backend
          if (response.data.success) {
            setSelectedBet({ label: "", odds: "", type: "" });
            setStakeValue("");
            setProfit(0);
  
            toast.success("Bet placed successfully!");
            // setUserBet(newBet.label)
            // fetchBets();
            fetchNameWallet();
            // window.location.reload();
          } else {
            // alert(response.data.message || "Failed to place bet.");
            toast.error(response.data.message || "Failed to place bet.");
          }
        } catch (err) {
          console.error("Error placing bet:", err);
          toast.error("There was an error placing your bet. Please try again.");
        }
      } else {
        toast.error("Please fill in all the details (label, odds, stake). Stake must be greater than 0.");
      }

    //   if (!selectedBet.label || !stakeValue) {
    //     throw new Error("Please fill out all fields correctly!");
    //   }

    //   const stake = Number(stakeValue);
    //   if (isNaN(stake) || stake <= 0) {
    //     throw new Error("Invalid stake amount!");
    //   }

    //   if (selectedBet.isOverMarket) {
    //     const parsedRate = parseFloat(selectedBet.rate);
    //     const parsedStake = parseFloat(stakeValue);
    //     const betType = selectedBet.type.toLowerCase();
    //     const currentRuns = parseFloat(selectedBet.odds);

    //     const currentProfit = (parsedRate / 100) * parsedStake;

    //     const oppositeBets = sessionBets.filter(bet =>
    //       bet.runs === currentRuns &&
    //       bet.type.toLowerCase() !== betType
    //     );

    //     let deductionAmount = 0;

    //     if (parsedRate < 100 && previousBet.runs === currentRuns) {
    //       deductionAmount = previousBet.profit || 0;

    //       const newBalance = balance + deductionAmount;

    //       if (newBalance < 0) {
    //         setInsufficientBalanceMessage("Insufficient balance after deduction!");
    //         setInsufficientBalancePopup(true);
    //         return;
    //       }
    //     }
    //     let amountToDeduct=0;
    //     if (parsedRate < 100) {
    //        amountToDeduct = parsedStake;
    //     }
    //     const success = handleOverBetPlacement(
    //       selectedBet,
    //       stake,
    //       balance - deductionAmount,
    //       (newBalance) => {
    //         const newExposure = initialbalce - newBalance;
    //         setOverMarketExposure(Math.abs(newExposure));
    //         updateExposureAndBalance();
    //       },
    //       (newExposure) => {
    //         setOverMarketExposure(Math.abs(newExposure));
    //       }
    //     );

    //     if (success) {
    //       setPreviousBet({
    //         runs: currentRuns,
    //         profit: currentProfit,
    //         type: betType,
    //         rate: parsedRate
    //       });
    //       setBalance(balance - amountToDeduct);
    //       setSelectedBet({ label: "", odds: "" });
    //       setStakeValue("");
    //       setProfit(0);
    //     }
    //     return;
    //   }

    //   console.log("selectedBet.odds", selectedBet.odds);

    //   const decimalOdds = (Number(selectedBet.odds) );
    //   const newProfit = Math.round(stake * (decimalOdds - 1));
    //   // const newProfit = 0;
    //   console.log("newProfit", newProfit);

    //   const teamIndex = data && data.length > 0 ? data.findIndex(row => row[0] === selectedBet.label) : -1;
    //   if (teamIndex === -1) {
    //     throw new Error("Invalid team selection");
    //   }

    //   let newTeam1Winnings = team1Winnings;
    //   let newTeam2Winnings = team2Winnings;

    //   if (selectedBet.type === "Lgaai") {
    //     if (teamIndex === 0) {
    //       newTeam1Winnings = team1Winnings + newProfit;
    //       newTeam2Winnings = team2Winnings - stake;
    //     } else if (teamIndex === 1) {
    //       newTeam2Winnings = team2Winnings + newProfit;
    //       newTeam1Winnings = team1Winnings - stake;
    //     }
    //   } else if (selectedBet.type === "khaai") {
    //     if (teamIndex === 0) {
    //       newTeam1Winnings = team1Winnings - newProfit;
    //       newTeam2Winnings = team2Winnings + stake;
    //     } else if (teamIndex === 1) {
    //       newTeam2Winnings = team2Winnings - newProfit;
    //       newTeam1Winnings = team1Winnings + stake;
    //     }
    //   }

    //   const newExposure = Math.min(newTeam1Winnings, newTeam2Winnings)+Math.abs(prevMarketOddsExposure);
      
    //   if (Math.abs(newExposure) > balance  ) {
    //   if(Math.abs(Math.min(newTeam1Winnings, newTeam2Winnings)) != (marketOddsExposure+Math.abs(newExposure))){
    
    //   }else{
    //     setInsufficientBalanceMessage("Insufficient balance for this bet!");
    //     setInsufficientBalancePopup(true);
    //     return;
    //   } 
    //   }

    //   setPrevMarketOddsExposure(prevMarketOddsExposure+newExposure);
    //   setMarketOddsExposure(marketOddsExposure+Math.abs(newExposure));
    //   setBalance(balance-Math.abs(newExposure));

     

    //   console.log(prevMarketOddsExposure, "prevMarketOddsExposure")

    //   if (Math.abs(Math.min(newTeam1Winnings, newTeam2Winnings)) != marketOddsExposure) {
    //     setBalance(balance+marketOddsExposure-Math.abs(Math.min(newTeam1Winnings, newTeam2Winnings)));
    //     setMarketOddsExposure(Math.abs(Math.min(newTeam1Winnings, newTeam2Winnings)));
    //   }

    //   // setMarketOddsExposure(marketOddsExposure);
    //   // setBalance(balance);
    //   // setPrevMarketOddsExposure(marketOddsExposure);
    //   updateExposureAndBalance();
      


    //   setTeam1Winnings(newTeam1Winnings);
    //   setTeam2Winnings(newTeam2Winnings);

    //   // Close the bet popup when a button is clicked
    //   if (closeBetPopup) {
    //     closeBetPopup();
    //   }

    //   setSelectedBet({ label: "", odds: "" });
    //   setStakeValue("");
    //   setProfit(0);

    } catch (error) {
      console.error('Bet placement error:', error);
      // alert(error.message);
      setInsufficientBalanceMessage(error.message);
      setInsufficientBalancePopup(true);
    }
  }, [
    selectedBet,
    stakeValue,
    balance,
    exposure,
    data,
    team1Winnings,
    team2Winnings,
    marketOddsExposure,
    handleOverBetPlacement,
    updateExposureAndBalance,
    sessionBets,
    previousBet
  ]);




  const calculateProfit = (odds, stake) => {
    if (!odds || !stake) return 0;
    const decimalOdds = (parseFloat(odds) / 100) + 1;
    return Math.round(parseFloat(stake) * (decimalOdds - 1));
  };
  useEffect(() => {
    if (selectedBet.label) {
      console.log("selectedBet", selectedBet.label);
      setSelectedBetLabel(selectedBet.label);
    }

    if (selectedBet.odds) {
      console.log("selectedBet", selectedBet.odds);
      setSelectedBetOdds(selectedBet.odds);
    }

    if (selectedBet.type) {
      console.log("selectedBet", selectedBet.type);
      setSelectedBetType(selectedBet.type);
    }
  }, [selectedBet]);

  useEffect(() => {
    if(balance  && exposure){
      setBalanceChange(true);
    }
    console.log("balance", balance);
    console.log("stakeValue", stakeValue);
    console.log("selectedBet", selectedBet);
    console.log("team1Winnings", team1Winnings);
    console.log("team2Winnings", team2Winnings);
    console.log("balance", balance);
    console.log("exposure", exposure);
    console.log("match", match);
    console.log("balanceChange", balanceChange);
    console.log("currentStake", currentStake);
    console.log("oddsData", oddsData);
  }, [balance,exposure]);

  // console.log(submitClick, balance, balanceChange)
  useEffect(() => {

    if (balanceChange) {
      if (selectedBetType === "Lgaai" || selectedBetType === "khaai") {
        setSubmitClick((prev) => (prev + 1))
        setBalanceChange(false);
        
        // if (submitClick >= 1) {
          
          const placeBet = async () => {
            const now = new Date();
            const newBet = {
              time: now.toISOString(),
              label: selectedBetLabel,
              odds: selectedBetOdds,
              type: selectedBetType,
              stake: currentStake,
              teamAProfit: Number(team1Winnings.toFixed(2)),
              teamBProfit: Number(team2Winnings.toFixed(2)),
              balance: Number(balance.toFixed(2)),
              exposure: Number(exposure.toFixed(2)),
              marketType: 'matchOdds',
              rate: selectedBet.odds,
              userId: JSON.parse(localStorage.getItem('user'))?.id,
              match: match
            };
            // console.log("newBet", newBet);
            setMyBets((prevBets) => [...prevBets, newBet]);

            try {
              const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/laggai_khai_bets`, newBet);
                // console.log("response",newBet);
              if (response.status == 201) {
                fetchWalletData();
                toast.success("Bet placed successfully! Your updated wallet balance.");
              } else {
                toast.error(response.data.message || "Failed to place bet.");
              }
            } catch (err) {
              console.error("Error placing bet:", err);
              toast.error("Low Balance recharge Now")
            }
            fetchNameWallet();
            // Reset balanceChange after placing bet
          };
          // setSubmitClick(false)
          placeBet();
        // }
      }
    }
  }, [balanceChange, stakeValue, selectedBet, team1Winnings, team2Winnings, balance, exposure, match, currentStake]);

  useEffect(() => {
    // Use specific match ID
    const id = "1.1825900_SB";
    
    // Use data from crickMatchDetailData
    const matchData = crickMatchDetailData.result.find(match => match.id === id);
    if (matchData) {
      // Log complete match data
      // console.log("Complete Match Data:", matchData);

      // Log formatted match details
      console.log("Formatted Match Details:", {
        basicInfo: {
          matchName: matchData.event.name,
          competition: matchData.competition.name,
          startTime: new Date(matchData.start).toLocaleString(),
          status: matchData.status,
          inPlay: matchData.inPlay
        },
        teams: matchData.runners.map(runner => ({
          name: runner.name,
          odds: {
            back: runner.back.map(b => ({ price: b.price, size: b.size })),
            lay: runner.lay.map(l => ({ price: l.price, size: l.size }))
          },
          lastPriceTraded: runner.lastPriceTraded,
          totalMatched: runner.totalMatched
        })),
        marketInfo: {
          betDelay: matchData.betDelay,
          isBettable: matchData.isBettable,
          isStreamAvailable: matchData.isStreamAvailable,
          matched: matchData.matched
        }
      });

      setOddsData(matchData);
    } else {
      console.log("No match found with ID:", id);
    }

    socket.on("updateOdds", (updatedOdds) => {
      if (updatedOdds[id]) {
        setOddsData(updatedOdds[id]);
      }
    });

    return () => socket.off("updateOdds");
  }, []);

  const columnsT = ["Min: 100 Max: 25000", "Lgaai", "khaai",];
  const formattedMatchOdds = oddsData.matchOdds?.map((team) => [
    team.team_name,
    [
      (parseFloat(team.lgaai) * 100).toFixed(2),
      (parseFloat(team.lgaai) * 100).toFixed(2),
    ],
    [
      (parseFloat(team.khaai) * 100).toFixed(2),
      (parseFloat(team.khaai) * 100).toFixed(2),
    ],
  ]);

  useEffect(() => {
    setData(formattedMatchOdds || []);
  }, [oddsData]);

  useEffect(() => {
    if (selectedBet.odds && stakeValue) {
      const stake = parseFloat(stakeValue);
      const decimalOdds = (parseFloat(selectedBet.odds) / 100) + 1;
      const newProfit = Math.round(stake * (decimalOdds - 1));
      const teamIndex = data.findIndex(row => row[0] === selectedBet.label);

      let potentialLoss = 0;

      if (selectedBet.type === "Lgaai") {
        potentialLoss = stake;
      } else if (selectedBet.type === "khaai") {
        potentialLoss = newProfit;
      }

      if (potentialLoss > balance) {
        console.log('Insufficient balance');
      }

      setProfit(calculateProfit(selectedBet.odds, stakeValue));
    }
  }, [selectedBet.odds, stakeValue, balance, data, selectedBet.label, selectedBet.type]);

  const formattedFancyMarkets = oddsData.fancyMarkets?.map((market) => [
    market.session_name,
    [
      market.runsNo,
      (parseFloat(market.oddsNo) * 100).toFixed(2),
    ],
    [
      market.runsYes,
      (parseFloat(market.oddsYes) * 100).toFixed(2),
    ],
  ]);

  useEffect(() => {
    setFancyData(formattedFancyMarkets || []);
  }, [oddsData]);

  const columnstied = ["Min: 100 Max: 25000", "NO", "YES"];

  const tied = [
    ["Team A", [360], [400]],
    ["Team B", [280], [310]]
  ];

  const allBets = [...myBets, ...overMarketBets].sort((a, b) => {
    const timeA = a.timestamp || a.time;
    const timeB = b.timestamp || b.time;
    return new Date(timeB) - new Date(timeA);
  });

  useEffect(() => {
    if (insufficientBalancePopup) {
      const timer = setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => {
          setInsufficientBalancePopup(false);
          setIsClosing(false);
        }, 300); // Wait for fade-out animation to complete
      }, 2000); // Close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [insufficientBalancePopup]);

  const [matchDetails, setMatchDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const updateTimerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId = null;
    
    if (id) {
      const fetchDetails = async () => {
        try {
          console.log(`Fetching details for match ID: ${id}`);
          const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/match-details/${id}`, {
            timeout: 2000,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          // console.log("response", response.data);
          
          if (isMounted) {
            // console.log('Received match details:', response.data);
            setMatchDetails(response.data);
            setLoading(false);
            setError(null);
            setLastUpdated(new Date());
          }
          
        } catch (error) {
          if (isMounted) {
            console.error(`❌ Error fetching match details:`, error.message);
            setError("Failed to load match details. Please try again.");
            setLoading(false);
          }
        }
      };

      // Initial fetch
      fetchDetails();
      
      // Start timer for "updated X seconds ago" display
      const updateTimerId = setInterval(() => {
        if (isMounted) {
          setLastUpdated(prev => new Date(prev.getTime()));
        }
      }, 10000);
      
      // Update every 500ms (0.5 seconds)
      intervalId = setInterval(fetchDetails, 5000);
      
      // Cleanup function
      return () => {
        isMounted = false;
        clearInterval(intervalId);
        clearInterval(updateTimerId);
        console.log('Cleaned up intervals for match details');
      };
    }
  }, [id]);

  // Helper to check if odds have changed
  const hasOddsChanged = (currentOdds, previousOdds, type) => {
    if (!previousOdds) return false;
    
    if (Array.isArray(currentOdds) && Array.isArray(previousOdds)) {
      return currentOdds[0]?.price !== previousOdds[0]?.price;
    } else if (currentOdds?.price && previousOdds?.price) {
      return currentOdds.price !== previousOdds.price;
    }
    return false;
  };

  // Get class for odds that have changed
  const getChangeClass = (runner, index, type) => {
    if (!matchDetails) return '';
    
    const prevRunner = matchDetails
      .find(m => m.id === matchDetails.find(d => d.runners?.some(r => r.id === runner.id))?.id)
      ?.runners?.find(r => r.id === runner.id);
      
    if (!prevRunner) return '';
    
    const currentOdds = type === 'back' ? runner.back : runner.lay;
    const previousOdds = type === 'back' ? prevRunner.back : prevRunner.lay;
    
    if (hasOddsChanged(currentOdds, previousOdds, type)) {
      const currentPrice = Array.isArray(currentOdds) ? currentOdds[0]?.price : currentOdds?.price;
      const previousPrice = Array.isArray(previousOdds) ? previousOdds[0]?.price : previousOdds?.price;
      
      if (currentPrice > previousPrice) {
        return 'odds-increased';
      } else if (currentPrice < previousPrice) {
        return 'odds-decreased';
      }
    }
    return '';
  };

  // Format time ago for display
  const getTimeAgo = () => {
    const seconds = Math.floor((new Date() - lastUpdated) / 1000);
    
    if (seconds < 60) {
      return `${seconds}s ago`;
    } else {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ${seconds % 60}s ago`;
    }
  };

  useEffect(() => {
    if (matchDetails) {
      // Process match odds data
      const matchOddsMarket = matchDetails.find(market => 
        market.mtype === 'MATCH_ODDS' || 
        market.mtype === 'MATCH_ODDS_SB' || 
        market.name === 'Match Odds'
      );

      if (matchOddsMarket && matchOddsMarket.runners) {
        const formattedMatchOdds = matchOddsMarket.runners.map(runner => [
          runner.name,
          [
            runner.back?.[0]?.price?.toFixed(2) || '-',
            runner.back?.[0]?.price?.toFixed(2) || '-'
          ],
          [
            runner.lay?.[0]?.price?.toFixed(2) || '-',
            runner.lay?.[0]?.price?.toFixed(2) || '-'
          ]
        ]);
        setData(formattedMatchOdds);
      }

      // Process tied match data
      const tiedMatchMarket = matchDetails.find(market => 
        
        market.name === 'Tied Match'
      );    

      // console.log("tiedMatchMarket", tiedMatchMarket.runners);

      if (tiedMatchMarket && tiedMatchMarket.runners) {
        const formattedTiedMatchOdds = tiedMatchMarket.runners.map(runner => [
          runner.name,
          [
            runner.back?.[0]?.price?.toFixed(2) || '-',
            runner.back?.[0]?.size?.toFixed(2) || '-'
          ],
          [
            runner.lay?.[0]?.price?.toFixed(2) || '-',
            runner.lay?.[0]?.size?.toFixed(2) || '-'
          ]
        ]);
        setTiedmatchData(formattedTiedMatchOdds);
      }

      
      

      // Process bookmaker data
      const bookmakerMarket = matchDetails.find(market => 
        market.isBookmaker || 
        market.name === 'BOOKMAKER' || 
        market.name.includes('Bookmaker')
      );

      if (bookmakerMarket && bookmakerMarket.runners) {
        const formattedBookmakerOdds = bookmakerMarket.runners.map(runner => [
          runner.name,
          [
            runner.back?.[0]?.price?.toFixed(2) || '-',
            runner.back?.[0]?.price?.toFixed(2) || '-'
          ],
          [
            runner.lay?.[0]?.price?.toFixed(2) || '-',
            runner.lay?.[0]?.price?.toFixed(2) || '-'
          ]
        ]);
        setBookmakerData(formattedBookmakerOdds);
      }

      // Process fancy markets data
      const fancyMarkets = matchDetails.filter(market => 
        market.isFancy || 
        market.btype === 'LINE' || 
        market.mtype === 'INNINGS_RUNS' || 
        market.name.includes('Over') || 
        market.name.includes('Run')
      );

      const formattedFancyMarkets = fancyMarkets.map(market => {
        const runner = market.runners?.[0];
        
        const noLine = runner?.lay?.[0]?.line || '-';
        const noPrice = runner?.lay?.[0]?.price ? (parseFloat(runner.lay[0].price) * 1).toFixed(2) : '-';
        const yesLine = runner?.back?.[0]?.line || '-';
        const yesPrice = runner?.back?.[0]?.price ? (parseFloat(runner.back[0].price) * 1).toFixed(2) : '-';
        
        return [
          market.name,
          [noLine, noPrice],  // NO column (lay)
          [yesLine, yesPrice] // YES column (back)
        ];
      });

      setFancyData(formattedFancyMarkets);
    }
  }, [matchDetails]);

  return (
    <>
      <Navbar />
      <div className="scorecard" style={{ paddingTop: "73px" }}>
        <LiveScoreContainer>
          {iframeUrl ? (
            <iframe
              src={iframeUrl}
              width="100%"
              height="100%"
              title="Live Score"
              style={{ border: "none" }}
            ></iframe>
          ) : (
            <PlaceholderText>Live Score Not Available</PlaceholderText>
          )}
        </LiveScoreContainer>
      </div>

      {insufficientBalancePopup && (
        <PopupOverlay className={isClosing ? 'closing' : ''}>
          <PopupContainer className={isClosing ? 'closing' : ''}>
            <PopupContent>
              <PopupTitle>{insufficientBalanceMessage}</PopupTitle>
            </PopupContent>
          </PopupContainer>
        </PopupOverlay>
      )}

      {successPopup && (
        <PopupOverlay className={isClosing ? 'closing' : ''}>
          <PopupContainer className={isClosing ? 'closing' : ''} style={{ background: 'linear-gradient(135deg, rgba(42, 64, 42, 0.5), rgba(30, 47, 30, 0.5))' }}>
            <PopupContent>
              <PopupTitle style={{ color: '#4CAF50' }}>{successMessage}</PopupTitle>
            </PopupContent>
          </PopupContainer>
        </PopupOverlay>
      )}

      <div className="T20_container">
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
          style={{ top: "12%", left: "50%", transform: "translate(-50%, -50%)", position: "fixed", zIndex: 9999 }}
        />
        <div className="left_side">
          <div className="T20_header news">
            <h1>NEWS</h1>
          </div>

          {loading ? (
            <div className="loading-indicator">Loading match details...</div>
          ) : error ? (
            <div className="error-indicator">{error}</div>
          ) : matchDetails ? (
            <>
              {/* <div className="match-title">
                <h2>{matchDetails[0]?.event?.name || 'Match Details'}</h2>
                <div className="match-info">
                  <p className="match-time">
                    {new Date(matchDetails[0]?.start).toLocaleDateString()} {new Date(matchDetails[0]?.start).toLocaleTimeString()}
                  </p>
                  <p className="last-updated">Updated: {getTimeAgo()}</p>
                </div>
              </div> */}


              <div className="balance-container">
                <p>Balance: {balance}</p>
                <p>Exposure: {exposure}</p>
              </div>

              {data.length > 0 && (
                <TournamentWinner
                  title={"Match Odds"}
                  columns={columnsT}
                  data={data}
                  setSelectedBet={setSelectedBet}
                  profit={profit}
                  betFor={selectedBet}
                  stake={stakeValue}
                  clicked={TournamentWinnerClicked}
                  setTournamentWinnerClicked={setTournamentWinnerClicked}
                  team1Winnings={team1Winnings}
                  team2Winnings={team2Winnings}
                  setExposure={setExposure}
                  setBalance={setBalance}
                  openBetPopup={openBetPopup}
                  matchData={matchDetails}
                />
              )}

                <TournamentWinner
                  title={"BOOKMAKER"}
                  columns={columnsT}
                  data={bookmakerData}
                  setSelectedBet={setSelectedBet}
                  profit={profit}
                  betFor={selectedBet}
                  stake={stakeValue}
                  clicked={TournamentWinnerClicked}
                  setTournamentWinnerClicked={setTournamentWinnerClicked}
                  team1Winnings={team1Winnings}
                  team2Winnings={team2Winnings}
                  setExposure={setExposure}
                  setBalance={setBalance}
                  openBetPopup={openBetPopup}
                  matchData={matchDetails}
                />

                <TournamentWinner
                  title={"TIED MATCH"}
                  columns={columnsT}
                  data={tiedmatchData}
                  setSelectedBet={setSelectedBet}
                  profit={profit}
                  betFor={selectedBet}
                  stake={stakeValue}
                  clicked={TournamentWinnerClicked}
                  setTournamentWinnerClicked={setTournamentWinnerClicked}
                  team1Winnings={team1Winnings}
                  team2Winnings={team2Winnings}
                  setExposure={setExposure}
                  setBalance={setBalance}
                  openBetPopup={openBetPopup}
                  matchData={matchDetails}
                />

              {fancyData.length > 0 && (
                <TournamentWinner
                  title={"FANCY MARKETS"}
                  columns={columnstied}
                  data={fancyData}
                  setSelectedBet={(bet) => setSelectedBet({ ...bet, isOverMarket: true })}
                  profit={profit}
                  betFor={selectedBet}
                  stake={stakeValue}
                  clicked={NormalClicked}
                  setTournamentWinnerClicked={setNormalClicked}
                  team1Winnings={overTeam1Winnings}
                  team2Winnings={overTeam2Winnings}
                  setExposure={setExposure}
                  setBalance={setBalance}
                  openBetPopup={openBetPopup}
                  matchData={matchDetails}
                />
              )}
            </>
          ) : (
            <div className="no-data-indicator">No data available for this match.</div>
          )}

          <div className="mobile-view" ref={useRef(null)}>
            <BetSection
              selectedBet={selectedBet}
              stakeValue={stakeValue}
              setStakeValue={setStakeValue}
              profit={profit}
              isPaused={isPaused}
              setSelectedBet={setSelectedBet}
              setProfit={setProfit}
              handleSubmit={handleSubmit}
              myBets={allBets}
              setCurrentStake={setCurrentStake}
              stakeValues={[100, 200, 500, 1000, 2000, 5000, 10000, 15000, 20000, 25000]}
              currentBalance={balance}
              currentExposure={exposure}
              betPopup={showBetPopup}
              setBetPopup={setShowBetPopup}
            />
          </div>
        </div>

        <div className="right_side">
          <BetSection
            selectedBet={selectedBet}
            stakeValue={stakeValue}
            setStakeValue={setStakeValue}
            profit={profit}
            isPaused={isPaused}
            setSelectedBet={setSelectedBet}
            setProfit={setProfit}
            handleSubmit={handleSubmit}
            myBets={allBets}
            setCurrentStake={setCurrentStake}
            stakeValues={[100, 200, 500, 1000, 2000, 5000, 10000, 15000, 20000, 25000]}
            currentBalance={balance}
            currentExposure={exposure}
            betPopup={showBetPopup}
            setBetPopup={setShowBetPopup}
          />
        </div>
      </div>

      {betPopup && (
        <div className="bet-popup">
          <h3>Place Bet</h3>
          <p>Type: {betPopup.type.toUpperCase()}</p>
          <p>Runs: {betPopup.runs}</p>
          <p>Odds: {betPopup.odds * 100}</p>
          <input
            type="number"
            placeholder="Enter Stake"
            value={betPopup.stake}
            onChange={(e) =>
              setBetPopup({ ...betPopup, stake: e.target.value })
            }
          />
          <button onClick={handlePlaceBetSession}>Confirm</button>
          <button onClick={() => setBetPopup(null)}>Cancel</button>
        </div>
      )}
    </>
  );
};

const LiveScoreContainer = styled.div`
  background: linear-gradient(135deg, #1e1e2f, #2a2a40);
  width: 100%;
  height: 218px;
  margin-bottom: 20px;
  border-radius: 15px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  position: relative;
      
`;

const PlaceholderText = styled.p`
  color: #fff;
  text-align: center;
  font-size: 18px;
  margin: auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  animation: fadeIn 0.3s ease-in-out;

  &.closing {
    animation: fadeOut 0.3s ease-in-out forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;

const PopupContainer = styled.div`
  background: linear-gradient(135deg, rgba(42, 42, 64, 0.5), rgba(30, 30, 47, 0.5));
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 400px;
  animation: slideIn 0.3s ease-in-out;

  &.closing {
    animation: slideOut 0.3s ease-in-out forwards;
  }

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(20px);
      opacity: 0;
    }
  }
`;

const PopupContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;


const PopupTitle = styled.h3`
  color: #ff4d4d;
  font-size: 1.4rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;


const T20 = () => (
  <OverMarketProvider>
    <T20Content />
  </OverMarketProvider>
);

export default T20;
