import React, { useState, useEffect } from "react";
import GameConfigurationGrid from "./gameConfigurationGrid";
import PlayGrid from "./playGrid";

export const gridStatusEnum = {
  CONFIGURATION: 1,
  PLAY: 2
};

export default function GameBoard(props) {
  
  const [gridStatus, setGridStatus] = useState(gridStatusEnum.CONFIGURATION);


  

  return (
    <>
      {gridStatus === gridStatusEnum.CONFIGURATION && (
        <GameConfigurationGrid
          setGridStatus={setGridStatus}
          handleGoToEditPage={props.handleGoToEditPage}
          user={props.user}
          id={props.id}
          token={props.token}
        />
      )}
      {gridStatus === gridStatusEnum.PLAY && (
        <PlayGrid
          setGridStatus={setGridStatus}
          user={props.user}
          id={props.id}
        />
      )}
    </>
  );
}
