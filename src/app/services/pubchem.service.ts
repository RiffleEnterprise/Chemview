import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface PubChemProperty {
  urn: { label?: string; name?: string };
  value: { sval?: string };
}

@Injectable({
  providedIn: 'root'
})
export class PubchemService {
  private readonly baseUrl = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name';

  constructor(private http: HttpClient) { }

  private async getCompound(query: string): Promise<any> {
    const encoded = encodeURIComponent(query.trim());
    return await this.http.get(`${this.baseUrl}/${encoded}/json`).toPromise();
  }

  private getProperty(compound: any, label: string, names: string[] = []): string | undefined {
    const props: PubChemProperty[] = compound?.PC_Compounds?.[0]?.props ?? [];
    for (const name of names) {
      const match = props.find(prop => prop.urn?.label === label && prop.urn?.name === name);
      if (match?.value?.sval !== undefined) {
        return match.value.sval;
      }
    }
    return props.find(prop => prop.urn?.label === label)?.value?.sval;
  }

  async getSmiles(query: string) {
    const compound = await this.getCompound(query);
    return this.getProperty(compound, 'SMILES', ['Connectivity', 'Canonical']);
  }

  async getSmilesIsomeric(query: string) {
    const compound = await this.getCompound(query);
    return this.getProperty(compound, 'SMILES', ['Absolute', 'Isomeric']);
  }

  async getMolecularFormula(query: string) {
    const compound = await this.getCompound(query);
    return this.getProperty(compound, 'Molecular Formula', ['Molecular Formula']);
  }

  getSDFLink(query: string) {
    return `${this.baseUrl}/${encodeURIComponent(query.trim())}/sdf`;
  }
}
