import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { 
  TrophyIcon,
  ChartBarIcon,
  VideoCameraIcon,
  TvIcon,
  LinkIcon
} from '@heroicons/react/24/solid';
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import './MatchList.css';

const MatchListContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 20px;
  overflow: hidden;
`;

const MatchListHeader = styled.div`
  background: #f8f9fa;
  color: #333;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
`;

const SportTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  img {
    height: 24px;
    width: auto;
  }
  
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  @media (max-width: 576px) {
    h2 {
      font-size: 16px;
    }
    
    img {
      height: 20px;
    }
  }
`;

const MatchTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const TableHeader = styled.thead`
  background-color: #f8f9fa;
  
  th {
    padding: 12px 16px;
    font-weight: 500;
    color: #6c757d;
    border-bottom: 1px solid #dee2e6;
    font-size: 14px;
    text-align: center;
    
    &:first-child {
      width: 35%;
      text-align: left;
    }
  }
`;

const TableBody = styled.tbody`
  tr {
    &:hover {
      background-color: #f8f9fa;
    }
    
    &:not(:last-child) {
      border-bottom: 1px solid #e2e8f0;
    }
  }
  
  td {
    padding: 8px;
    text-align: center;
    
    &:first-child {
      text-align: left;
    }
  }
  
  @media (max-width: 768px) {
    display: block;
    
    tr {
      display: flex;
      flex-wrap: wrap;
      padding: 8px 0;
      position: relative;
    }
    
    td {
      padding: 6px 8px;
      
      &:first-child {
        flex: 0 0 100%;
        padding-bottom: 0;
      }
      
      &:not(:first-child) {
        flex: 1;
        min-width: 80px;
        margin-top: 8px;
      }
    }
  }
`;

const MatchRow = styled.div`
  display: grid;
  grid-template-columns: 2.5fr repeat(6, 1fr);
  padding: 8px 12px;
  border-bottom: 1px solid #dee2e6;
  align-items: center;
  cursor: pointer;
  background: white;
  width: 175%;
  
  &:hover {
    background-color: #f8f9fa;
  }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    padding: 8px;
    gap: 4px;
    width: 100%;
  }
`;

const MatchInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 4px;
  }
`;

const MatchTitle = styled.div`
  color: #333;
  font-weight: 500;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;

  .live-tag {
    background-color: #dc3545;
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 1px 4px;
    border-radius: 2px;
    text-transform: uppercase;
  }
`;

const MatchDateTime = styled.div`
  color: #666;
  font-size: 11px;
`;

const OddsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
  }
`;

const OddsPair = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
`;

const OddsBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 2px;
  font-weight: 500;
  font-size: 13px;
  border-radius: 2px;
  min-width: 96px;
  
  &.back {
    background-color: #b7e4f7;
    color: #000;
  }
  
  &.lay {
    background-color: #ffc4cf;
    color: #000;
  }

  @media (max-width: 768px) {
    padding: 3px 2px;
    font-size: 12px;
    min-width: 32px;
  }
`;

const OddsButton = styled.div`
  background-color: ${props => props.$type === '1' ? '#ebf8ff' : props.$type === 'X' ? '#f7fafc' : '#fff5f5'};
  color: ${props => props.$type === '1' ? '#3182ce' : props.$type === 'X' ? '#4a5568' : '#e53e3e'};
  padding: 10px 0;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${props => props.$type === '1' ? '#bee3f8' : props.$type === 'X' ? '#e2e8f0' : '#fed7d7'};
  
  &:hover {
    background-color: ${props => props.$type === '1' ? '#bee3f8' : props.$type === 'X' ? '#edf2f7' : '#fed7d7'};
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    padding: 8px 0;
    font-size: 14px;
  }
`;

const BackLayLabel = styled.div`
  font-size: 10px;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1px;
  font-weight: 500;
`;

const BackButton = styled.div`
  background-color: #87ceeb;
  color: #000;
  border: 1px solid #bee3f8;
  padding: 3px 0;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #75bfe0;
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LayButton = styled.div`
  background-color: #ffb6c1;
  color: #000;
  border: 1px solid #fed7d7;
  padding: 3px 0;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #ff9eb0;
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LiveTag = styled.span`
  background-color: #4caf50;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 4px;
  border-radius: 3px;
  text-transform: uppercase;
  margin-right: 6px;
`;

const NoMatchesMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #718096;
  font-size: 16px;
  
  p {
    margin: 0 0 10px;
  }
  
  svg {
    font-size: 32px;
    margin-bottom: 10px;
    color: #a0aec0;
  }
  
  @media (max-width: 576px) {
    padding: 30px 20px;
    
    svg {
      font-size: 28px;
    }
    
    p {
      font-size: 14px;
    }
  }
`;

const StatusCell = styled.td`
  color: #6c757d;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
`;

const DateTimeCell = styled.td`
  color: #6c757d;
  font-size: 13px;
  text-align: center;
`;

const OptionsCell = styled.td`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  text-align: center;

  svg {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .red-icon {
    color: #C11A1A;
  }

  .gray-icon {
    color: #6c757d;
  }

  .bounce {
    animation: bounce 1s infinite;
  }
`;

const OddsCell = styled.td`
  text-align: center;
  
  .odds-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
  }
  
  .back {
    background-color: #b7e4f7;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    text-align: center;
    
    &:hover {
      background-color: #a3d9f3;
    }
  }
  
  .lay {
    background-color: #ffc4cf;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    text-align: center;
    
    &:hover {
      background-color: #ffb0be;
    }
  }
  
  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`;

const CompetitionHeader = styled.tr`
  background-color: #f8f9fa;
  
  td {
    padding: 12px 16px;
    font-weight: 600;
    color: #495057;
    font-size: 14px;
    border-bottom: 1px solid #dee2e6;
    text-align: center;

    &:first-child {
      text-align: left;
    }
  }
`;

const IconWrapper = styled.div`
  svg {
    width: 20px;
    height: 20px;
    color: #6c757d;
  }

  .red-icon {
    color: #C11A1A;
  }

  .gray-icon {
    color: #6c757d;
  }

  .bounce {
    animation: bounce 1s infinite;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-3px);
    }
  }
`;

const MatchList = ({ title, matches = [] }) => {
  const socket = io(`${process.env.REACT_APP_BASE_URL}`);
  const [leagues, setLeagues] = useState([]);
  const navigate = useNavigate();

  const getOptionIcon = (option) => {
    switch (option) {
      case 'stats': return <ChartBarIcon className="icon red-icon bounce" />;
      case 'video': return <VideoCameraIcon className="icon red-icon bounce" />;
      case 'facebook': return <LinkIcon className="icon gray-icon bounce" />;
      case 'tv': return <TvIcon className="icon red-icon bounce" />;
      default: return null;
    }
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/match-list');
        const data = await response.json();
        console.log("data",data);
        
        if (data) {
          
          const processedMatches = data.reduce((acc, match) => {
            const competition = match.competition.name;
            
            if (!acc[competition]) {
              acc[competition] = [];
            }
            
            // Get odds from runners if available
            const odds = {
              '1': { back: '-', lay: '-' },
              'X': { back: '-', lay: '-' },
              '2': { back: '-', lay: '-' }
            };

            if (match.runners && match.runners.length > 0) {
              match.runners.forEach((runner, index) => {
                if (runner.back && runner.back[0]) {
                  odds[index === 0 ? '1' : '2'].back = runner.back[0].price.toFixed(2);
                }
                if (runner.lay && runner.lay[0]) {
                  odds[index === 0 ? '1' : '2'].lay = runner.lay[0].price.toFixed(2);
                }
              });
            }
            
            acc[competition].push({
              eventId: match.event.id,
              marketId: match.id,
              groupById: match.groupById,
              matchName: match.event.name,
              matchDate: new Date(match.event.openDate).toLocaleDateString(),
              time: new Date(match.event.openDate).toLocaleTimeString(),
              status: match.inPlay ? 'Live' : 'Upcoming',
              inplay: match.inPlay,
              scoreIframe: match.isStreamAvailable,
              competition: competition,
              odds: odds || { '1': { back: '-', lay: '-' }, 'X': { back: '-', lay: '-' }, '2': { back: '-', lay: '-' } }
            });
            
            return acc;
          }, {});
          
          setLeagues(processedMatches);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    // Initial fetch
    fetchMatches();

    // Set up polling every 30 seconds
    const pollInterval = setInterval(fetchMatches, 30000);

    // Socket connection for real-time updates
    socket.on("updateMatches", (data) => {
      if (Array.isArray(data)) {
        setLeagues(data);
      } else {
        console.error("Data is not an array:", data);
      }
    });

    return () => {
      clearInterval(pollInterval);
      socket.off("updateMatches");
    };
  }, []);

  const handleClick = (gameid, iframeUrl, match) => {
    navigate(`/match/currmtc`, {
      state: { id: gameid, iframeUrl: iframeUrl, match: match }
    });
  };

  return (
    <MatchListContainer>
      <MatchListHeader>
        <SportTitle>
          <IconWrapper>
            <img src="./logo-txt.png" alt="Reddy" style={{ height: '18px' }} />
          </IconWrapper>
          <h2>CRICKET</h2>
        </SportTitle>
        <div className="header-actions">
          <span className="live-indicator">LIVE</span>
          <span className="virtual-indicator">VIRTUAL</span>
        </div>
      </MatchListHeader>
      
      {Object.keys(leagues).length === 0 ? (
        <NoMatchesMessage>
          <ChartBarIcon className="gray-icon" />
          <p>No matches available at the moment.</p>
          <p>Please check back later or try another sport.</p>
        </NoMatchesMessage>
      ) : (
        <div className="match-list-content">
          {/* <div className="match-list-header-row">
            <div className="header-cell">Match</div>
            <div className="header-cell">Date & Time</div>
            <div className="header-cell">1</div>
            <div className="header-cell">X</div>
            <div className="header-cell">2</div>
          </div>
           */}
          {(() => {
            const allMatches = Object.values(leagues).flat();
            
            const sortedMatches = allMatches.sort((a, b) => {
              if (a.inplay && !b.inplay) return -1;
              if (!a.inplay && b.inplay) return 1;
              return new Date(a.matchDate + ' ' + a.time) - new Date(b.matchDate + ' ' + b.time);
            });

            return sortedMatches.map((match, index) => (
              <MatchRow key={match.eventId || index} onClick={() => handleClick(match.eventId, match.scoreIframe, match.matchName)}>
                <MatchInfo>
                  <MatchTitle>
                    {match.inplay && <span className="live-tag">LIVE</span>}
                    {match.matchName}
                  </MatchTitle>
                  <MatchDateTime>{match.matchDate} {match.time}</MatchDateTime>
                </MatchInfo>
                
                <OddsContainer>
                  <OddsPair>
                    <OddsBox className="back">{match.odds['1'].back || '-'}</OddsBox>
                    <OddsBox className="lay">{match.odds['1'].lay || '-'}</OddsBox>
                  </OddsPair>
                  
                  <OddsPair>
                    <OddsBox className="back">{match.odds['X'].back || '-'}</OddsBox>
                    <OddsBox className="lay">{match.odds['X'].lay || '-'}</OddsBox>
                  </OddsPair>
                  
                  <OddsPair>
                    <OddsBox className="back">{match.odds['2'].back || '-'}</OddsBox>
                    <OddsBox className="lay">{match.odds['2'].lay || '-'}</OddsBox>
                  </OddsPair>
                </OddsContainer>
              </MatchRow>
            ));
          })()}
        </div>
      )}
    </MatchListContainer>
  );
};

export default MatchList; 