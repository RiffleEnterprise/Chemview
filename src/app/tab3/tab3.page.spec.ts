import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { AdMob } from '@admob-plus/ionic/ngx';

import { Tab3Page } from './tab3.page';
import { FavoriteService } from '../services/favorite.service';
import { CurrentChemService } from '../services/current-chem.service';

class BannerAdMock {
  show() { }
  hide() { }
}

describe('Tab3Page', () => {
  let component: Tab3Page;
  let fixture: ComponentFixture<Tab3Page>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Tab3Page],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        {
          provide: FavoriteService,
          useValue: {
            whenReady: () => Promise.resolve(),
            getFavorites: () => [],
            favoritesContains: () => false,
            addFavorite: () => Promise.resolve(),
            removeFavorite: () => Promise.resolve()
          }
        },
        {
          provide: CurrentChemService,
          useValue: {
            getName: () => 'Methane',
            setName: () => Promise.resolve()
          }
        },
        {
          provide: AdMob,
          useValue: {
            start: () => Promise.resolve(),
            requestTrackingAuthorization: () => Promise.resolve(),
            BannerAd: BannerAdMock,
            on: () => ({ subscribe: () => { } })
          }
        }
      ]
    });

    fixture = TestBed.createComponent(Tab3Page);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
