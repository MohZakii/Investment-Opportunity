import { Injectable } from '@angular/core';
import Sublayer from '@arcgis/core/layers/support/Sublayer';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PlotFeatures } from 'src/models/GS';
import { AppStateService } from './app-state.service';
import { PlotFeaturesService } from './plot-features.service';

@Injectable({
  providedIn: 'root',
})
export class ZoneCardService {
  private isZoneCardViewSubject = new BehaviorSubject<boolean>(true);
  isZoneCardView$ = this.isZoneCardViewSubject.asObservable();
  plotLayerNamePrefix: string;

  private isZoneDetailViewSubject = new BehaviorSubject<{
    isCardDetailView: boolean;
    displayedZoneId: number;
  }>({ isCardDetailView: false, displayedZoneId: 0 });
  isZoneDetailView$ = this.isZoneDetailViewSubject.asObservable();

  constructor(
    private _AppStateSrvc: AppStateService,
    private _PlotFeaturesService: PlotFeaturesService
  ) {
    this.plotLayerNamePrefix = environment.plotLayerNamePrefix;
  }

  setIsZoneCardView(value: boolean) {
    this.isZoneCardViewSubject.next(value);
  }

  setIsTypeCardView(isCardDetailView: boolean, displayedZoneId: number) {
    this.isZoneDetailViewSubject.next({
      isCardDetailView,
      displayedZoneId: displayedZoneId,
    });
  }

  async getPlotLayer(zone: Sublayer): Promise<Sublayer | undefined> {
    await zone.when();
    let plotLayer: Sublayer;

    // search for plot layer as a direct sublayer
    plotLayer = zone.sublayers?.find((sublayer) =>
      sublayer.title.startsWith(this.plotLayerNamePrefix)
    );

    // search for plot layer as a sublayer of the sublayer
    if (!plotLayer) {
      zone.sublayers?.map((item) => {
        if (!plotLayer) {
          plotLayer = item.sublayers?.find((sublayer: Sublayer) =>
            sublayer.title.startsWith(this.plotLayerNamePrefix)
          );
        }
      });
    }

    if (plotLayer) {
      return plotLayer;
    } else {
      return undefined;
    }
  }

  async getFeaturesFromState(zone: Sublayer): Promise<__esri.Graphic[]> {
    let statePlotFeatures = this._AppStateSrvc
      .plotFeaturesList()
      .find((item) => item.zone.id === zone.id);

    // get features from state if exists (in order not to make query many times)
    let features;
    if (statePlotFeatures) {
      features = statePlotFeatures.features;
    } else {
      const plotLayer = await this._PlotFeaturesService.getPlotLayer(zone);
      if (plotLayer) {
        features = await this._PlotFeaturesService.getFeaturesByQuery(
          plotLayer
        );
        const plotFeatures = new PlotFeatures(zone, plotLayer, features);
        this._AppStateSrvc.addPlotFeatures(plotFeatures);
      }
    }
    if (features) {
      return features;
    } else {
      return [];
    }
  }
}
