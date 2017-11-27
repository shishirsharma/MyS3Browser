import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {APP_BASE_HREF} from '@angular/common';


import { HeroesComponent }      from './heroes/heroes.component';
import { DashboardComponent }      from './dashboard/dashboard.component';
import { HeroDetailComponent }  from './hero-detail/hero-detail.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'dashboard', redirectTo: '',  pathMatch: 'full'},
  { path: 'detail/:id', component: HeroDetailComponent },
  { path: 'heroes', component: HeroesComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ],
  providers: [{provide: APP_BASE_HREF, useValue : '/' }]
})
export class AppRoutingModule { }
