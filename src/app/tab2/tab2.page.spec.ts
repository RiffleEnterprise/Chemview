import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Tab2Page } from './tab2.page';
import { PubchemService } from '../services/pubchem.service';
import { CurrentChemService } from '../services/current-chem.service';
import { FavoriteService } from '../services/favorite.service';
import { ImageSaverService } from '../services/image-saver.service';

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Tab2Page],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: PubchemService, useValue: { getSDFLink: () => 'https://example.test/mol.sdf' } },
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
        { provide: ImageSaverService, useValue: {} }
      ]
    });

    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
