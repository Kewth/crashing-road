import * as echarts from 'echarts';

export class DashBoard {
    getVal: () => number;
    container: HTMLElement
    chart: echarts.ECharts | undefined;
    option: any;

    constructor(fn: () => number, window: Window) {
        this.getVal = fn;
        this.container = document.getElementById("dashboard-container")!;
        // if (window.innerHeight > 600 && window.innerWidth > 600) {
            this.chart = echarts.init(this.container);
            this.option = {
                animation: false,
                series: [
                    {
                        type: 'gauge',
                        startAngle: 210,
                        endAngle: -30,
                        min: 0,
                        max: 160,
                        splitNumber: 8,
                        itemStyle: {
                            color: '#58D9F9',
                            shadowColor: 'rgba(0,138,255,0.45)',
                            shadowBlur: 10,
                            shadowOffsetX: 2,
                            shadowOffsetY: 2
                        },
                        progress: {
                            show: true,
                            roundCap: true,
                            width: 18
                        },
                        pointer: {
                            icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
                            length: '75%',
                            width: 16,
                            offsetCenter: [0, '5%']
                        },
                        axisLine: {
                            roundCap: true,
                            lineStyle: {
                                width: 18
                            }
                        },
                        axisTick: {
                            splitNumber: 2,
                            lineStyle: {
                                width: 2,
                                color: '#999'
                            }
                        },
                        splitLine: {
                            length: 12,
                            lineStyle: {
                                width: 3,
                                color: '#999'
                            }
                        },
                        axisLabel: {
                            distance: 30,
                            color: '#999',
                            fontSize: 20
                        },
                        title: {
                            show: false
                        },
                        detail: {
                            backgroundColor: '#fff',
                            borderColor: '#999',
                            borderWidth: 2,
                            width: '55%',
                            lineHeight: 40,
                            height: 40,
                            borderRadius: 8,
                            offsetCenter: [-10, '35%'],
                            valueAnimation: true,
                            formatter: function (value: number) {
                                return '{value|' + value.toFixed(0) + '}{unit|km/h}';
                            },
                            rich: {
                                value: {
                                    fontSize: 32,
                                    fontWeight: 'bolder',
                                    color: '#777'
                                },
                                unit: {
                                    fontSize: 18,
                                    color: '#999',
                                    padding: [0, 0, -20, 10]
                                }
                            }
                        },
                        data: [
                            {
                                value: -1
                            }
                        ]
                    }
                ]
            };
        // }
    }

    update() {
        const value = Number(this.getVal().toFixed(0));
        if (this.chart) {
            if (value != this.option.series[0].data[0].value) {
                this.option.series[0].data[0].value = value;
                this.chart.setOption(this.option);
            }
        }
        else {
            this.container.textContent = `${value} km/h`;
        }
    }
}