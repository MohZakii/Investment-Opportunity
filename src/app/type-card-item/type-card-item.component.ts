import { Component, Input } from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import Sublayer from '@arcgis/core/layers/support/Sublayer';
import { MapService } from 'src/services/map.service';

@Component({
  selector: 'app-type-card-item',
  templateUrl: './type-card-item.component.html',
  styleUrls: ['./type-card-item.component.css'],
})
export class TypeCardItemComponent {
  @Input('subtype') subtype: string;
  @Input('plotLayer') plotLayer: Sublayer;
  @Input('features') features: Graphic[] | undefined;

  constructor(private mapService: MapService) {}

  zoneDetailClicked() {
    this.mapService.filterFeatures(
      this.plotLayer,
      this.features as __esri.Graphic[]
    );
  }
  // getTypesLength(subtype: number | string): number | undefined {
  //   return this.featuresSubtyped.get(subtype)?.length;
  // }
}
