import { TestBed } from '@angular/core/testing';

import { ScanService, extractChemicalCandidates, normalizeScanText } from './scan.service';

describe('ScanService', () => {
  it('normalizes whitespace and line endings', () => {
    expect(normalizeScanText('  sodium\r\n\r\n chloride  ')).toBe('sodium\nchloride');
  });

  it('extracts chemical names and strips label noise', () => {
    const text = [
      'SIGMA-ALDRICH',
      'Sodium Chloride',
      '99.5% purity',
      'CAS 7647-14-5',
      'Lot ABC123',
      'Warning: irritant'
    ].join('\n');

    const candidates = extractChemicalCandidates(text);

    expect(candidates[0]).toBe('Sodium Chloride');
    expect(candidates).not.toContain('Warning: irritant');
    expect(candidates).not.toContain('Lot ABC123');
  });

  it('keeps a formula when it is the only label text', () => {
    expect(extractChemicalCandidates('NaCl')[0]).toBe('NaCl');
  });

  it('can be injected', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(ScanService)).toBeTruthy();
  });
});
