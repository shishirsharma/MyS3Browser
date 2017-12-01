import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core'

import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

import { Credential } from '../credential';
import { CredentialService } from '../credential.service';


@Component({
  selector: 'app-credential-modal',
  templateUrl: './credential-modal.component.html',
  styleUrls: ['./credential-modal.component.css']
})
export class CredentialModalComponent implements OnInit {
  @ViewChild('credentialModal') private content: TemplateRef<any>;

  closeResult: string;

  modalRef: NgbModalRef;

  @Input() openModal: boolean;
  @Output() credentialUpdate: EventEmitter<any> = new EventEmitter();

  constructor(
    private modalService: NgbModal,
    private credentialService: CredentialService
  ) { }

  model = this.credentialService.getCredential();
  submitted = false;

  ngOnInit() {
    if(this.openModal) {
      this.open();
    }
  }

  open() {
    this.modalRef = this.modalService.open(this.content);
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
    this.credentialUpdate.emit(null);
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
