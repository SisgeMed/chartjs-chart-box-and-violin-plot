## Boxplot with mean, median, whiskers, min and max, q1 and q3, custom tooltip

Customization of chartjs plugin 
<img width="1153" alt="boxplot" src="https://user-images.githubusercontent.com/42974751/45225136-17effe00-b2bc-11e8-93fb-79eb671f9e8f.png">
<img width="1147" alt="boxplot_tooltip" src="https://user-images.githubusercontent.com/42974751/45225135-17effe00-b2bc-11e8-93ac-7544bcd79649.png">
<img width="932" alt="violinplot" src="https://user-images.githubusercontent.com/42974751/45225137-18889480-b2bc-11e8-8315-c9094c016dc4.png">

## Installation

`npm install --save chart.js chartjs-chart-box-and-violin-plot-sisge`


## How to use

After installation just create an angular project:

`ng new my-chart-project`

then generate a new component:

`ng g boxplot`

modify boxplot.component.ts as follow:

```typescript
import { Component, OnInit, OnChanges, ElementRef, SimpleChanges, NgZone } from '@angular/core';`
import { Chart } from 'chart.js';
import 'chartjs-chart-box-and-violin-plot-sisge';

export class BoxplotComponent implements OnInit, OnChanges {

  private chart: Chart;

  private readonly boxPlotData = {
    labels: [['LABEL COLUMN 1 - ROW 1','LABEL COLUMN 1 - ROW 2'], ['LABEL COLUMN 2 - ROW 1','LABEL COLUMN 2 - ROW 2'], ... ],
    datasets: [{
      label: 'Dataset 1',
      backgroundColor: 'rgb(255,255,255)',
      borderColor: 'blue',
      borderWidth: 1,
      outlierColor: '#999999',
      padding: 10,
      itemRadius: 0,
      data: [
          [2, 6, 7, 8, 8, 11, 12, 13, 14, 15, 22, 23],
          [5, 40, 42, 46, 48, 49, 50, 50, 52, 53, 55, 56, 58, 75, 102],
          ...
      ]
    }]
  }

  constructor(private readonly elementRef: ElementRef, private readonly ngZone: NgZone) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!this.chart) {
      return;
    }

    // TODO handle updates
    this.chart.update();
  }

  ngOnInit() {
    this.build();
  }
  
  private build() {
    this.ngZone.runOutsideAngular(() => {
      const node: HTMLElement = this.elementRef.nativeElement;
      this.chart = new Chart(node.querySelector('canvas'), {
        type: 'boxplot',
        data: this.boxPlotData,
        options: {
          responsive: true,
          layout: {
              padding: {
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0
              }
          },
          legend: {
            position: 'top',
            display: false
          },
          title: {
            display: false,
            text: 'Titolo'
          },
          tooltips: {
            mode: 'nearest',
            // mode: 'index',
            intersect: true
          },
          scales: {
            yAxes: [{
                ticks: {
                  beginAtZero: true,
                  max: 180,
                  // Include a dollar sign in the ticks
                  callback: function(value, index, values) {

                    const minutes = value % 60;
                    const hours = Math.floor(value / 60);

                    return hours + 'h ' + minutes + '\'';

                  }
                }
            }],
            xAxes : [{
              gridLines : {
                  display : true,
                  lineWidth: 1,
                  zeroLineWidth: 1,
                  zeroLineColor: '#666666',
                  drawTicks: false,
                  offsetGridLines : true
              },
              ticks: {
                  display: true,
                  min: 0,
                  autoSkip: false,
                  fontSize: 11,
                  padding: 50,
                  maxRotation: 90,
                  // minRotation: 90
              }
          }]
          },
          animation: {
            onProgress: function (data) {
                    console.log('in progress chartArea', data.chart.chartArea);
                    const chartLeft = data.chart.chartArea.left;
                    const chartWidth = data.chart.chartArea.right - chartLeft;
                    const chartHeight = data.chart.chartArea.bottom - data.chart.chartArea.top;
                    const column_width = chartWidth / 13;
                    const offset = chartLeft - column_width / 2;
                    const centerY = chartHeight + 31;
                    const radius = 16;

                    // add outlers labels
                    data.chart.config.data.datasets[0].data.forEach((element, index) => {
                      const outliers = element.__stats.outliers.length;
                      const total = element.__stats.total;


                      if (total) {
                        const perc = (outliers / total).toPrecision(2);
                        const columnWith = column_width;

                        const centerX = offset + (index + 1) * columnWith;
                        data.chart.ctx.textAlign = 'center';
                        data.chart.ctx.beginPath();
                        data.chart.ctx.ellipse(centerX, centerY, radius, 10, 180 * Math.PI / 180, 0, 2 * Math.PI);
                        data.chart.ctx.fillStyle = '#ddd';
                        data.chart.ctx.fill();
                        data.chart.ctx.lineWidth = 1;
                        data.chart.ctx.strokeStyle = '#003300';
                        data.chart.ctx.stroke();
                        
                        data.chart.ctx.font = 'normal 12px Arial';
                        data.chart.ctx.fillStyle = 'black';
                        data.chart.ctx.fillText(perc, centerX , centerY + 4);
                      }
                    });
                    
                    data.chart.ctx.font = 'normal 12px Arial';
                    data.chart.ctx.fillText('outliers', offset + 8 , centerY + 4);
            }
          }
        }

      });

    });
  }

}
```

update css:
```typescript
.chart-wrapper {
  width: 1200px;
  height: 1000px;
  position: relative;
}
```
replace app.component.html content with the following code:

```typescript
<app-boxplot></app-boxplot>
```

then run 

`ng serve`

## License

MIT
