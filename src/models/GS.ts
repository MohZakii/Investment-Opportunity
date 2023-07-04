import Sublayer from '@arcgis/core/layers/support/Sublayer';

export class ZoneLayer {
  zoneLayer: Sublayer;

  constructor(zoneLayer: Sublayer) {
    this.zoneLayer = zoneLayer;
  }
}
