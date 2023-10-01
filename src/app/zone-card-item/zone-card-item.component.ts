import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import Sublayer from '@arcgis/core/layers/support/Sublayer';
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

  features: __esri.Graphic[] = [];
  isZoneCardView: boolean = true;
  isTypeCardView: boolean = false;
  displayedZoneId: number;
  plotLayer: Sublayer;
  featuresSubtyped: Map<string | number, Graphic[]>;
  subtypes: Map<number | string, string> = new Map<number | string, string>();
  isBarChartReady: boolean = false;
  isLoading: boolean = false;

  constructor(
    private mapService: MapService,
    private _ZoneCardViewService: ZoneCardService,
    private _TypeCardService: TypeCardService,
    private _ZoneCardService: ZoneCardService
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    this.subscribeToServices();

    this.displayedZoneId = this.zone.id;

    this.features = await this._ZoneCardService.getFeaturesFromState(this.zone);
    const plotLayer = await this._ZoneCardService.getPlotLayer(this.zone);
    if (plotLayer) {
      this.plotLayer = plotLayer;
      const subtypes = plotLayer.sourceJSON.subtypes;
      this.subtypes = await this._TypeCardService.getSubtypesMap(
        this.plotLayer.url
      );

      this.featuresSubtyped = await this._TypeCardService.getFeaturesSubtyped(
        this.plotLayer.url
      );
    }

    this.isBarChartReady = true;
    this.isLoading = false;
  }

  zoneCardClicked() {
    this._ZoneCardViewService.setIsZoneCardView(false);
    this._ZoneCardViewService.setIsTypeCardView(true, this.zone.id);

    this.mapService.zoomToExtent(this.zone.fullExtent);
  }

  ngOnDestroy(): void {
    this._ZoneCardViewService.setIsZoneCardView(true);
    this._ZoneCardViewService.setIsTypeCardView(false, 0);
  }

  subscribeToServices() {
    this._ZoneCardViewService.isZoneCardView$.subscribe(
      (value) => (this.isZoneCardView = value)
    );
    this._ZoneCardViewService.isZoneDetailView$.subscribe((value) => {
      this.isTypeCardView = value.isCardDetailView;
      this.displayedZoneId = value.displayedZoneId;
    });
  }

  getBarChartValues(): {
    data: number[];
    labels: string[];
  } {
    const labels: string[] = [];
    const data: number[] = [];
    this.subtypes.forEach((value, key) => {
      const count = this.featuresSubtyped.get(key)?.length as number;
      if (count) {
        labels.push(value);
        data.push(count);
      }
    });
    return { data, labels };
  }
}
