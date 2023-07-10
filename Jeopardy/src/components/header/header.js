import React from 'react';
import './header.css'

export default function Header (props) {
    return <>
        
        <div className='header'>
        <button onClick={props.onMoveToEdit} className='editbutton'>Click me baby</button>
        <h1 className='title'>Jeopardy</h1>
        </div>
    </>
}