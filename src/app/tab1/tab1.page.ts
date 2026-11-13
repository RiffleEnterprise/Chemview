import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PubchemService } from '../services/pubchem.service';
import { CurrentChemService } from '../services/current-chem.service';
import { FavoriteService } from '../services/favorite.service';

import { ModalController } from '@ionic/angular';
import { TwodSettingsPage } from '../popups/twod-settings/twod-settings.page';
import { Settings,DefaultSettings } from '../models/settings';
import { SettingsService } from '../services/settings.service';
import { ImageSaverService } from '../services/image-saver.service';
import { AlertController } from '@ionic/angular';
import { ThisReceiver } from '@angular/compiler';



const SmilesDrawer = require('smiles-drawer/app.js')

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  popSearch = true
  searchQuery:string;

  //used to draw 2d figure
  smilesDrawer;
  //is the current chemical a favorite? TODO implement this
  favorite:boolean = false 
  settings:Settings = new DefaultSettings
  initalized:boolean = false
  constructor(private platform: Platform,
    private pubchem: PubchemService, 
    public currentChem:CurrentChemService,
    private favoriteService: FavoriteService,
    public modalController: ModalController,
    private imageSaverService:ImageSaverService,
    private settingsService:SettingsService,
    private alertController:AlertController,) 
  {
  }

  async ngOnInit(){
    this.settings = await this.settingsService.init()
    await this._setSettingDimensions()
    this.smilesDrawer = await new SmilesDrawer.Drawer(this.settings);
    await this.refreshView()
  }

  private _setSettingDimensions(){
    this.settings.height = this.platform.height()
    this.settings.width = this.platform.width()
  }

  async ionViewWillEnter(){
    await this.favoriteService.whenReady()
    this.checkIfFavorite()
    this.refreshView()
  }

  refreshDrawer(){
    this.smilesDrawer = new SmilesDrawer.Drawer(this.settings)
  }
  
  refreshView(){
    let self = this
    this.pubchem.getSmiles(this.currentChem.getName()).then(smiles =>{
      SmilesDrawer.parse(smiles, function (tree) {
        self.smilesDrawer.draw(tree, 'twod', 'light', false);
        }, function (err) {
            console.log(err);
        })
  
      }
    )
  }

  async search(event,first:boolean){
    console.log("term is:"+ this.searchQuery)
    let pastName = this.currentChem.getName()
    console.log("past name: " + pastName)
    try{
      await this.currentChem.setName(this.searchQuery)
    }
    catch{
      if(first){
      await this.currentChem.setName(pastName)
      setTimeout(() => {this.search(event,false)}, 500);
      }
      else{
      this.presentNoChemical()
      await this.currentChem.setName(pastName)
      }
      return
    }
    
    try{
      this.refreshView()
    }
    catch{
      console.log("in catch")
      if(first){
        setTimeout(() => {this.search(event,false)}, 5000);
      }
      else{
        this.presentNoChemical()
        this.currentChem.setName(pastName)
      }
    }
    this._popSearch()
    this.checkIfFavorite()
  }

  async addFavorite(){
    await this.favoriteService.addFavorite(this.currentChem.getName())
    this.favorite = true
  }

  checkIfFavorite(){
    //Checks if current chem is a favorite
    if(this.favoriteService.favoritesContains(this.currentChem.getName())){
      this.favorite = true
    }
    else{
      this.favorite = false
    }
  }

  async removeFavorite(){
    await this.favoriteService.removeFavorite(this.currentChem.getName())
    this.favorite = false
  }

  async showSettings(){
    const modal = await this.modalController.create({
      component: TwodSettingsPage,
    });
    modal.onWillDismiss().then(data=>{
      this.settings = this.settingsService.getSettings()
      this._setSettingDimensions()
      console.log(this.settings)
      this.refreshDrawer()
      this.refreshView()
    })
    return await modal.present();
  }

  saveCanvas(){
    let canvas = document.getElementById("twod")
    //this.imageSaverService.saveImage(canvas)
  }

  _popSearch(){
    console.log("popping")
    this.popSearch =false
    setTimeout(() => {this.popSearch = true}, 500);
  }

  async presentNoChemical () {
    const alert = await this.alertController.create({
      header: 'Chemcial Not Found',
      message: 'Your chemical can no be found in the PubChem database.',
      buttons: ['OK']
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

}
