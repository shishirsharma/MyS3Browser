import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef} from '@angular/core';

import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// import { FileReader } from 'filereader';
import * as AWS from 'aws-sdk';

import { CredentialService } from '../credential.service';



@Component({
  selector: 'app-upload-modal',
  templateUrl: './upload-modal.component.html',
  styleUrls: ['./upload-modal.component.css']
})
export class UploadModalComponent implements OnInit {
  closeResult: string;
  s3: any;
  modalRef: NgbModalRef;

  @ViewChild('uploadModal') private content: TemplateRef<any>;

  @Input() s3Prefix: string;
  @Input() s3Bucket: string;

  @Output() uploadFinished: EventEmitter<any> = new EventEmitter();



  constructor(
    private modalService: NgbModal,
    private credentialService: CredentialService
  ) {
    this.credentialService
      .s3
      .subscribe(credential => {
        console.log('navbar-dropdown-menu-link.component#ngOnInit: Observable', credential);

        AWS.config.update({
          credentials: new AWS.Credentials(credential.access_key_id, credential.secret_access_key)
        });
        AWS.config.region = credential.s3_region;
        this.s3 = new AWS.S3();

        // this.uploader = new FileUploader({url: this.uploadURL});
      });
  }

  ngOnInit() {
  }

  file:any;
  uploadFileName:any;

  fileSelected:boolean = false;
  open() {
    this.modalRef = this.modalService.open(this.content);

    this.modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onFileChange(event) {
    // if(event.target.files && event.target.files.length > 0) {
    // }
    this.file = event.target.files[0];
    this.uploadFileName = this.file.name;
    this.fileSelected = true;
  }

  onSubmit(content) {
    let that = this;
    let credential = this.credentialService.getCredential();
    let reader = new FileReader();
    reader.readAsDataURL(this.file);
    reader.onload = () => {
      let prefix = this.s3Prefix.split('+').join(' ');
      var params = {
        Key: decodeURIComponent(prefix + content.controls.filename.value),
        ContentType: this.file.type,
        Body: reader.result,
        Bucket: this.s3Bucket
      };
      if (window.console) { console.log('Started upload'); }
      that.s3.upload(params, function(err, data) {
        if (window.console) { console.log(err ? 'ERROR!' : 'UPLOADED!'); }
        if (!err) {
          if (window.console) { console.log('Finished upload' + data); }
        }
        that.modalRef.close();
        that.uploadFinished.emit(null);
      });
    };
  }


  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
}
