import React, { useState, useEffect } from 'react';
import './gamegrid.css';
import { socket } from '../../socket';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Nav, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlay } from '@fortawesome/free-solid-svg-icons';

export default function PlayGrid(props) {
  const [clickedCell, setClickedCell] = useState(null);
  const [overlay1Visible, setOverlay1Visible] = useState(false);
  const [overlay2Visible, setOverlay2Visible] = useState(false);
  const [overlay3Visible, setOverlay3Visible] = useState(false);
  const [themes, setThemes] = useState([]);
  const [currentShownValue, setcurrentShownValue] = useState("Test");
  const [roomCode, setroomCode] = useState("Test");
  const [teams, setTeams] = useState([[""]]);
  const [teamsScores, setTeamsScores] = useState([""]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const navigate = useNavigate();
  const roomCodeGuest = useParams()
  const [username, setUsername] = useState("Test");
  const [currentGivenPoints, setCurrentGivenPoints] = useState(200);
  const [disableQuestion, setDisableQuestion] = useState([]);
  
  const handleOverlay1Click = () => {
    socket.emit('overlayClicked2', clickedCell.row, clickedCell.column);
  };

  const handleOverlay2Click = () => {
    socket.emit('overlayClicked3', clickedCell.row, clickedCell.column);
  };

  const handleOverlay3Click = () => {
    socket.emit('overlayClicked4');
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit('LeaveRoom');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    socket.emit('GetRoomName');
    socket.emit('getTeams');
    socket.on('RoomName', (roomName) => {
      if (!roomName) {
        const roomCodeInput = roomCodeGuest.roomCode;
        setUsername("Guest");
        socket.emit('JoinRoom', {
          roomCode: roomCodeInput,
        });

      }
      else{
        setUsername(props.user);
      }
      setroomCode(roomName);
    });
    socket.on('displayOverlay', (rowIndex, columnIndex) => {
      setClickedCell(prevState => ({ row: rowIndex, column: columnIndex }));
      setDisableQuestion(dc => [...dc, rowIndex+"_"+columnIndex]);
      console.log(clickedCell);
      setOverlay1Visible(true);
    });

    socket.on('displayOverlay2', (question) => {
      setcurrentShownValue(question);
      setOverlay1Visible(false);
      setOverlay2Visible(true);
    });
    socket.on('displayOverlay3', (answer) => {
      setcurrentShownValue(answer);
      setOverlay2Visible(false);
      setOverlay3Visible(true);
    });
    socket.on('displayOverlay4', () => {
      setOverlay3Visible(false);
    });
    socket.on('startGame', (recievedthemes) => {
      setThemes(recievedthemes);
    });
    socket.on('Teams', (gottenteams) => {
      setTeams(prevTeams => gottenteams ?? []);
    });
    
    return () => {
      socket.off('Teams');
      socket.off('RoomName');
      socket.off('displayOverlay');
      socket.off('displayOverlay2');
      socket.off('displayOverlay3');
      socket.off('startGame');
    };
  }, []);

  function leaveRoom() {
    navigate("/gameboard");
    socket.emit('LeaveRoom');
  }

  const values = [...Array(5).keys()].map((x) => (x + 1) * 200);

  function generateTeamName(teamIndex) {
    const teamName = `Team ${teamIndex + 1}`;
    return teamName;
  }
  console.log(teams)
  return (
    <div>
       <Nav className="mb-4 bg-dark p-2 d-flex align-items-center gap-3" activeKey="1">
        
        <Button variant="outline-light text-nowrap"  onClick={() => leaveRoom()}><FontAwesomeIcon icon={faArrowLeft}/></Button>
        <Button variant="outline-light text-nowrap" onClick={() => socket.emit('startGame')}>Start Game</Button>
        <span className="text-white ms-auto">Room code: {roomCode}</span>

      </Nav>

      <div className="grid">
        <Table responsive variant='dark' bordered>
          <thead>
              {themes.map((theme, columnIndex) => (
                <th className="fs-4" key={columnIndex}>{theme}</th>
              ))}
          </thead>
          <tbody>

              


            {Array.from(Array(5)).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from(Array(6)).map((_, columnIndex) => (
                  <td
                    key={`${rowIndex}-${columnIndex}`}
                    className={`cell ${overlay1Visible ?  'selected' : ''} ${disableQuestion.includes(rowIndex+"_"+columnIndex) ? 'disabled' : ''}`}
                    onClick={() => {
                      socket.emit('overlayClicked', rowIndex, columnIndex);

                    }}
                  >
                    <div>
                      {values[rowIndex]}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
        {overlay1Visible && (
          <div className="overlay" onClick={handleOverlay1Click}>{values[clickedCell.row]}</div>
        )}
        {overlay2Visible && (
          <div className="overlay" onClick={handleOverlay2Click}>{currentShownValue}</div>
        )}
        {overlay3Visible && (
          <div className="overlay" onClick={handleOverlay3Click}>{currentShownValue}</div>
        )}
      </div>
      <div className='d-flex gap-3 p-4'>
      {teams.map((team, index) => (
        <div className='d-flex gap-2 flex-column team-members' key={index}>
          <span className='text-white fw-bold'>{generateTeamName(index)}</span>
          {team.map((member, index) => (<span className='d-flex flex-column text-white' key={index}>{member}</span>))}
          
          {!selectedTeam && (
            <Button variant="outline-light text-nowrap"
              onClick={() => {
                setSelectedTeam(true);
                socket.emit('joinTeam', index, username);
              }}
            >
              Join team
            </Button>
            
          )}
        </div>
      ))}
      </div>
    </div>
  );
}