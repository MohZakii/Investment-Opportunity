import { Component, effect } from '@angular/core';
import Sublayer from '@arcgis/core/layers/support/Sublayer';
import { AppStateService } from 'src/services/app-state.service';

@Component({
  selector: 'app-zone-card-list',
  templateUrl: './zone-card-list.component.html',
  styleUrls: ['./zone-card-list.component.css'],
})
export class ZoneCardListComponent {
  zones: Sublayer[] = [];

  constructor(private _AppStateSrvc: AppStateService) {
    effect(() => {
      const stateZones = _AppStateSrvc
        .zoneLayerList()
        .map((item) => item.zoneLayer);
      if (stateZones.length !== this.zones.length) {
        this.zones = stateZones;
      }
    });
  }
}
