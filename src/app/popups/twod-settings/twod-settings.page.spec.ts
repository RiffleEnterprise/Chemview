import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TwodSettingsPage } from './twod-settings.page';
import { SettingsService } from 'src/app/services/settings.service';

describe('TwodSettingsPage', () => {
  let component: TwodSettingsPage;
  let fixture: ComponentFixture<TwodSettingsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TwodSettingsPage],
      imports: [IonicModule.forRoot()],
      providers: [{
        provide: SettingsService,
        useValue: {
          getSettings: () => ({ atomVisualization: 'default' }),
          saveSettings: () => { }
        }
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(TwodSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
