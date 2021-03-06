import { Component, OnInit, Input } from '@angular/core';

import * as AWS from 'aws-sdk';

import { CredentialService } from '../credential.service';
import { MessageService } from '../message.service';
import { AwsS3Service } from '../aws-s3.service';

@Component({
  selector: 'app-navbar-dropdown-menu-link',
  templateUrl: './navbar-dropdown-menu-link.component.html',
  styleUrls: ['./navbar-dropdown-menu-link.component.css']
})
export class NavbarDropdownMenuLinkComponent implements OnInit {
  public buckets = [];

  @Input()  currentBucket: string;

  constructor(
    private awsS3Service: AwsS3Service,
    private credentialService: CredentialService
  ) {
    // this.credentialService
    //   .s3
    //   .subscribe(credential => {
    //     console.log('navbar-dropdown-menu-link.component#ngOnInit: Observable', credential);

    //     AWS.config.update({
    //       credentials: new AWS.Credentials(credential.access_key_id, credential.secret_access_key)
    //     });
    //     AWS.config.region = credential.s3_region;
    //     let s3 = new AWS.S3();

    //     this.awsS3Service.listBuckets(s3, (error, buckets) => {
    //       this.buckets  = buckets;
    //     });
    //   });

    this.credentialService
      .s3
      .subscribe(credential => {
        console.log('navbar-dropdown-menu-link.component#ngOnInit: Observable', credential);

        this.awsS3Service.listBuckets((error, buckets) => {
          this.buckets  = buckets;
        });
      });

    // let s3 = '';
    // this.awsS3Service.listBuckets((error, buckets) => {
    //   this.buckets  = buckets;
    // });

  }

  ngOnInit() {
  }

}
