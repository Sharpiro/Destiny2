import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatabaseComponent } from './database/database.component';
import { HttpModule } from '@angular/http';
import { ZipService } from "./shared/zip.service";
import { DestinyApiService } from "./shared/destinyApi.service";
import { FormsModule } from '@angular/forms';
import { databaseService } from './shared/database.service.provider';
import { DatabaseService } from './shared/database.service';

@NgModule({
  declarations: [
    AppComponent,
    DatabaseComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule,
    FormsModule
  ],
  providers: [
    DestinyApiService,
    ZipService,
    databaseService],
  bootstrap: [AppComponent]
})
export class AppModule { }