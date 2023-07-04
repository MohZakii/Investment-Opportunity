import Sublayer from '@arcgis/core/layers/support/Sublayer';
import Query from '@arcgis/core/rest/support/Query';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Graphic from '@arcgis/core/Graphic';
import { ZoneCardService } from 'src/services/zone-card.service';
import { AppStateService } from 'src/services/app-state.service';
import { first, lastValueFrom } from 'rxjs';
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
  features: Graphic[] = [];
  plotLayer: Sublayer;
  static typeCardService: TypeCardService | undefined;

  constructor(zone: Sublayer, private typeCardService?: TypeCardService) {
    this.zone = zone;
    PlotFeatures.typeCardService = typeCardService;
  }

  // async function to create instance and await for features
  static async create(zone: Sublayer): Promise<PlotFeatures> {
    const instance = new PlotFeatures(zone);
    await instance.getFeatures();
    return instance;
  }

  static async getFeaturesSubtyped(
    zoneId: number
  ): Promise<Map<string | number, Graphic[]>> {
    const featuresSubtyped: Map<number | string, Graphic[]> = new Map<
      number,
      Graphic[]
    >();
    const appStateSrvc = new AppStateService();
    console.log(appStateSrvc.plotFeaturesList());

    const plotFeaturesInstance: PlotFeatures | undefined = appStateSrvc
      .plotFeaturesList()
      .find((item) => {
        item.zone.id === zoneId;
      });

    if (plotFeaturesInstance && PlotFeatures.typeCardService) {
      const typeIdField: string | undefined = await lastValueFrom(
        PlotFeatures.typeCardService
          .getTypeIdField(plotFeaturesInstance.plotLayer.url)
          .pipe(first())
      );

      plotFeaturesInstance.features.forEach((feature) => {
        const subtype = feature.attributes[typeIdField as string];
        if (featuresSubtyped.has(subtype)) {
          featuresSubtyped.get(subtype)?.push(feature);
        } else {
          featuresSubtyped.set(subtype, [feature]);
        }
      });
    }
    return featuresSubtyped;
  }

  async getFeatures() {
    const zoneCardService = new ZoneCardService();
    const appStateSrvc = new AppStateService();

    let plotLayer: Sublayer;
    plotLayer = await zoneCardService.getPlotLayer(this.zone);
    this.plotLayer = plotLayer;
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
    this.features = finalFeatures;
  }
}
