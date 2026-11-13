import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';

import { FavoriteService } from './favorite.service';

class StorageMock {
  data = new Map<string, any>();

  async create() {
    return this;
  }

  async get(key: string) {
    return this.data.get(key);
  }

  async set(key: string, value: any) {
    this.data.set(key, value);
    return value;
  }
}

describe('FavoriteService', () => {
  let storage: StorageMock;

  const createService = (): FavoriteService => {
    TestBed.configureTestingModule({
      providers: [{ provide: Storage, useValue: storage }]
    });
    return TestBed.inject(FavoriteService);
  };

  beforeEach(() => {
    storage = new StorageMock();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('starts with an empty list and persists it', async () => {
    const service = createService();
    await service.whenReady();

    expect(service.getFavorites()).toEqual([]);
    expect(storage.data.get('favorites')).toEqual([]);
  });

  it('loads persisted favorites', async () => {
    storage.data.set('favorites', ['aspirin']);

    const service = createService();
    await service.whenReady();

    expect(service.getFavorites()).toEqual(['aspirin']);
  });

  it('adds a chemical once', async () => {
    const service = createService();

    await service.addFavorite('aspirin');
    await service.addFavorite('aspirin');

    expect(service.getFavorites()).toEqual(['aspirin']);
    expect(await storage.get('favorites')).toEqual(['aspirin']);
  });

  it('reports whether a chemical is a favorite', async () => {
    const service = createService();
    await service.addFavorite('aspirin');

    expect(service.favoritesContains('aspirin')).toBeTrue();
    expect(service.favoritesContains('ibuprofen')).toBeFalse();
  });

  it('removes a chemical and persists the change', async () => {
    const service = createService();
    await service.addFavorite('aspirin');

    await service.removeFavorite('aspirin');

    expect(service.getFavorites()).toEqual([]);
    expect(await storage.get('favorites')).toEqual([]);
  });
});
