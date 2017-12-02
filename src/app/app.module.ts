import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService }  from './in-memory-data.service';

import { AppRoutingModule }     from './app-routing.module';

import { CredentialService }    from './credential.service';
import { AwsS3Service }         from './aws-s3.service';
import { HeroService }          from './hero.service';
import { MessageService }       from './message.service';

import { AppComponent }         from './app.component';
import { DashboardComponent }   from './dashboard/dashboard.component';
import { HeroDetailComponent }  from './hero-detail/hero-detail.component';
import { HeroesComponent }      from './heroes/heroes.component';
import { HeroSearchComponent }  from './hero-search/hero-search.component';
import { MessagesComponent }    from './messages/messages.component';
import { CredentialModalComponent } from './credential-modal/credential-modal.component';
import { UploadModalComponent } from './upload-modal/upload-modal.component';
import { HelpModalComponent } from './help-modal/help-modal.component';
import { NavbarDropdownMenuLinkComponent } from './navbar-dropdown-menu-link/navbar-dropdown-menu-link.component';

@NgModule({
  imports: [
    NgbModule.forRoot(),
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,

    // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
    // and returns simulated server responses.
    // Remove it when a real server is ready to receive requests.
    HttpClientInMemoryWebApiModule.forRoot(
      InMemoryDataService, { dataEncapsulation: false }
    )
  ],
  declarations: [
    AppComponent,
    DashboardComponent,
    HeroesComponent,
    HeroDetailComponent,
    MessagesComponent,
    HeroSearchComponent,
    CredentialModalComponent,
    UploadModalComponent,
    HelpModalComponent,
    NavbarDropdownMenuLinkComponent
  ],
  // entryComponents: [ CredentialModalComponent ],
  providers: [ HeroService, MessageService, CredentialService, AwsS3Service ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
