import { Component, OnInit } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { Router }         from '@angular/router';

import { Hero } from '../hero';

import { HeroService} from '../hero.service';
import { AwsS3Service } from '../aws-s3.service';
import { CredentialService } from '../credential.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  heroes: Hero[] = [];
  public files = [];
  public sub;
  public s3Bucket
  public s3Prefix = ""
  public s3Marker = ""

  constructor(
    private heroService: HeroService,
    private awsS3Service: AwsS3Service,
    private credentialService: CredentialService,
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
        this.s3Bucket = params['bucket'] || '';
        this.s3Prefix = params['prefix'] || '';
        this.s3Marker = params['marker'] || '';

        let credential = this.credentialService.getCredential();
        credential.s3_bucket = this.s3Bucket;

        this.awsS3Service.listObjects(this.s3Bucket, this.s3Prefix, this.s3Marker, (error, files) => {
          this.files = files;
        });
      });
  }

  getHeroes(): void {
    this.heroService.getHeroes()
      .subscribe(heroes => this.heroes = heroes.slice(1, 5));
  }

}
