import React from 'react';
import { Route } from 'react-router-dom'
import './App.css';
import Home  from './pages/Home'

const App = () => (
    <div className="App dark-theme">  
      <Route path="/" exact  component={Home} />
    </div>
);

export default App;
