import { TestBed } from '@angular/core/testing';

import { CurrentChemService } from './current-chem.service';
import { PubchemService } from './pubchem.service';

describe('CurrentChemService', () => {
  let service: CurrentChemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{
        provide: PubchemService,
        useValue: { getMolecularFormula: () => Promise.resolve('CH4') }
      }]
    });
    service = TestBed.inject(CurrentChemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
