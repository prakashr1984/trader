import React from 'react';
import { Doughnut } from 'react-chartjs-2'
import request from 'request'

export default class VolumeComponent extends React.PureComponent {
    static defaultProps = {
        interval: 15
     };

    constructor() {
        super();

        this.state = {
            data: {
                labels: ["Buy", "Sell"],
                datasets: [{
                    label: 'Buy vs Sell',
                    data: [100, 20],
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

    }

    componentDidMount() {
        this.timer = setInterval(this.update.bind(this), 1000)
    }

    update() {
        request(`http://localhost:8000/api/volume/btcusd/${this.props.interval}`, (err, response, body) => {
            var d = JSON.parse(body)
            this.setState({
                data: {
                    ...this.state.data
                    , datasets: [
                        {
                            label: 'Buy vs Sell',
                            data: [d.buy, d.sell],
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
                }
            })
        });
    }

    componentWillMount() {
        clearInterval(this.timer)
    }

    render() {
        return <div className="VolumeComponent"><Doughnut height={200} data={this.state.data} options={this.state.options} /></div>
    }
}