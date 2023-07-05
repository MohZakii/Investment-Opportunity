import Sublayer from '@arcgis/core/layers/support/Sublayer';
import Query from '@arcgis/core/rest/support/Query';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Graphic from '@arcgis/core/Graphic';
import { ZoneCardService } from 'src/services/zone-card.service';
import { AppStateService } from 'src/services/app-state.service';
import { TypeCardService } from 'src/services/type-card.service';

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
  features: Graphic[] = [];

  constructor(zone: Sublayer) {
    this.zone = zone;
  }

  // async function to create instance and await for features query
  static async create(zone: Sublayer): Promise<PlotFeatures> {
    const instance = new PlotFeatures(zone);
    instance.plotLayer = await PlotFeatures.getPlotLayer(zone);
    instance.features = await PlotFeatures.getFeaturesByQuery(
      instance.plotLayer
    );
    return instance;
  }

  static async getPlotLayer(zone: Sublayer): Promise<Sublayer> {
    const appStateSrvc = new AppStateService();
    const zoneCardService = new ZoneCardService(appStateSrvc);

    let plotLayer: Sublayer;
    plotLayer = await zoneCardService.getPlotLayer(zone);

    return plotLayer;
  }
  static async getFeaturesByQuery(plotLayer: Sublayer): Promise<Graphic[]> {
    const appStateSrvc = new AppStateService();

    const queryObj = new Query({
      where: '1=1',
      outFields: ['*'],
      returnGeometry: true,
      outSpatialReference: appStateSrvc.spatialReference().spatialReference,
      num: 2000,
      start: 0,
    });

    const allFeatures: __esri.Graphic[] = [];

    const queryNextFeatures = (
      startIndex: number
    ): Promise<__esri.Graphic[]> => {
      queryObj.start = startIndex;

      return plotLayer
        ?.queryFeatures(queryObj)
        .then((response: __esri.FeatureSet) => {
          const { features } = response;

          // Add the features to the array
          allFeatures.push(...features);

          // If the features length is equal to the limit, there might be more features
          if (features.length === queryObj.num) {
            return queryNextFeatures(startIndex + features.length);
          } else {
            return allFeatures;
          }
        });
    };

    const finalFeatures = await queryNextFeatures(0);
    return finalFeatures;
  }
}
