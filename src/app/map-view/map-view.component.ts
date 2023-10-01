import { Component, OnInit } from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import Map from '@arcgis/core/Map.js';
import Extent from '@arcgis/core/geometry/Extent';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import MapView from '@arcgis/core/views/MapView';
import { environment } from 'src/environments/environment';
import { MapViewSpatialReference } from 'src/models/GS';
import { AppStateService } from 'src/services/app-state.service';
import { MapService } from 'src/services/map.service';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
})
export class MapViewComponent implements OnInit {
  view!: MapView;
  map!: Map;
  mapImageLayer!: MapImageLayer;
  private serviceUrl = environment.serviceUrl;
  isMapReady: boolean = false;

  constructor(
    private _AppStateSrvc: AppStateService,
    private mapService: MapService
  ) {}
  ngOnInit(): void {
    this.initializeMap().then(() => {
      // creates zoneLayers in appState
      this.mapService.setZones(this.mapImageLayer);
      this.isMapReady = true;

      // set the mapview spatial reference to appState
      const spatialReference = new MapViewSpatialReference(
        this.view.spatialReference
      );
      this._AppStateSrvc.setMapViewSpatialReference(spatialReference);
    });

    this.subscribeToServices();
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
        var initialExtent = Extent.fromJSON(
          this.mapImageLayer.sourceJSON.initialExtent
        );
        this.view.goTo(initialExtent);
        // this.view.goTo({ target: this.mapImageLayer.fullExtent }, opts);
      });
    });

    return this.view.when();
  }

  subscribeToServices() {
    this.mapService.onZoomToExtent$.subscribe((value) => {
      this.zoomToExtent(value);
    });

    this.mapService.onFilterFeatures$.subscribe((value) => {
      if (value.plotLayer.url) {
        this.filterFeatures(value.plotLayer, value.features);
      }
    });
  }

  private zoomToExtent(fullExtent: __esri.Extent | __esri.Collection<Graphic>) {
    const opts = { duration: 1000 };
    this.view.goTo(fullExtent, opts);
  }

  private filterFeatures(
    plotLayer: __esri.Sublayer,
    features: __esri.Graphic[]
  ) {
    // create graphics layer and add it to the map
    let graphicsLayer = this.map.layers.find(
      (layer) => layer.id === plotLayer.id.toString()
    ) as GraphicsLayer;
    if (!graphicsLayer) {
      graphicsLayer = new GraphicsLayer({
        id: plotLayer.id.toString(),
      });
      this.map.add(graphicsLayer);
    }
    plotLayer.visible = false;
    graphicsLayer.graphics.removeAll();

    // create a graphic from each feature and add it
    features?.map((feature) => {
      const graphic = new Graphic({
        geometry: feature.geometry,
        symbol: plotLayer.renderer.get('symbol'),
      });

      graphicsLayer.add(graphic);
    });

    // zoom to result
    this.zoomToExtent(graphicsLayer.graphics);
  }
}
