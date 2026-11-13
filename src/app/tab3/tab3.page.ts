import { Component } from '@angular/core';
import { FavoriteService } from '../services/favorite.service';
import { CurrentChemService } from '../services/current-chem.service';
import { Router } from '@angular/router';
import { AdMob } from '@admob-plus/ionic/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  favorites:string[] = []
  empty:boolean = true

  //special for admob
  admobBanner
  admobSetup:boolean = false

  constructor(
    private favoriteService:FavoriteService,
    private currentChemService:CurrentChemService,
    private router:Router,
    private admob:AdMob,
    private platform:Platform) 
    {
    this.platform.ready().then(async () => {
      if(!this.platform.is('hybrid')){
        return
      }
      await this.admob.start();
      this.admob.requestTrackingAuthorization()
      if(this.platform.is("ios")){
        //ios admob
        console.log("Running ios")
        this.admobBanner = new this.admob.BannerAd({
          adUnitId: 'ca-app-pub-7436607995177518/9807257626',
          position: 'top'
        });
      }
      else{
        //andriod admob
        console.log("Running andrioid")
        this.admobBanner = new this.admob.BannerAd({
          //TODO make an android banner
          //These are the same right now
          adUnitId: 'ca-app-pub-7436607995177518/9807257626',
          position: 'top'
        });
      }
      this.admobBanner.show();
      this.admobSetup=true
      
      this.admob.on('admob.banner.load').subscribe(async () => {
      });
    });
  }

  async ionViewWillEnter(){
    if(this.admobSetup){
      this.admobBanner?.show()
    }
    await this.favoriteService.whenReady()
    this.favorites = this.favoriteService.getFavorites()
    this.empty = this.favorites.length == 0
  }

  async removeFavorite(favorite: string){
    await this.favoriteService.removeFavorite(favorite)
    this.favorites = this.favoriteService.getFavorites()
    this.empty = this.favorites.length == 0
  }

  async load(favorite: string){
    await this.currentChemService.setName(favorite)
    this.router.navigate(['tabs/tab1'])
  }

  ionViewWillLeave(){
    this.admobBanner?.hide()
  }

}
