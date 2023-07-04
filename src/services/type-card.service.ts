import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ISubtype } from 'src/interfaces/subtype';

@Injectable({
  providedIn: 'root',
})
export class TypeCardService {
  constructor(private http: HttpClient) {}

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
}
