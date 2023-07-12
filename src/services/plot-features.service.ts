import { Injectable } from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import Sublayer from '@arcgis/core/layers/support/Sublayer';
import { PlotFeatures } from 'src/models/GS';
import { AppStateService } from './app-state.service';
import { ZoneCardService } from './zone-card.service';
import Query from '@arcgis/core/rest/support/Query';

@Injectable({
  providedIn: 'root',
})
export class PlotFeaturesService {
  constructor(private appStateSrvc: AppStateService) {}

  async getPlotLayer(zone: Sublayer): Promise<Sublayer> {
    await zone.when();
    let plotLayer: Sublayer;

    // search for plot layer as a direct sublayer
    plotLayer = zone.sublayers.find((sublayer) => sublayer.title === 'Plot');

    // search for plot layer as a sublayer of the sublayer
    if (!plotLayer) {
      zone.sublayers.map((item) => {
        if (!plotLayer) {
          plotLayer = item.sublayers?.find(
            (sublayer: Sublayer) => sublayer.title === 'Plot'
          );
        }
      });
    }

    return plotLayer;
  }
  async getFeaturesByQuery(plotLayer: Sublayer): Promise<Graphic[]> {
    const queryObj = new Query({
      where: '1=1',
      outFields: ['*'],
      returnGeometry: true,
      outSpatialReference:
        this.appStateSrvc.spatialReference().spatialReference,
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
