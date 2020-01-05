// Fine data for a response
export class FineData {
  FINE_FIELDS: Array<string> = ['fined', 'reduced', 'paid', 'outstanding'];

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
