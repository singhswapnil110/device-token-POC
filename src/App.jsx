import './App.css'
import { UAParser } from 'ua-parser-js';

import FingerprintJS from '@fingerprintjs/fingerprintjs-pro'
import { useEffect, useRef, useState, forwardRef } from 'react';
import axios from 'axios';
import { constants } from './constants';
import { getFingerprintId } from './fingerprint';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function App() {
  const resultBrowser = UAParser(navigator.userAgent);
  const {browser, os} = resultBrowser;
  const {current: userId} = useRef({
    libId: null,
    inbuiltFunId: null,
  });
  const [open, setOpen] = useState(false);
  
  const [collectionTime, setCollectionTime] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  
  const loadFingerprintJS = async () => {
    var startTime = performance.now();
    const fpPromise = FingerprintJS.load({
      apiKey: "LH67Rb3XyyqIX68Q0t08",
      region: 'ap',
    });
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
    axios.post(constants.API_ENDPOINT_URL, dataObj).then(res => console.log(res)).then(()=>setOpen(true))
    .then(()=>localStorage.setItem(userId.libId, userEmail));
  }

  useEffect(()=>{
    loadFingerprintJS();
  },[]);

  // useEffect(()=>{
  //   getFingerprintInbuilt();
  // },[])

  return (
    <body>
    <div className='page-wrapper'>
    <div className='bg-wrapper'></div>
      <Snackbar
      open={open}
      anchorOrigin={{ vertical:'top', horizontal:'center'}}
      autoHideDuration={2000}
      onClose={()=>setOpen(false)}
    >
       <Alert onClose={()=>setOpen(false)} severity="success" sx={{ width: '100%' }}>
       Data Submitted Successfully
        </Alert>
    </Snackbar>
    <div className='page-container'>
      <h2>Device Tokenization POC</h2>
      <div>
      <h4>Visitor ID: {userId.libId}</h4>
      <h4>Email ID: {localStorage.getItem(userId.libId) ? localStorage.getItem(userId.libId) : "Not yet set"}</h4>
      </div>
      <p>Thank you for being part of this POC, please enter your Razorpay email id below and submit the form</p>
      <div className='form'>
        <input type='email' onChange={e => setUserEmail(e.target.value)} value={userEmail}/>
        <button type='submit' onClick={onSubmit}>Submit</button>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
          <tr>
            <th>Attribute</th>
            <th>Name</th>
            <th>Version</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>Browser</td>
            <td>{browser.name}</td>
            <td>{browser.version}</td>
          </tr>
          <tr>
            <td>OS</td>
            <td>{os.name}</td>
            <td>{os.version}</td>
          </tr>
          </tbody>
        </table>
      {/* <p>
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
      {/* <p>
        OS 
        <ul>
          <li>Name: {os.name}</li>
          <li>Version: {os.version}</li>
        </ul>
    </p>   */}
      </div>
      </div>
      </div>
    </body>
  )
}

export default App
