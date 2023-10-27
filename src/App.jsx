import './App.css'
import { UAParser } from 'ua-parser-js';

import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { constants } from './constants';
import { getFingerprintId } from './fingerprint';

function App() {
  const {browser, os} = UAParser(navigator.userAgent);
  const {current: userId} = useRef({
    libId: null,
    inbuiltFunId: null,
  });
  const [collectionTime, setCollectionTime] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  
  const loadFingerprintJS = async () => {
    var startTime = performance.now();
    const fpPromise = FingerprintJS.load();
    const fp = await fpPromise
    const result = await fp.get()
    var endTime = performance.now();
    var timeTaken = endTime - startTime;
    //setUserId({...userId, libId: result.visitorId});
    userId.libId = result.visitorId; 
    if(collectionTime==null)
    setCollectionTime(timeTaken);
  };

  const getFingerprintInbuilt = async () => {
    let fingerPrintId = await getFingerprintId();
    console.log(fingerPrintId);
    userId.inbuiltFunId = fingerPrintId;
    //setUserId({...userId, inbuiltFunId: fingerPrintId});
  }

  const onSubmit = () => {
    const dataObj = 
      {
        emailId: userEmail,
        browserName: browser.name,
        browserVersion: browser.version,
        fingerPrintId: userId.libId,
        collectionTime: collectionTime,
        osName: os.name,
        osVersion: os.version
    }
    console.log(dataObj);
    // fetch(constants.API_ENDPOINT_URL,{
    //   method: "POST",
    //   mode: "cors",
    //   body: JSON.stringify(dataObj),
    // }).then(res => console.log(res));
    axios.post(constants.API_ENDPOINT_URL, dataObj).then(res => console.log(res));
  }

  useEffect(()=>{
    loadFingerprintJS();
  },[]);

  useEffect(()=>{
    getFingerprintInbuilt();
  },[])

  return (
    <>
      <h2>Device Token POC</h2>
      <h4>Visitor ID: {userId.libId}</h4>
      <h4>Visitor ID Inbuilt: {userId.inbuiltFunId}</h4>
      <div className='form'>
        <input type='text' onChange={e => setUserEmail(e.target.value)} value={userEmail}/>
        <button onClick={onSubmit}>Submit</button>
      </div>
      <div className="card">
      <p>
        Browser 
        <ul>
          <li>Name: {browser.name}</li>
          <li>Version: {browser.version}</li>
        </ul>
      </p>
      {/* <p>
        Device 
        <ul>
          <li>Vendor: {device.vendor}</li>
          <li>Model: {device.model}</li>
          <li>Type: {device.type}</li>
        </ul>
      </p> */}
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
