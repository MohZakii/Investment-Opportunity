import { Injectable, signal } from '@angular/core';
import {
  MapViewSpatialReference,
  PlotFeatures,
  ZoneLayer,
} from 'src/models/GS';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  // track ZoneLayer instances
  zoneLayerList = signal<ZoneLayer[]>([]);

  // track PlotFeatures instances
  plotFeaturesList = signal<PlotFeatures[]>([]);

  // track mapview spatialReference
  spatialReference = signal<MapViewSpatialReference>(
    new MapViewSpatialReference()
  );

  setMapViewSpatialReference(spatialReference: MapViewSpatialReference) {
    this.spatialReference.set(spatialReference);
  }

  addzoneLayer(result: ZoneLayer) {
    this.zoneLayerList.mutate((res) => res.push(result));
  }

  addPlotFeatures(result: PlotFeatures) {
    this.plotFeaturesList.mutate((res) => res.push(result));
  }
}
