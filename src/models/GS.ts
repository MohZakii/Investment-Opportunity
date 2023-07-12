import Sublayer from '@arcgis/core/layers/support/Sublayer';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Graphic from '@arcgis/core/Graphic';

export class MapViewSpatialReference {
  spatialReference: SpatialReference | undefined;

  constructor(spatialReference?: SpatialReference) {
    this.spatialReference = spatialReference;
  }
}

export class ZoneLayer {
  zoneLayer: Sublayer;

  constructor(zoneLayer: Sublayer) {
    this.zoneLayer = zoneLayer;
  }
}

export class PlotFeatures {
  zone: Sublayer;
  plotLayer: Sublayer;
  features: Graphic[];

  constructor(zone: Sublayer, plotLayer: Sublayer, features: Graphic[]) {
    this.zone = zone;
    this.plotLayer = plotLayer;
    this.features = features;
  }
}
