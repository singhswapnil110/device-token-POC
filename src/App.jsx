import './App.css'
import { UAParser } from 'ua-parser-js';

import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { useState } from 'react';

const fpPromise = FingerprintJS.load();

function App() {
  const {browser, device, os} = UAParser(navigator.userAgent);
  const [userId, setUserId] = useState(null);
  
  (async () => {
    // Get the visitor identifier when you need it.
    const fp = await fpPromise
    const result = await fp.get()
    console.log(result);
    setUserId(result.visitorId);
  })();

  return (
    <>
      <h2>Device Token POC</h2>
      <h4>Visitor ID: {userId}</h4>
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
