import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFolderModalComponent } from './create-folder-modal.component';

describe('CreateFolderModalComponent', () => {
  let component: CreateFolderModalComponent;
  let fixture: ComponentFixture<CreateFolderModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateFolderModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFolderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
