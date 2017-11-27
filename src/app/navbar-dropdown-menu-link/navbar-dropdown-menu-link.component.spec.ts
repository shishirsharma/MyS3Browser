import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarDropdownMenuLinkComponent } from './navbar-dropdown-menu-link.component';

describe('NavbarDropdownMenuLinkComponent', () => {
  let component: NavbarDropdownMenuLinkComponent;
  let fixture: ComponentFixture<NavbarDropdownMenuLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarDropdownMenuLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarDropdownMenuLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
