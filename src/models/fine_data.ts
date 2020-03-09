import { INYCFineData } from '../interfaces/inyccitation';

// Fine data for a response
export class FineData implements INYCFineData {
  /*  constructor(
    total_fined: string,
    total_paid: string,
    total_reduced: string,
    total_outstanding: string
  ) {
    this.total_fined = total_fined;
    this.total_outstanding = total_outstanding;
    this.total_paid = total_paid;
    this.total_reduced = total_reduced;
  }*/
  constructor(fine_data: INYCFineData) {
    this.total_fined = fine_data.total_fined;
    this.total_outstanding = fine_data.total_outstanding;
    this.total_paid = fine_data.total_paid;
    this.total_reduced = fine_data.total_reduced;
  }

  FINE_FIELDS: Array<string> = ['fined', 'reduced', 'paid', 'outstanding'];

  total_fined: string;
  total_outstanding: string;
  total_paid: string;
  total_reduced: string;

  fined: number = 0.0;
  outstanding: number = 0.0;
  paid: number = 0.0;
  reduced: number = 0.0;

  fines_assessed(): boolean {
    let fine_found = false;
    this.FINE_FIELDS.forEach(field => {
      if (this[field] > 0.0) {
        fine_found = true;
        return fine_found;
      }
    });

    return fine_found;
  }

  max_amount(): number {
    let max_fine = 0.0;
    this.FINE_FIELDS.forEach(field => {
      if (this[field] > max_fine) {
        max_fine = this[field];
      }
    });

    return max_fine;
  }
}
