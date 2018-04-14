import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarDropdownCredentialMenuComponent } from './navbar-dropdown-credential-menu.component';

describe('NavbarDropdownCredentialMenuComponent', () => {
  let component: NavbarDropdownCredentialMenuComponent;
  let fixture: ComponentFixture<NavbarDropdownCredentialMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarDropdownCredentialMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarDropdownCredentialMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
