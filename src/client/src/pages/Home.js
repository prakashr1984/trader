import React from 'react';
import { Doughnut } from 'react-chartjs-2'
import './Home.css';
import request from 'request'

export default class Home extends React.Component {

    constructor() {
        super();

        this.state = {
            data: {
                labels: ["Buy", "Sell"],
                datasets: [{
                    label: 'Buy vs Sell',
                    data: [100,20],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255,99,132,1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                maintainAspectRatio: false,
                rotation: 1 * Math.PI,
                circumference: 1 * Math.PI
            }
        }

        

        setInterval(()=>{
            request(`http://localhost:8000/api/volume/btcusd/1`, (err, response, body)=>{
                var d = JSON.parse(body)
                this.setState({data: {...this.state.data
                    , datasets: [ 
                        {
                            label: 'Buy vs Sell',
                            data: [d.buy,d.sell],
                            backgroundColor: [
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 99, 132, 0.2)',
                            ],
                            borderColor: [
                                'rgba(54, 162, 235, 1)',
                                'rgba(255,99,132,1)',
                            ],
                            borderWidth: 1
                        }
                    ]
                }})
            });
        }, 200)
    }

    render() {
        
        
        return (
            <div className="Home">
                <Doughnut
                    data={this.state.data}
                    options={this.state.options}
                />
            </div>
        );
    }
}
