import React, { useState } from 'react';
import './gamegrid.css';
import { gridStatusEnum } from './gameBoard';

export default function PlayGrid(props) {
  const [clickedCell, setClickedCell] = useState(null);
  const [overlay1Visible, setOverlay1Visible] = useState(false);
  const [overlay2Visible, setOverlay2Visible] = useState(false);
  const [overlay3Visible, setOverlay3Visible] = useState(false);

  const handleClick = (rowIndex, columnIndex) => {
    setClickedCell({ row: rowIndex, column: columnIndex });
    setOverlay1Visible(true);
  };

  const handleOverlay1Click = () => {
    setOverlay1Visible(false);
    setOverlay2Visible(true);
  };

  const handleOverlay2Click = () => {
    setOverlay2Visible(false);
    setOverlay3Visible(true);
  };

  const handleOverlay3Click = () => {
    setOverlay3Visible(false);
  };

  const values = [...Array(5).keys()].map((x) => (x + 1) * 400);

  return (
    <div>
    <div>
        <button onClick={() => props.setGridStatus(gridStatusEnum.CONFIGURATION)}>Quit game</button>
      </div>
    <div className="grid">
      
      <table>
        <tbody>
          <tr className="row">
            {props.gridValues.map((column, columnIndex) => (
              <th key={columnIndex}>{column[0]}</th>
            ))}
          </tr>
          {Array.from(Array(5)).map((_, rowIndex) => (
            <tr className="row" key={rowIndex}>
              {Array.from(Array(6)).map((_, columnIndex) => (
                <td
                  key={`${rowIndex}-${columnIndex}`}
                  className={`cell ${clickedCell && clickedCell.row === rowIndex && clickedCell.column === columnIndex ? 'selected' : ''}`}
                  onClick={() => handleClick(rowIndex, columnIndex)}
                >
                  <div>
                    {values[rowIndex]}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {overlay1Visible && (
        <div className="overlay" onClick={handleOverlay1Click}>
          {values[clickedCell.row]}
        </div>
      )}
      {overlay2Visible && (
        <div className="overlay" onClick={handleOverlay2Click}>
          {props.gridValues[clickedCell.column][clickedCell.row + 1][0]}
        </div>
      )}
      {overlay3Visible && (
        <div className="overlay" onClick={handleOverlay3Click}>
          {props.gridValues[clickedCell.column][clickedCell.row + 1][1]}
        </div>
      )}
    </div>
    </div>
  );
  
}
