import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';

import { SettingsService } from './settings.service';

class StorageMock {
  async create() {
    return this;
  }

  async get() {
    return null;
  }

  async set() { }
}

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Storage, useValue: new StorageMock() }]
    });
    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
