import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PubchemService } from './pubchem.service';

describe('PubchemService', () => {
  let service: PubchemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PubchemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
