import { Component, inject, ChangeDetectionStrategy, signal, computed, input } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListingsStore } from '../../store/listings.store';
import { PhotoUploadComponent } from '@nerastay/ui';
import { ListingType } from '@nerastay/shared';

const STEPS = ['Basic Info', 'Location', 'Photos', 'Details', 'Review'];
const AMENITY_OPTIONS = ['WiFi', 'Pool', 'Parking', 'AC', 'Breakfast', 'Pet-friendly', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Beach Access', 'Mountain View'];
const TYPE_OPTIONS: ListingType[] = ['hotel', 'restaurant', 'villa'];

@Component({
  selector: 'ns-listing-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PhotoUploadComponent],
  templateUrl: 'listing-form.component.html',
  styleUrl: 'listing-form.component.scss'
})
export class ListingFormComponent {
  editId = input<string | null>(null);

  private router = inject(Router);
  private fb = inject(FormBuilder);
  readonly listingsStore = inject(ListingsStore);

  readonly step = signal(0);
  readonly photos = signal<File[]>([]);
  readonly selectedAmenities = signal<string[]>([]);
  readonly submitting = signal(false);

  readonly steps = STEPS;
  readonly amenityOptions = AMENITY_OPTIONS;
  readonly typeOptions = TYPE_OPTIONS;

  readonly isLastStep = computed(() => this.step() === STEPS.length - 1);
  readonly progress = computed(() => ((this.step() + 1) / STEPS.length) * 100);

  readonly form = this.fb.group({
    // Step 1
    type: ['hotel' as ListingType, Validators.required],
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(50)]],
    // Step 2
    address: ['', Validators.required],
    city: ['', Validators.required],
    country: ['', Validators.required],
    lat: [null as number | null, [Validators.required, Validators.min(-90), Validators.max(90)]],
    lng: [null as number | null, [Validators.required, Validators.min(-180), Validators.max(180)]],
    // Step 4
    priceRange: [2 as 1 | 2 | 3 | 4, Validators.required],
    pricePerNight: [0, [Validators.required, Validators.min(0)]],
    currency: ['EUR', Validators.required],
    tags: [[]]
  });

  nextStep(): void {
    if (!this.isLastStep()) this.step.update(s => s + 1);
  }

  prevStep(): void {
    if (this.step() > 0) this.step.update(s => s - 1);
  }

  onPhotosSelected(files: File[]): void {
    this.photos.set(files);
  }

  toggleAmenity(amenity: string): void {
    this.selectedAmenities.update(tags =>
      tags.includes(amenity) ? tags.filter(t => t !== amenity) : [...tags, amenity]
    );
  }

  useMyLocation(): void {
    navigator.geolocation?.getCurrentPosition(pos => {
      this.form.patchValue({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const v = this.form.value;
    try {
      const id = await this.listingsStore.createListing(
        {
          type: v.type as ListingType,
          name: v.name!,
          description: v.description!,
          address: v.address!,
          city: v.city!,
          country: v.country!,
          coordinates: { lat: v.lat!, lng: v.lng! },
          tags: this.selectedAmenities(),
          priceRange: v.priceRange as 1 | 2 | 3 | 4,
          pricePerNight: v.pricePerNight!,
          currency: v.currency!
        },
        this.photos()
      );
      this.router.navigate(['/listings', id]);
    } catch {
      // error handled in store
    } finally {
      this.submitting.set(false);
    }
  }

  invalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}
