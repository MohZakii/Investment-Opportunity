import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';
import Extent from '@arcgis/core/geometry/Extent.js';
import Sublayer from '@arcgis/core/layers/support/Sublayer.js';
import Graphic from '@arcgis/core/Graphic.js';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private serviceUrl = environment.serviceUrl;

  private zoomToExtentSubject = new BehaviorSubject<Extent>(new Extent());
  onZoomToExtent$ = this.zoomToExtentSubject.asObservable();

  private filterFeaturesSubject = new BehaviorSubject<{
    features: Graphic[];
    plotLayer: Sublayer;
  }>({ features: [], plotLayer: new Sublayer() });
  onFilterFeatures$ = this.filterFeaturesSubject.asObservable();

  constructor() {}

  zoomToExtent(fullExtent: Extent) {
    this.zoomToExtentSubject.next(fullExtent);
  }
  filterFeatures(plotLayer: Sublayer, features: Graphic[]) {
    this.filterFeaturesSubject.next({ features, plotLayer });
  }
}
