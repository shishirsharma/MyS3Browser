import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { Router }         from '@angular/router';

import { Hero } from '../hero';

import { HeroService} from '../hero.service';
import { AwsS3Service } from '../aws-s3.service';
import { CredentialService } from '../credential.service';

// import { CredentialModalComponent } from '../credential-modal/credential-modal.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // @ViewChild(CredentialModalComponent) private credentialModal:CredentialModalComponent;

  heroes: Hero[] = [];

  public files = {
    'CommonPrefixes': [],
    'Contents': [],
    'NextMarker': ''
  };
  public aws_error = true;

  public sub;
  public s3Bucket
  public s3Prefix = ""
  public s3Marker = ""

  constructor(
    private heroService: HeroService,
    private awsS3Service: AwsS3Service,
    private credentialService: CredentialService,
    private location: Location,
    private route: ActivatedRoute
    // private router: Router
  ) {
  }

  ngOnInit() {
    console.log("dashboard.component#ngOnInit")
    this.getHeroes();
    // this.s3Prefix = this.route.snapshot.paramMap.get('prefix');
    this.sub = this.route
      .queryParams
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        let credential = this.credentialService.getCredential();

        this.s3Bucket = params['bucket'] || credential.s3_bucket || 'Select Bucket';
        this.s3Prefix = params['prefix'] || '';
        this.s3Marker = params['marker'] || '';

        credential.s3_bucket = this.s3Bucket;
        this.dashboardRenderData();
      });
  }

  ngAfterViewInit() {
    // if(this.aws_error) {
    //   console.log(this.aws_error);
    //   this.credentialModal.open();
    // }
    // child is set
  }

  goBack() {
    this.location.back(); // go back to previous location
  }

  onCredentialUpdate($event) {
    this.dashboardRenderData();
  }

  dashboardRenderData() {
    let credential = this.credentialService.getCredential();

    console.log('dashboard.component#dashboardRenderData');
    if(credential.s3_bucket !== '') {
      this.s3Bucket = credential.s3_bucket;
    }

    this.awsS3Service.listObjects(this.s3Bucket, this.s3Prefix, this.s3Marker, (error, files) => {
      if(error) {
        this.files = {
          'CommonPrefixes': [],
          'Contents': [],
          'NextMarker': ''
        };
        this.aws_error = true;
        console.log('dashboard.component#dashboardRenderData: error in listObjects open credentialModal');
      } else {
        this.aws_error = false;
        this.files = files;
      }
    });
  }

  getHeroes(): void {
    this.heroService.getHeroes()
      .subscribe(heroes => this.heroes = heroes.slice(1, 5));
  }

}
