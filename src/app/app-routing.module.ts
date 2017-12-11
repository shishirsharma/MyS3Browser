import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {APP_BASE_HREF} from '@angular/common';


import { DashboardComponent }      from './dashboard/dashboard.component';

const routes: Routes = [
  { path: 'index.html', component: DashboardComponent },
  { path: '', redirectTo: 'index.html',  pathMatch: 'full'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ],
  providers: [{provide: APP_BASE_HREF, useValue : '/' }]
})
export class AppRoutingModule { }
