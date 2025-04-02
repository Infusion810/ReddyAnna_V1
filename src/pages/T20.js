import React, { useEffect, useState } from 'react';

const T20 = () => {
  const [matchDetails, setMatchDetails] = useState([]);
  const [data, setData] = useState([]);
  const [bookmakerData, setBookmakerData] = useState([]);
  const [tiedMatchData, setTiedMatchData] = useState([]);
  const [fancyData, setFancyData] = useState([]);

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

      // Process tied match data
      const tiedMatchMarket = matchDetails.find(market => 
        market.name.includes('Tied Match') || 
        market.name.includes('Tie') ||
        market.name.includes('Draw')
      );

      if (tiedMatchMarket && tiedMatchMarket.runners) {
        const formattedTiedMatchOdds = tiedMatchMarket.runners.map(runner => [
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
        setTiedMatchData(formattedTiedMatchOdds);
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
    <div>
      {/* Render your components here */}
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
        data={tiedMatchData}
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
    </div>
  );
};

export default T20; 