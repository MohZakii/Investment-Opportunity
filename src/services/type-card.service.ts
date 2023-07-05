import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import { Observable, first, firstValueFrom, lastValueFrom, map } from 'rxjs';
import { ISubtype } from 'src/interfaces/subtype';
import { AppStateService } from './app-state.service';

@Injectable({
  providedIn: 'root',
})
export class TypeCardService {
  constructor(
    private http: HttpClient,
    private _AppStateSrvc: AppStateService
  ) {}

  getSubtypes(plotURL: string): Observable<ISubtype[]> {
    return this.http
      .get<any>(`${plotURL}?f=pjson`)
      .pipe(map((response: any) => response.subtypes as ISubtype[]));
  }

  getTypeIdField(plotURL: string): Observable<string> {
    return this.http
      .get<any>(`${plotURL}?f=pjson`)
      .pipe(map((response: any) => response.typeIdField as string));
  }

  async getSubtypesMap(plotURL: string): Promise<Map<number | string, string>> {
    let subtypesMap: Map<number | string, string> = new Map<
      number | string,
      string
    >();
    const subtypes = await firstValueFrom(this.getSubtypes(plotURL));
    subtypes?.forEach((subtype) => {
      subtypesMap.set(subtype.code, subtype.name);
    });

    return subtypesMap;
  }

  async getFeaturesSubtyped(
    plotURL: string
  ): Promise<Map<string | number, Graphic[]>> {
    const featuresSubtyped: Map<number | string, Graphic[]> = new Map<
      number,
      Graphic[]
    >();

    const typeIdField: string | undefined = await lastValueFrom(
      this.getTypeIdField(plotURL).pipe(first())
    );

    // get features from state
    let features;
    let statePlotFeatures = this._AppStateSrvc
      .plotFeaturesList()
      .find((item) => item.plotLayer.url === plotURL);
    if (statePlotFeatures) {
      features = statePlotFeatures.features;
    }
    features?.forEach((feature) => {
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
