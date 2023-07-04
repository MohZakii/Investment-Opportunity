import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import Sublayer from '@arcgis/core/layers/support/Sublayer';
import { Chart } from 'chart.js';
import { lastValueFrom, first } from 'rxjs';
import { ISubtype } from 'src/interfaces/subtype';
import { PlotFeatures } from 'src/models/GS';
import { AppStateService } from 'src/services/app-state.service';
import { MapService } from 'src/services/map.service';
import { TypeCardService } from 'src/services/type-card.service';
import { ZoneCardService } from 'src/services/zone-card.service';

@Component({
  selector: 'app-zone-card-item',
  templateUrl: './zone-card-item.component.html',
  styleUrls: ['./zone-card-item.component.css'],
})
export class ZoneCardItemComponent implements OnInit, OnDestroy {
  @Input('zone') zone: Sublayer;
  @ViewChild('chartCanvas') chartCanvas: ElementRef;
  private chart: Chart;

  features: __esri.Graphic[] = [];
  isZoneCardView: boolean = true;
  isTypeCardView: boolean = false;
  displayedZoneId: number;
  plotLayer: Sublayer;
  featuresSubtyped: Map<string | number, Graphic[]>;
  subtypes: Map<number | string, string> = new Map<number | string, string>();

  constructor(
    private _AppStateSrvc: AppStateService,
    private mapService: MapService,
    private zoneCardViewService: ZoneCardService,
    private _TypeCardService: TypeCardService
  ) {}

  async ngOnInit() {
    // subscribe to zone card click
    this.zoneCardViewService.isZoneCardView$.subscribe(
      (value) => (this.isZoneCardView = value)
    );
    this.zoneCardViewService.isZoneDetailView$.subscribe((value) => {
      this.isTypeCardView = value.isCardDetailView;
      this.displayedZoneId = value.displayedZoneId;
    });
    this.displayedZoneId = this.zone.id;

    await this.getFeatures();
    this.featuresSubtyped = await this.getFeaturesSubtyped();
  }

  zoneCardClicked() {
    this.zoneCardViewService.setIsZoneCardView(false);
    this.zoneCardViewService.setIsTypeCardView(true, this.zone.id);

    // this.view.goTo(this.zone.fullExtent);
    this.mapService.zoomToExtent(this.zone.fullExtent);
  }

  ngOnDestroy(): void {
    this.zoneCardViewService.setIsZoneCardView(true);
    this.zoneCardViewService.setIsTypeCardView(false, 0);
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

    // TODO
    // this.createChart();
    return featuresSubtyped;
  }
  createChart(): void {
    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    // Create your data for the chart (plot types and counts)
    const plotTypes: string[] = [];
    const counts: number[] = [];
    this.subtypes.forEach((subtype) => {
      plotTypes.push(subtype);
      counts.push(this.featuresSubtyped.get(subtype)?.length as number);
    });

    // Create the chart
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: plotTypes,
        datasets: [
          {
            label: 'Counts',
            data: counts,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}
