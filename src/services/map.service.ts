import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';
import Extent from '@arcgis/core/geometry/Extent.js';
import Sublayer from '@arcgis/core/layers/support/Sublayer.js';
import Graphic from '@arcgis/core/Graphic.js';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import { ZoneLayer } from 'src/models/GS';
import { AppStateService } from './app-state.service';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private serviceUrl = environment.serviceUrl;

  private zoomToExtentSubject = new BehaviorSubject<Extent>(new Extent());
  onZoomToExtent$ = this.zoomToExtentSubject.asObservable();

  private filterFeaturesSubject = new BehaviorSubject<{
    features: Graphic[];
    plotLayer: Sublayer;
  }>({ features: [], plotLayer: new Sublayer() });
  onFilterFeatures$ = this.filterFeaturesSubject.asObservable();

  constructor(private _AppStateSrvc: AppStateService) {}
  getZones(mapImageLayer: MapImageLayer) {
    // const obs = this.mapService.getZoneData(this.mapImageLayer)
    mapImageLayer.when(() => {
      mapImageLayer.sublayers.map((sublayer) => {
        sublayer.load().then((layer: Sublayer) => {
          if (
            layer.sourceJSON.type === 'Group Layer' &&
            layer.title !== 'Basemap'
          ) {
            // add zone layer to state if not added
            const stateZone = this._AppStateSrvc
              .zoneLayerList()
              .find((item) => item.zoneLayer.id === layer.id);
            if (!stateZone) {
              const zoneLayer = new ZoneLayer(layer);
              this._AppStateSrvc.addzoneLayer(zoneLayer);
            }
          }
        });
      });
    });
  }
  zoomToExtent(fullExtent: Extent) {
    this.zoomToExtentSubject.next(fullExtent);
  }
  filterFeatures(plotLayer: Sublayer, features: Graphic[]) {
    this.filterFeaturesSubject.next({ features, plotLayer });
  }
}
