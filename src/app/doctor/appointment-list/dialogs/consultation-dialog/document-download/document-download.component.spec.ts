import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentDownloadComponent } from './document-download.component';

describe('DocumentDownloadComponent', () => {
  let component: DocumentDownloadComponent;
  let fixture: ComponentFixture<DocumentDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentDownloadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DocumentDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
