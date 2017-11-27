import { Component, OnInit } from '@angular/core';

import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

import { Credential } from '../credential';
import { CredentialService } from '../credential.service';


@Component({
  selector: 'app-credential-modal',
  templateUrl: './credential-modal.component.html',
  styleUrls: ['./credential-modal.component.css']
})
export class CredentialModalComponent implements OnInit {
  closeResult: string;
  modalRef: NgbModalRef;

  constructor(
    private modalService: NgbModal,
    private credentialService: CredentialService
  ) { }

  model = this.credentialService.getCredential();
  submitted = false;

  ngOnInit() {
  }

  open(content) {
    this.modalRef = this.modalService.open(content);
    this.modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onSubmit(content) {
    this.submitted = true;
    this.credentialService.setCredential(this.model);
    this.modalRef.close();
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

  get debug() { return JSON.stringify(this.model); }

}
