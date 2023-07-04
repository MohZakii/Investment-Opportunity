import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import Sublayer from '@arcgis/core/layers/support/Sublayer';
import { PlotFeatures } from 'src/models/GS';
import { AppStateService } from 'src/services/app-state.service';
import { MapService } from 'src/services/map.service';
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
  isZoneDetailView: boolean = false;
  displayedZoneId: number;

  constructor(
    private _AppStateSrvc: AppStateService,
    private mapService: MapService,
    private zoneCardViewService: ZoneCardService
  ) {}

  async ngOnInit() {
    // subscribe to zone card click
    this.zoneCardViewService.isZoneDetailView$.subscribe((value) => {
      this.isZoneDetailView = value.isCardDetailView;
      this.displayedZoneId = value.displayedZoneId;
    });
    this.displayedZoneId = this.zone.id;

    let statePlotFeatures;
    this._AppStateSrvc.plotFeaturesList().map((item) => {
      if (item.zone.id === this.zone.id) {
        statePlotFeatures = item.features;
      }
    });

    // get features from state if exists (in order not to make query many times)
    if (statePlotFeatures) {
      this.features = statePlotFeatures;
    } else {
      const plotFeatures = await PlotFeatures.create(this.zone);
      this._AppStateSrvc.addPlotFeatures(plotFeatures);

      this.features = plotFeatures.features;
    }
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
}
