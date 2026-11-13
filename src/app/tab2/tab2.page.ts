import { Component } from '@angular/core';
import { PubchemService } from '../services/pubchem.service';
import { CurrentChemService } from '../services/current-chem.service';
import { FavoriteService } from '../services/favorite.service';
import { ImageSaverService } from '../services/image-saver.service';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
const NGL = require('ngl/dist/ngl.js')


class TouchListener{
  constructor(private text:string){

  }
  apply(){
    console.log(this.text)
  }
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})

export class Tab2Page {
  //the div that that ngl projects onto
  stage
  //used to fix search bar not non-focussing glitch
  popSearch:boolean = true
  //
  searchQuery: string;

  favorite:boolean = false

  constructor(
    private toastController: ToastController,
    private pubchem: PubchemService,
    private currentChem:CurrentChemService,
    private favoriteService: FavoriteService,
    private imageSaverService: ImageSaverService,
    private alertController: AlertController
    ) {}


  ngOnInit(){
    this._createStage()
  }

  private _createStage(){
    if(this.stage){
      return
    }
    this.stage = new NGL.Stage("threed",{ backgroundColor: "white" });
    this.stage.mouseControls.add("drag-right", NGL.MouseActions.rotateDrag);
    this.stage.mouseControls.add("drag-left+right", NGL.MouseActions.zoomDrag);
  }

  ionViewWillEnter(){
    this._createStage()
    this.refreshView()
    this.checkIfFavorite()
  }

  ionViewDidEnter(){
    this.presentToast()
  }

  ionViewWillLeave(){
    if(this.stage){
      this.stage.dispose()
      this.stage = null
    }
  }

  refreshView(){
    if(!this.stage){
      return
    }
    this.stage.removeAllComponents()
    this.stage.loadFile(this.pubchem.getSDFLink(this.currentChem.getName()),{ ext: "sdf" })
      .then(comp => {
        if(!this.stage){
          comp.dispose()
          return
        }
        comp.addRepresentation( "ball+stick", { multipleBond: true } );
        this.stage.autoView();
      })
      .catch(err => console.error('Unable to load structure', err));
    this.stage.setSpin(false);
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

  //SDF
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

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Drag With Two Fingers to Rotate the Model',
      duration: 2000,
      position: "middle",
      cssClass: "toast"
    });
    toast.present();
  }

  saveCanvas(){
    let canvas = document.getElementById("threed")
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

