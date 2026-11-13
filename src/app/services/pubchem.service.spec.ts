import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PubchemService } from './pubchem.service';

const compoundResponse = (props: any[]) => ({ PC_Compounds: [{ props }] });

const prop = (label: string, name: string | undefined, sval: string) => ({
  urn: name ? { label, name } : { label },
  value: { sval }
});

describe('PubchemService', () => {
  const baseUrl = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name';

  let service: PubchemService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PubchemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('selects the connectivity SMILES by URN and encodes the name', async () => {
    const promise = service.getSmiles('sodium chloride');

    const request = httpMock.expectOne(`${baseUrl}/sodium%20chloride/json`);
    expect(request.request.method).toBe('GET');
    request.flush(compoundResponse([
      prop('SMILES', 'Absolute', 'isomeric'),
      prop('SMILES', 'Connectivity', 'canonical')
    ]));

    expect(await promise).toBe('canonical');
  });

  it('selects the isomeric SMILES by URN', async () => {
    const promise = service.getSmilesIsomeric('ATP');

    const request = httpMock.expectOne(`${baseUrl}/ATP/json`);
    request.flush(compoundResponse([
      prop('SMILES', 'Connectivity', 'canonical'),
      prop('SMILES', 'Absolute', 'isomeric')
    ]));

    expect(await promise).toBe('isomeric');
  });

  it('selects the molecular formula by label when no name is present', async () => {
    const promise = service.getMolecularFormula('methane');

    const request = httpMock.expectOne(`${baseUrl}/methane/json`);
    request.flush(compoundResponse([
      prop('Molecular Formula', undefined, 'CH4')
    ]));

    expect(await promise).toBe('CH4');
  });

  it('throws when a required property is missing', async () => {
    const promise = service.getMolecularFormula('unknown');

    httpMock.expectOne(`${baseUrl}/unknown/json`).flush(compoundResponse([]));

    await expectAsync(promise).toBeRejected();
  });

  it('encodes names in the SDF link', () => {
    expect(service.getSDFLink('sodium chloride')).toBe(`${baseUrl}/sodium%20chloride/sdf`);
  });
});
