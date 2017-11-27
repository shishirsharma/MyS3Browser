import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialModalComponent } from './credential-modal.component';

describe('CredentialModalComponent', () => {
  let component: CredentialModalComponent;
  let fixture: ComponentFixture<CredentialModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CredentialModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CredentialModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
