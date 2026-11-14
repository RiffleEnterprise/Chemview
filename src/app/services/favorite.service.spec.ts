import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';

import { FavoriteService } from './favorite.service';

class StorageMock {
  async create() {
    return this;
  }

  async get() {
    return [];
  }

  async set() { }
}

describe('FavoriteService', () => {
  let service: FavoriteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Storage, useValue: new StorageMock() }]
    });
    service = TestBed.inject(FavoriteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
