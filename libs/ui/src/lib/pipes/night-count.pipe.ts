import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'nightCount' })
export class NightCountPipe implements PipeTransform {
  transform(nights: number): string {
    return `${nights} night${nights !== 1 ? 's' : ''}`;
  }
}
