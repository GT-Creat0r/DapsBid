import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Sepolia } from '@thirdweb-dev/chains';
import { ThirdwebProvider } from '@thirdweb-dev/react';

import { StateContextProvider } from './context';
import App from './App';

import './index.css'

// old blockchain dashboard by thirdweb: https://thirdweb.com/sepolia/0x85513fA54960fEBeCa01309CA95C96F3f187438f
// new blockchain dashboard by thirdweb: https://thirdweb.com/sepolia/0x41AA1F0AFc23A5fb3109c086f8A15CEc80E2E1C8

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ThirdwebProvider activeChain={ Sepolia } clientId='d0c3d918aa47e750ba0c2fa1b8fe660fS' >
    <Router>
      <StateContextProvider>
        <App />
      </StateContextProvider>
    </Router>
  </ThirdwebProvider>
)
