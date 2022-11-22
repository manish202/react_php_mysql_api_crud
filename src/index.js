import React from 'react';
import ReactDom from 'react-dom/client';
import App from "./App";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
const root = ReactDom.createRoot(document.getElementById('root'));
root.render(<App />);