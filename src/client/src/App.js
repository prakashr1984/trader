import React, { Component } from 'react';
import './App.css';
import { Card, CardTitle, CardText, Slider, Button } from 'react-md';


class App extends Component {

  constructor() {
    super()
    this.style = { maxWidth: 320 };
  }

  render() {
    return (
      <div className="App dark-theme">
        <Card style={this.style} className="md-block-centered">
          <CardTitle title="BTCUSD" subtitle="margin buy/sell" />
          <CardText>
            <Button raised className="buy" >Buy</Button>
            <Button raised className="sell">Sell</Button>
            <Slider id="example-card-slider" />
          </CardText>
        </Card>
      </div>
    );
  }
}

export default App;
