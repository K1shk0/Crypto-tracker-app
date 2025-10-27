import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MarketComponent } from './market';

describe('MarketComponent', () => {
  let component: MarketComponent;
  let fixture: ComponentFixture<MarketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
