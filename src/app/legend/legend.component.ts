import { Component, Input, OnInit } from '@angular/core';
import MapView from '@arcgis/core/views/MapView';
import Expand from '@arcgis/core/widgets/Expand';
import Legend from '@arcgis/core/widgets/Legend';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css'],
})
export class LegendComponent implements OnInit {
  @Input('view') view!: MapView;
  ngOnInit(): void {
    const legend = new Legend({
      view: this.view,
      style: 'card',
    });
    this.view.ui.add(
      new Expand({ view: this.view, content: legend }),
      'top-left'
    );
  }
}
