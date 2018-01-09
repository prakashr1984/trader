import React from 'react';
import VolumeComponent from '../component/VolumeComponent'
import './Home.css';

export default class Home extends React.Component {

    render() {
        return (
            <div className="Home">
                <VolumeComponent interval={1}/>
                <VolumeComponent interval={5}/>
                <VolumeComponent interval={15}/>
                <VolumeComponent interval={240}/>
            </div>
        );
    }
}
