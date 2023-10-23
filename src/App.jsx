import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { UAParser } from 'ua-parser-js';

function App() {
  const {browser, device, os} = UAParser(navigator.userAgent);
  return (
    <>
       <h2>Device Token POC</h2>
      <div className="card">
      <p>
        Browser 
        <ul>
          <li>Name: {browser.name}</li>
          <li>Version: {browser.version}</li>
        </ul>
      </p>
      <p>
        Device 
        <ul>
          <li>Vendor: {device.vendor}</li>
          <li>Model: {device.model}</li>
          <li>Type: {device.type}</li>
        </ul>
      </p>
      <p>
        OS 
        <ul>
          <li>Name: {os.name}</li>
          <li>Version: {os.version}</li>
        </ul>
      </p>  
      </div>
    </>
  )
}

export default App
