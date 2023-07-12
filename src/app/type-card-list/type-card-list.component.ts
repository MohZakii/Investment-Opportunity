import { Component, Input, OnInit } from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import Sublayer from '@arcgis/core/layers/support/Sublayer';
import { first, firstValueFrom, lastValueFrom } from 'rxjs';
import { ISubtype } from 'src/interfaces/subtype';
import { PlotFeatures } from 'src/models/GS';
import { AppStateService } from 'src/services/app-state.service';
import { PlotFeaturesService } from 'src/services/plot-features.service';
import { TypeCardService } from 'src/services/type-card.service';

@Component({
  selector: 'app-type-card-list',
  templateUrl: './type-card-list.component.html',
  styleUrls: ['./type-card-list.component.css'],
})
export class TypeCardListComponent implements OnInit {
  @Input('zone') zone: Sublayer;
  features: __esri.Graphic[] = [];
  plotLayer: Sublayer;

  subtypes: Map<number | string, string> = new Map<number | string, string>();
  featuresSubtyped: Map<number | string, __esri.Graphic[]> = new Map<
    number,
    __esri.Graphic[]
  >();

  constructor(
    private _AppStateSrvc: AppStateService,
    private _TypeCardService: TypeCardService,
    private _PlotFeaturesService: PlotFeaturesService
  ) {}

  async ngOnInit() {
    await this.setFeatures();

    this.subtypes = await this._TypeCardService.getSubtypesMap(
      this.plotLayer.url
    );

    this.featuresSubtyped = await this._TypeCardService.getFeaturesSubtyped(
      this.plotLayer.url
    );
  }
  async setFeatures() {
    let statePlotFeatures = this._AppStateSrvc
      .plotFeaturesList()
      .find((item) => item.zone.id === this.zone.id);

    // get features from state if exists (in order not to make query many times)
    if (statePlotFeatures) {
      this.features = statePlotFeatures.features;
      await statePlotFeatures.plotLayer.when();
      this.plotLayer = statePlotFeatures.plotLayer;
    } else {
      const plotLayer = await this._PlotFeaturesService.getPlotLayer(this.zone);
      const features = await this._PlotFeaturesService.getFeaturesByQuery(
        plotLayer
      );
      const plotFeatures = new PlotFeatures(this.zone, plotLayer, features);
      this._AppStateSrvc.addPlotFeatures(plotFeatures);

      this.features = plotFeatures.features;
      await plotFeatures.plotLayer.when();
      this.plotLayer = plotFeatures.plotLayer;
    }
  }
}
