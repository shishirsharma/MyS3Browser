import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { Router }         from '@angular/router';

import { Observable } from 'rxjs/Rx';
// import { zip } from 'rxjs/operators';

import * as AWS from 'aws-sdk';

import { Credential } from '../credential';
import { AwsS3Service } from '../aws-s3.service';
import { CredentialService } from '../credential.service';

import { CredentialModalComponent } from '../credential-modal/credential-modal.component';

interface AlertData {
  type: string;
  category?: string;
  msg?: string;
  meta?: { width: number; height: number; };
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild(CredentialModalComponent) private credentialModal:CredentialModalComponent;

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
    private awsS3Service: AwsS3Service,
    private credentialService: CredentialService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    // console.log("dashboard.component#ngOnInit")
    let that = this;
    this.sub = Observable
      .combineLatest(this.route.queryParams, this.credentialService.s3, (params, s3) => ({params, s3}))
      .subscribe(values => {
        console.log('dashboard.component#ngOnInit: Observable', values);
        let params = values.params;
        let s3: any = values.s3;

        // Defaults to 0 if no query param provided.
        //let credential = this.credentialService.getCredential();

        that.s3Bucket = params['bucket'] || 'Select Bucket';
        that.s3Prefix = params['prefix'] || '';
        that.s3Marker = params['marker'] || null;
        that.searchPrefix = params['search'] || null;
        if(that.searchPrefix) {
          this.alert = {
            type: 'info',
            category: 'search'
          }
        }
        //s3.s3_bucket = this.s3Bucket;
        // console.log(s3);
        // this.awsS3Service.listBuckets(s3, (error, buckets) => {
        //   /// this.buckets  = buckets;
        //   if(buckets) {
        //     that.s3Bucket = buckets[0];
        //   }
        //   that.dashboardRenderData(s3);
        // });

        if(that.s3Bucket === 'Select Bucket') {
          if( s3.s3_bucket) {
            that.s3Bucket = s3.s3_bucket;
            that.dashboardRenderData(s3);
          } else {
            that.awsS3Service.listBuckets((error, buckets) => {
              if(error) {
                console.log('dashboard.component#dashboardRenderData: error in listObjects open credentialModal');
                this.error = {
                  type: 'danger',
                  category: 'custom',
                  msg: error.message
                };
                this.credentialModal.open();
              } else {
                /// this.buckets  = buckets;
                console.log('dashboard.component#ngOnInit', buckets)
                if(buckets) {
                  that.s3Bucket = buckets[0].Name;
                }
                that.dashboardRenderData(s3);
              }
            });
          }
        } else {
          that.dashboardRenderData(s3);
        }
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
    this.alert = {
      type: 'info',
      category: 'search'
    }

    this.router.navigate(['/index.html'], {
      queryParams: { 'bucket': this.s3Bucket, 'prefix': this.s3Prefix, 'search': this.searchPrefix }
    });
  }


  alert:AlertData;
  onDismisAlert() {
    this.alert = null;
  };

  error:AlertData;
  onDismisError() {
    this.error = null;
  };

  goBack() {
    this.alert = null;
    this.location.back(); // go back to previous location
  }

  onCredentialUpdate($event) {
    let credential = this.credentialService.getCredential();
    this.dashboardRenderData(credential);
  }

  onUpdate($event, extra) {
    let credential = this.credentialService.getCredential();
    if(extra === 'upload') {
      this.alert = {
        type: 'info',
        category: 'upload'
      };
    } else if(extra === 'create') {
      this.alert = {
        type: 'info',
        category: 'create'
      };
    }
    this.dashboardRenderData(credential);
  }

  onDelete(key) {
    this.credentialService
      .s3
      .subscribe(credential => {
        AWS.config.update({
          credentials: new AWS.Credentials(credential.access_key_id, credential.secret_access_key)
        });
        AWS.config.region = credential.s3_region;
        let s3 = new AWS.S3();

        let params = {
          Bucket: this.s3Bucket,
          Key: key
        };

        if(confirm('Are you sure you want to delete this?')) {
          s3.deleteObject(params, (error, data) => {
            this.dashboardRenderData(credential)
          });
        }
      });
  }

  dashboardRenderData(credential) {
    //let credential = this.credentialService.getCredential();

    console.log('dashboard.component#dashboardRenderData');

    // AWS.config.update({
    //   credentials: new AWS.Credentials(credential.access_key_id, credential.secret_access_key)
    // });
    // AWS.config.region = credential.s3_region;
    // let s3 = new AWS.S3();
    let s3 = '';
    this.awsS3Service.listObjects(this.s3Bucket, this.s3Prefix, this.searchPrefix, this.s3Marker, (error, files) => {
      if(error) {
        this.files = {
          'CommonPrefixes': [],
          'Contents': [],
          'NextMarker': ''
        };
        console.log('dashboard.component#dashboardRenderData: error in listObjects open credentialModal');
        this.error = {
          type: 'danger',
          category: 'custom',
          msg: error.message
        };
        // this.credentialModal.open();
      } else {
        this.error = null;
        this.files = files;
      }
    });
  }

}
