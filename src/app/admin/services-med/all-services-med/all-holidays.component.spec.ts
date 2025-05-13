import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { AllservicesComponent } from "./all-holidays.component";
describe("AllservicesComponent", () => {
  let component: AllservicesComponent;
  let fixture: ComponentFixture<AllservicesComponent>;
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [AllservicesComponent],
}).compileComponents();
    })
  );
  beforeEach(() => {
    fixture = TestBed.createComponent(AllservicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
