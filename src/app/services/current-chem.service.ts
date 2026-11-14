import { Injectable } from '@angular/core';
import { PubchemService } from './pubchem.service';
@Injectable({
  providedIn: 'root'
})
export class CurrentChemService {

  name:string = "Methane";
  formula:string = "CH4";

  constructor(private pubchem:PubchemService) { }

  getName(){
    return this.name
  }

  getFormula(){
    return this.formula
  }

  async setFormula(){
    this.formula = await this.pubchem.getMolecularFormula(this.name)
  }

  async setName(newName:string){
    const standardized = this._standardizeChemicalName(newName)
    if(!standardized){
      return
    }
    const formula = await this.pubchem.getMolecularFormula(standardized)
    this.name = standardized
    this.formula = formula || ''
  }

  private _standardizeChemicalName(name:string){
    return name.trim()
  }

}
