import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { Router }         from '@angular/router';

import { Observable } from 'rxjs/Rx';
// import { zip } from 'rxjs/operators';

import * as AWS from 'aws-sdk';

import { Hero } from '../hero';

import { HeroService} from '../hero.service';
import { AwsS3Service } from '../aws-s3.service';
import { CredentialService } from '../credential.service';

import { CredentialModalComponent } from '../credential-modal/credential-modal.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild(CredentialModalComponent) private credentialModal:CredentialModalComponent;

  heroes: Hero[] = [];

  public files = {
    'CommonPrefixes': [],
    'Contents': [],
    'NextMarker': ''
  };
  public aws_error = false;

  public sub;
  public s3Bucket = 'Select Bucket';
  public s3Prefix = "/";
  public s3Marker = "";

  constructor(
    private heroService: HeroService,
    private awsS3Service: AwsS3Service,
    private credentialService: CredentialService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    // console.log("dashboard.component#ngOnInit")
    this.getHeroes();

    let that = this;
    this.sub = Observable
      .combineLatest(this.route.queryParams, this.credentialService.s3, (params, s3) => ({params, s3}))
      .subscribe(values => {
        console.log('dashboard.component#ngOnInit: Observable', values);
        let [params, s3] = [values.params, values.s3];

        // Defaults to 0 if no query param provided.
        //let credential = this.credentialService.getCredential();

        that.s3Bucket = params['bucket'] ||'Select Bucket';
        that.s3Prefix = params['prefix'] || '';
        that.s3Marker = params['marker'] || null;
        that.searchPrefix = params['search'] || null;
        if(that.searchPrefix) {
              this.alert = true;
        }
        //s3.s3_bucket = this.s3Bucket;
        that.dashboardRenderData(s3);
      });
  }

  ngAfterViewInit() {
    // if(this.aws_error) {
    //   console.log(this.aws_error);
    // }
    // child is set
  }

  onSearchKey(event: any){
    this.onSearch(this.searchPrefix);
  }

  searchPrefix:string = '';
  onSearch(query) {
    this.alert = true;
    this.router.navigate(['/index.html'], {
      queryParams: { 'bucket': this.s3Bucket, 'prefix': this.s3Prefix, 'search': this.searchPrefix }
    });
  }

  alert:boolean = false;
  onDismisAlert() {
    this.alert = false;
  };

  goBack() {
    this.location.back(); // go back to previous location
  }

  onCredentialUpdate($event) {
    let credential = this.credentialService.getCredential();
    this.dashboardRenderData(credential);
  }

  onUpdate($event) {
    let credential = this.credentialService.getCredential();
    this.dashboardRenderData(credential);
  }

  dashboardRenderData(credential) {
    //let credential = this.credentialService.getCredential();

    console.log('dashboard.component#dashboardRenderData');
    if(this.s3Bucket === 'Select Bucket') {
      this.s3Bucket = credential.s3_bucket;
    }
    AWS.config.update({
      credentials: new AWS.Credentials(credential.access_key_id, credential.secret_access_key)
    });
    AWS.config.region = credential.s3_region;
    let s3 = new AWS.S3();
    this.awsS3Service.listObjects(s3, this.s3Bucket, this.s3Prefix, this.searchPrefix, this.s3Marker, (error, files) => {
      if(error) {
        this.files = {
          'CommonPrefixes': [],
          'Contents': [],
          'NextMarker': ''
        };
        this.aws_error = true;
        console.log('dashboard.component#dashboardRenderData: error in listObjects open credentialModal');
        this.credentialModal.open();
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
