import { TestBed } from '@angular/core/testing';

import { CurrentChemService } from './current-chem.service';
import { PubchemService } from './pubchem.service';

describe('CurrentChemService', () => {
  let pubchem: { getMolecularFormula: jasmine.Spy };

  const createService = (): CurrentChemService => {
    pubchem = { getMolecularFormula: jasmine.createSpy('getMolecularFormula') };
    TestBed.configureTestingModule({
      providers: [{ provide: PubchemService, useValue: pubchem }]
    });
    return TestBed.inject(CurrentChemService);
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('starts with methane and the correct formula', () => {
    const service = createService();

    expect(service.getName()).toBe('Methane');
    expect(service.getFormula()).toBe('CH4');
  });

  it('preserves casing and trims whitespace', async () => {
    const service = createService();
    pubchem.getMolecularFormula.and.returnValue(Promise.resolve('C10H16N5O13P3'));

    await service.setName('  ATP  ');

    expect(pubchem.getMolecularFormula).toHaveBeenCalledWith('ATP');
    expect(service.getName()).toBe('ATP');
    expect(service.getFormula()).toBe('C10H16N5O13P3');
  });

  it('does not change state when the lookup fails', async () => {
    const service = createService();
    pubchem.getMolecularFormula.and.returnValue(Promise.reject(new Error('not found')));

    await expectAsync(service.setName('unobtainium')).toBeRejected();

    expect(service.getName()).toBe('Methane');
    expect(service.getFormula()).toBe('CH4');
  });

  it('ignores empty input', async () => {
    const service = createService();

    await service.setName('   ');

    expect(pubchem.getMolecularFormula).not.toHaveBeenCalled();
    expect(service.getName()).toBe('Methane');
  });

  it('refreshes the formula for the current name', async () => {
    const service = createService();
    pubchem.getMolecularFormula.and.returnValue(Promise.resolve('CH4'));

    await service.setFormula();

    expect(pubchem.getMolecularFormula).toHaveBeenCalledWith('Methane');
    expect(service.getFormula()).toBe('CH4');
  });
});
