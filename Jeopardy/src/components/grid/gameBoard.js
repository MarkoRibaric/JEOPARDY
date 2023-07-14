import React, { useState, useEffect } from "react";
import GameConfigurationGrid from "./gameConfigurationGrid";
import PlayGrid from "./playGrid";

export const gridStatusEnum = {
  CONFIGURATION: 1,
  PLAY: 2
};

export default function GameBoard(props) {
  const [gridValues, setGridValues] = useState(() => {
    const storedData = localStorage.getItem("gridData");
    if (storedData) {
      return JSON.parse(storedData);
    }
    return Array.from(Array(6), () => Array(6).fill(""));
  });
  const [gridStatus, setGridStatus] = useState(gridStatusEnum.CONFIGURATION);
  const [selectedBoard, setSelectedBoard] = useState("1");

  useEffect(() => {
    localStorage.setItem("gridData", JSON.stringify(gridValues));
  }, [gridValues]);

  function SaveData(id, token, name, gridValues) {
    const backendUrl = "http://localhost:5000/saveboard";
    fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id, name, gridValues })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data); // Success response from the backend
      })
      .catch(error => {
        console.error("Error saving data:", error);
      });
  }

  return (
    <>
      {gridStatus === gridStatusEnum.CONFIGURATION && (
        <GameConfigurationGrid
          SaveData={SaveData}
          gridValues={gridValues}
          setGridValues={setGridValues}
          setGridStatus={setGridStatus}
          handleGoToEditPage={props.handleGoToEditPage}
          user={props.user}
          id={props.id}
          token={props.token}
          selectedBoard={selectedBoard}
        />
      )}
      {gridStatus === gridStatusEnum.PLAY && (
        <PlayGrid
          gridValues={gridValues}
          setGridStatus={setGridStatus}
          user={props.user}
          id={props.id}
        />
      )}
    </>
  );
}
