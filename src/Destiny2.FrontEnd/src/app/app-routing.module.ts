import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatabaseComponent } from "./database/database.component";

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'database' },
  { path: "database", component: DatabaseComponent },
  { path: "database/:hash", component: DatabaseComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
