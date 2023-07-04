import { Component, Input, OnInit } from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import Sublayer from '@arcgis/core/layers/support/Sublayer';
import { first, lastValueFrom } from 'rxjs';
import { ISubtype } from 'src/interfaces/subtype';
import { PlotFeatures } from 'src/models/GS';
import { AppStateService } from 'src/services/app-state.service';
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
    private _TypeCardService: TypeCardService
  ) {}

  async ngOnInit() {
    await this.getFeatures();

    this.getSubtypes();

    this.featuresSubtyped = await this.getFeaturesSubtyped();
  }
  async getFeatures() {
    let statePlotFeatures = this._AppStateSrvc
      .plotFeaturesList()
      .find((item) => item.zone.id === this.zone.id);

    // get features from state if exists (in order not to make query many times)
    if (statePlotFeatures) {
      this.features = statePlotFeatures.features;
      await statePlotFeatures.plotLayer.when();
      this.plotLayer = statePlotFeatures.plotLayer;
    } else {
      const plotFeatures = await PlotFeatures.create(this.zone);
      this._AppStateSrvc.addPlotFeatures(plotFeatures);

      this.features = plotFeatures.features;
      await plotFeatures.plotLayer.when();
      this.plotLayer = plotFeatures.plotLayer;
    }
  }
  getSubtypes() {
    this._TypeCardService
      .getSubtypes(this.plotLayer.url)
      .subscribe((subtypes: ISubtype[]) => {
        subtypes.map((subtype) => {
          this.subtypes.set(subtype.code, subtype.name);
        });
      });
  }
  async getFeaturesSubtyped(): Promise<Map<string | number, Graphic[]>> {
    const featuresSubtyped: Map<number | string, Graphic[]> = new Map<
      number,
      Graphic[]
    >();

    const typeIdField: string | undefined = await lastValueFrom(
      this._TypeCardService.getTypeIdField(this.plotLayer.url).pipe(first())
    );

    this.features.forEach((feature) => {
      const subtype = feature.attributes[typeIdField as string];
      if (featuresSubtyped.has(subtype)) {
        featuresSubtyped.get(subtype)?.push(feature);
      } else {
        featuresSubtyped.set(subtype, [feature]);
      }
    });

    return featuresSubtyped;
  }
}
