import { Component, OnInit, effect } from '@angular/core';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map.js';
import Sublayer from '@arcgis/core/layers/support/Sublayer.js';
import { environment } from 'src/environments/environment';
import { MapService } from 'src/services/map.service';
import { ZoneLayer } from 'src/models/GS';
import { AppStateService } from 'src/services/app-state.service';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
})
export class MapViewComponent implements OnInit {
  view!: MapView;
  map!: Map;
  mapImageLayer!: MapImageLayer;
  zones: Sublayer[] = [];
  private serviceUrl = environment.serviceUrl;
  isMapReady: boolean = false;

  constructor(
    private _AppStateSrvc: AppStateService,
    private mapService: MapService
  ) {
    effect(() => {
      this.zones = _AppStateSrvc.zonwLayerList().map((item) => item.zoneLayer);
    });
  }

  ngOnInit(): void {
    this.initializeMap().then(() => {
      this.isMapReady = true;
      this.mapService.getZones(this.mapImageLayer);
    });

    this.mapService.onZoomToExtent$.subscribe((value) => {
      this.zoomToExtent(value);
    });
  }

  async initializeMap(): Promise<any> {
    this.mapImageLayer = new MapImageLayer({
      url: this.serviceUrl,
    });

    this.map = new Map({
      basemap: 'gray-vector',
      layers: [this.mapImageLayer],
    });

    this.view = new MapView({
      container: 'viewDiv',
      map: this.map,
      zoom: 8,
    });

    this.mapImageLayer.when(() => {
      this.view.when(() => {
        const opts = { duration: 1000 };
        this.view.goTo({ target: this.mapImageLayer.fullExtent }, opts);
      });
    });

    return this.view.when();
  }
  zoomToExtent(fullExtent: __esri.Extent) {
    const opts = { duration: 1000 };
    this.view.goTo(fullExtent, opts);
  }
}
