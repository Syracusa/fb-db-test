import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideFlowComponent } from './slide-flow.component';

describe('SlideFlowComponent', () => {
  let component: SlideFlowComponent;
  let fixture: ComponentFixture<SlideFlowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SlideFlowComponent]
    });
    fixture = TestBed.createComponent(SlideFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
