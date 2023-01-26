import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WildCatchComponent } from './wildCatch.component';

describe('ReplenishmentComponent', () => {
  let component: WildCatchComponent;
  let fixture: ComponentFixture<WildCatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WildCatchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WildCatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
