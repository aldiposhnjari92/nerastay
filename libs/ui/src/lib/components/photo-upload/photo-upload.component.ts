import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ns-photo-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="upload-zone"
         [class.upload-zone--drag]="isDragging()"
         (dragover)="onDragOver($event)"
         (dragleave)="isDragging.set(false)"
         (drop)="onDrop($event)"
         role="region"
         aria-label="Photo upload area">
      <span class="upload-zone__icon" aria-hidden="true">📷</span>
      <p class="upload-zone__text">Drag & drop photos here or <label class="upload-zone__link">
        browse<input type="file" accept="image/*" [multiple]="maxFiles() > 1" class="sr-only"
                     (change)="onFilePicked($event)" [attr.aria-label]="'Upload up to ' + maxFiles() + ' photos'" />
      </label></p>
      <p class="upload-zone__hint">Max {{ maxFiles() }} photos · JPEG or PNG · Max 10MB each</p>
    </div>

    @if (previews().length > 0) {
      <div class="upload-previews" role="list" aria-label="Selected photos">
        @for (preview of previews(); track preview.url) {
          <div class="upload-preview" role="listitem">
            <img [src]="preview.url" [alt]="'Preview of ' + preview.name" class="upload-preview__img" />
            <button type="button" class="upload-preview__remove" (click)="removePreview(preview.url)"
                    [attr.aria-label]="'Remove ' + preview.name">×</button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .upload-zone { border: 2px dashed var(--border); border-radius: 14px; padding: 32px 24px; text-align: center; cursor: pointer; transition: border-color 0.15s, background 0.15s; &--drag { border-color: var(--primary); background: rgba(59,130,246,0.04); } }
    .upload-zone__icon { font-size: 2.5rem; display: block; margin-bottom: 12px; }
    .upload-zone__text { margin: 0 0 6px; color: var(--text-secondary); }
    .upload-zone__link { color: var(--primary); font-weight: 600; cursor: pointer; text-decoration: underline; }
    .upload-zone__hint { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
    .upload-previews { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
    .upload-preview { position: relative; width: 80px; height: 80px; border-radius: 8px; overflow: hidden; }
    .upload-preview__img { width: 100%; height: 100%; object-fit: cover; }
    .upload-preview__remove { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; }
  `]
})
export class PhotoUploadComponent {
  maxFiles = input(5);
  filesSelected = output<File[]>();

  readonly isDragging = signal(false);
  readonly previews = signal<Array<{ url: string; name: string }>>([]);
  private files: File[] = [];

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(false);
    const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'));
    this.addFiles(files);
  }

  onFilePicked(e: Event): void {
    const files = Array.from((e.target as HTMLInputElement).files ?? []);
    this.addFiles(files);
  }

  private addFiles(newFiles: File[]): void {
    const remaining = this.maxFiles() - this.files.length;
    const toAdd = newFiles.slice(0, remaining);
    this.files = [...this.files, ...toAdd];
    this.previews.update(p => [
      ...p,
      ...toAdd.map(f => ({ url: URL.createObjectURL(f), name: f.name }))
    ]);
    this.filesSelected.emit(this.files);
  }

  removePreview(url: string): void {
    const idx = this.previews().findIndex(p => p.url === url);
    if (idx >= 0) {
      URL.revokeObjectURL(url);
      this.previews.update(p => p.filter((_, i) => i !== idx));
      this.files = this.files.filter((_, i) => i !== idx);
      this.filesSelected.emit(this.files);
    }
  }
}
