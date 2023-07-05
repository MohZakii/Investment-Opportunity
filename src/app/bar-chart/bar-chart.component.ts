import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  Chart,
  LinearScale,
  BarController,
  CategoryScale,
  BarElement,
} from 'chart.js';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css'],
})
export class BarChartComponent implements AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas: ElementRef;
  @Input('labels') labels: string[];
  @Input('data') data: number[];
  chart: Chart;

  constructor() {
    Chart.register(LinearScale, BarController, CategoryScale, BarElement);
  }
  ngAfterViewInit(): void {
    this.createChart();
  }
  createChart(): void {
    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    const barColors = [
      'rgba(255, 99, 132, 0.2)',
      'rgba(255, 159, 64, 0.2)',
      'rgba(255, 205, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(201, 203, 207, 0.2)',
    ];
    const borderColor = [
      'rgb(255, 99, 132)',
      'rgb(255, 159, 64)',
      'rgb(255, 205, 86)',
      'rgb(75, 192, 192)',
      'rgb(54, 162, 235)',
      'rgb(153, 102, 255)',
      'rgb(201, 203, 207)',
    ];
    // Create the chart
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [
          {
            label: 'Counts',
            data: this.data,
            backgroundColor: barColors,
            borderColor: borderColor,
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          tooltip: {
            enabled: true,
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            beginAtZero: false,
            display: true,
          },
        },
      },
    });
  }
}
