import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private _storage: Storage | null = null;
  private favorites: string[] = [];
  private ready: Promise<void>;

  constructor(private storage: Storage) {
    this.ready = this.init();
  }

  private async init() {
    this._storage = await this.storage.create();
    await this.loadData();
  }

  private async loadData() {
    if (!this._storage) {
      return;
    }
    const stored = await this._storage.get('favorites');
    this.favorites = Array.isArray(stored) ? stored : [];
    if (!Array.isArray(stored)) {
      await this._storage.set('favorites', this.favorites);
    }
  }

  whenReady(): Promise<void> {
    return this.ready;
  }

  getFavorites(): string[] {
    return this.favorites;
  }

  favoritesContains(favorite: string): boolean {
    return this.favorites.includes(favorite);
  }

  async addFavorite(favorite: string) {
    await this.ready;
    if (!this.favorites.includes(favorite)) {
      this.favorites.push(favorite);
      await this._storage?.set('favorites', this.favorites);
    }
  }

  async removeFavorite(favorite: string) {
    await this.ready;
    this.favorites = this.favorites.filter(el => el !== favorite);
    await this._storage?.set('favorites', this.favorites);
  }
}
