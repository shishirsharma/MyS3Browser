import { Component, OnInit } from '@angular/core';

import { CredentialService } from '../credential.service';
import { MessageService } from '../message.service';
import { AwsS3Service} from '../aws-s3.service';

@Component({
  selector: 'app-navbar-dropdown-menu-link',
  templateUrl: './navbar-dropdown-menu-link.component.html',
  styleUrls: ['./navbar-dropdown-menu-link.component.css']
})
export class NavbarDropdownMenuLinkComponent implements OnInit {
  public buckets

  constructor(
    private awsS3Service: AwsS3Service,
    private credentialService: CredentialService
  ) {
    this.awsS3Service.listBuckets((error, buckets) => {
      this.buckets  = buckets;
    });
  }

  ngOnInit() {
  }

}
