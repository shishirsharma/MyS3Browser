import { Component, OnInit,  Input } from '@angular/core';


import { CredentialService } from '../credential.service';
import { MessageService } from '../message.service';
import { AwsS3Service } from '../aws-s3.service';

@Component({
  selector: 'app-navbar-dropdown-credential-menu',
  templateUrl: './navbar-dropdown-credential-menu.component.html',
  styleUrls: ['./navbar-dropdown-credential-menu.component.css']
})
export class NavbarDropdownCredentialMenuComponent implements OnInit {
  public credentials = [];

  constructor(
    private awsS3Service: AwsS3Service,
    private credentialService: CredentialService
  ) {

    this.credentialService
      .credentials
      .subscribe(credentials => {
        console.log('navbar-dropdown-menu-link.component#ngOnInit: Observable', credentials);
        this.credentials = credentials;
      });

  }

  ngOnInit() {
  }
  currentCredential: any;
}
