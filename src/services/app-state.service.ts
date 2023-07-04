import { Injectable, signal } from '@angular/core';
import { ZoneLayer } from 'src/models/GS';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  // track distance query results
  zonwLayerList = signal<ZoneLayer[]>([]);

  addzonwLayer(result: ZoneLayer) {
    this.zonwLayerList.mutate((res) => res.push(result));
  }
}
