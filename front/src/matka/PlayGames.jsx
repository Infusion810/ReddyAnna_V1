
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FaChartBar, FaPlay } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../AllGamesNavbar/AllNavbar";

const Container = styled.div`
  // background-color: #0b3c68;
  // padding: 10px 20px;
  margin-top: -20px;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
`;

const Wrapper = styled.div`
  background-color: white;
  width: 100%;
  padding: 24px;
  margin-top: 4rem;
  border-radius: 10px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  font-size: 50px;
  font-weight: bold;
  color: black;
  margin-bottom: 15px;
  text-align: left;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

const GameCard = styled.div`
  background-color: #0b3c68;
  color: white;
  padding: 20px;
  border-radius: 8px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChartSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  flex-direction: column;
  width: 70px;
  text-align: center;

  svg {
    font-size: 30px;
    background-color: #d4f4a6;
    padding: 10px;
    border-radius: 50%;
    color: #0b3c68;
    margin-bottom: 5px;
  }

  p {
    font-size: 12px;
    font-weight: bold;
    margin-top: 3px;
  }
`;

const GameDetails = styled.div`
  flex: 1;
  text-align: center;
  height: fit-content;

  h4 {
    color: red;
    font-size: 14px;
    font-weight: bold;
  }

  h3 {
    font-size: 14px;
    font-weight: bold;
    margin: 2px 0;
  }

  p {
    font-size: 12px;
  }
`;

const PlayButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  width: 70px;
  text-align: center;

  svg {
    font-size: 20px;
    background-color: #d4f4a6;
    padding: 15px;
    border-radius: 50%;
    color: red;
    margin-bottom: 5px;
  }

  p {
    font-size: 12px;
    font-weight: bold;
    margin-top: 3px;
  }
`;

const PlayGames = () => {
  const [gamesData, setGamesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Function to fetch game data from the backend
  const fetchGameData = async () => {
    console.log("new updated")
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/subscription-state`);
      const data = response.data;
      
      setGamesData(data.markets); // Update the games data
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false); // Stop loading after fetching data
    }
  };

  useEffect(() => {
    // Fetch data immediately when the component mounts
    fetchGameData();

    // Set up polling to fetch data every minute (60000 ms)
    const intervalId = setInterval(fetchGameData, 60000);

    // Cleanup interval on component unmount to avoid memory leaks
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this runs only once on mount
  
  return (
    <Container>
      <Navbar />
      <Wrapper>
        {/* <Title>Play Games</Title> */}
        {loading ? (
          <p style={{ textAlign: "center", fontWeight: "bold" }}>Loading...</p>
        ) : error ? (
          <p style={{ textAlign: "center", color: "red", fontWeight: "bold" }}>{error}</p>
        ) : (
          <GridContainer>
            {gamesData.map((game, index) => (
              <GameCard key={index}>
                <ChartSection>
                  <FaChartBar />
                  <p>Chart</p>
                  <p>Open: {game.openTime}</p>
                </ChartSection>
                <GameDetails>
                  <h4>{game.openNumber}-{game.jodiDigit}-{game.closeNumber}</h4>
                  <h3>{game.marketName}</h3>
                  <p
                    style={{
                      color: game.bidStatus === "Closed" ? "red" : "green",
                      fontWeight: "bold",
                    }}
                  >
                   {game.bidStatus === "Closed" ? "Bid is Closed" : `Bid Live : ${game.bidStatus}`}
                  </p>
                </GameDetails>
                <Link
                  to={game.bidStatus === "Closed" ? "#" : `/casino/play/${game.marketName}/${game.bidStatus}`}
                  style={{ textDecoration: "none", color: "white" }}
                  onClick={game.bidStatus === "Closed" ? (e) => e.preventDefault() : undefined}
                >
                  <PlayButton
                    style={{
                      cursor: game.bidStatus === "Closed" ? "not-allowed" : "pointer",
                    }}
                  >
                    <FaPlay style={{ color: game.bidStatus === "Closed" ? "gray" : "red" }} />
                    <p style={{ color: game.bidStatus === "Closed" ? "gray" : "white" }}>Play</p>
                    <p>Close: {game.closeTime}</p>
                  </PlayButton>
                </Link>
              </GameCard>
            ))}
          </GridContainer>
        )}
      </Wrapper>
    </Container>
  );
};

export default PlayGames;