import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const date = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today ? null : { pastDate: true };
  };
}

export function dateRangeValidator(checkInKey: string, checkOutKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const checkIn = group.get(checkInKey)?.value;
    const checkOut = group.get(checkOutKey)?.value;
    if (!checkIn || !checkOut) return null;
    return new Date(checkIn) < new Date(checkOut) ? null : { invalidRange: true };
  };
}

export function minLengthTrimmed(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString().trim();
    return value.length >= min ? null : { minLengthTrimmed: { required: min, actual: value.length } };
  };
}
