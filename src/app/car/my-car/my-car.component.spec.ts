import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCarComponent } from './my-car.component';

describe('MyCarComponent', () => {
  let component: MyCarComponent;
  let fixture: ComponentFixture<MyCarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyCarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
