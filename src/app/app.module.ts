import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { MapViewComponent } from './map-view/map-view.component';
import { HttpClientModule } from '@angular/common/http';
import { LegendComponent } from './legend/legend.component';
import { ZoneCardListComponent } from './zone-card-list/zone-card-list.component';
import { ZoneCardItemComponent } from './zone-card-item/zone-card-item.component';
import { TypeCardListComponent } from './type-card-list/type-card-list.component';
import { TypeCardItemComponent } from './type-card-item/type-card-item.component';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    MapViewComponent,
    LegendComponent,
    ZoneCardListComponent,
    ZoneCardItemComponent,
    TypeCardListComponent,
    TypeCardItemComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
