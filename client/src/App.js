// client/src/App.js
import React from 'react';
import BarChart from './components/BarChart';

const App = () => (
    <div>
        <BarChart id="0" name="local" url="http://localhost:5000/api/localdata?param=open"/>
        <BarChart id="1" name="remote" url="http://localhost:5000/api/data?param=close"/>
        
    </div>
);

export default App;
