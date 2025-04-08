import { TestBed } from '@angular/core/testing';

import { InterpreteService } from './interprete.service';

describe('InterpreteService', () => {
  let service: InterpreteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterpreteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
