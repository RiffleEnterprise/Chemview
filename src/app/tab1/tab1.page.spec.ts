import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Tab1Page } from './tab1.page';
import { PubchemService } from '../services/pubchem.service';
import { CurrentChemService } from '../services/current-chem.service';
import { FavoriteService } from '../services/favorite.service';
import { SettingsService } from '../services/settings.service';
import { ImageSaverService } from '../services/image-saver.service';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Tab1Page],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: PubchemService, useValue: { getSmiles: () => Promise.resolve('C') } },
        {
          provide: CurrentChemService,
          useValue: {
            getName: () => 'Methane',
            getFormula: () => 'CH4',
            setName: () => Promise.resolve()
          }
        },
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
          provide: SettingsService,
          useValue: {
            init: () => Promise.resolve({ width: 100, height: 100 }),
            getSettings: () => ({ width: 100, height: 100 }),
            saveSettings: () => { }
          }
        },
        { provide: ImageSaverService, useValue: {} }
      ]
    });

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
