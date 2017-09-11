import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatabaseComponent } from './database/database.component';
import { DatabaseService } from "./database/database.service";
import { HttpModule } from '@angular/http';
import { ZipService } from "./shared/zip.service";

@NgModule({
  declarations: [
    AppComponent,
    DatabaseComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule
  ],
  providers: [DatabaseService, ZipService],
  bootstrap: [AppComponent]
})
export class AppModule { }
