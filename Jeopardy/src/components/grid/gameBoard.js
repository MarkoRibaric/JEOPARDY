import { useState, useEffect } from "react"
import GameConfigurationGrid from "./gameConfigurationGrid";
import PlayGrid from './playGrid';

export const gridStatusEnum = {
    CONFIGURATION: 1,
    PLAY: 2
}

export default function GameBoard(props) {
    const [gridValues, setGridValues] = useState(() => {
        const storedData = localStorage.getItem('gridData');
        if (storedData) {
          return JSON.parse(storedData);
        }
        return Array.from(Array(6), () => Array(6).fill(''));
      });
    const [gridStatus, setGridStatus] = useState(gridStatusEnum.CONFIGURATION);
    

    // Kad se gridValues promjeni
    useEffect(() => {
        localStorage.setItem('gridData', JSON.stringify(gridValues));
    }, [gridValues]);
    return (<>
        {gridStatus === gridStatusEnum.CONFIGURATION && <GameConfigurationGrid gridValues={gridValues} setGridValues={setGridValues} setGridStatus={setGridStatus} handleGoToEditPage= {props.handleGoToEditPage} user={props.user} id={props.id} token = {props.token}></GameConfigurationGrid>}
        {gridStatus === gridStatusEnum.PLAY && <PlayGrid gridValues={gridValues} setGridStatus={setGridStatus} user={props.user} id={props.id}></PlayGrid>}
        </>
    )
}