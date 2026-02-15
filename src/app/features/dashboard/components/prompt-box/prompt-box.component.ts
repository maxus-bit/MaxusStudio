import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserData } from '../../../../core/models/user.model';

@Component({
  selector: 'app-prompt-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prompt-box.component.html',
  styleUrls: ['./prompt-box.component.scss']
})
export class PromptBoxComponent {
  @Input() isLocked: boolean = false;
  @Input() currentModel: 'v1' | 'v2' = 'v1';
  @Input() isGenerating: boolean = false;
  @Input() attachedImages: string[] = [];
  @Input() userCredits: number = 0;
  @Input() userData: UserData | null = null;

  @Output() generate = new EventEmitter<{ prompt: string; images: string[]; model: 'v1' | 'v2' }>();
  @Output() modelChanged = new EventEmitter<'v1' | 'v2'>();
  @Output() imageAttached = new EventEmitter<string>(); // Emits single new image
  @Output() imageRemoved = new EventEmitter<number>(); // Emits index
  @Output() goToPlans = new EventEmitter<void>();

  @ViewChild('promptInput') promptInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('imageInput') imageInput?: ElementRef<HTMLInputElement>;

  prompt: string = '';
  showModelDropdown: boolean = false;

  constructor(private ngZone: NgZone, private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showModelDropdown) return;

    const toolWrapper = this.elementRef.nativeElement.querySelector('.tool-wrapper');
    if (toolWrapper && !toolWrapper.contains(event.target as Node)) {
      this.showModelDropdown = false;
    }
  }

  onGenerate() {
    if (this.isLocked || this.isGenerating || !this.prompt.trim()) {
      return;
    }

    this.generate.emit({
      prompt: this.prompt,
      images: this.attachedImages,
      model: this.currentModel
    });
    
    // Clear prompt immediately after successful generation trigger
    this.prompt = '';
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    // Logic: Limit addition of images for users who have 3 and less generations only 2 images
    const maxImages = this.userCredits <= 3 ? 2 : 10;
    const currentCount = this.attachedImages.length;
    
    if (currentCount >= maxImages) {
      alert(`You can only attach ${maxImages} images with your current plan.`);
      input.value = '';
      return;
    }

    const remainingSlots = maxImages - currentCount;
    const filesToProcess = Array.from(input.files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.ngZone.run(() => {
          const result = e.target?.result as string;
          this.imageAttached.emit(result);
        });
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeImage(index: number) {
    this.imageRemoved.emit(index);
    if (this.imageInput?.nativeElement) {
      this.imageInput.nativeElement.value = '';
    }
  }

  triggerImageInput() {
    if (this.imageInput) {
      this.imageInput.nativeElement.click();
    }
  }

  toggleModelDropdown() {
    this.showModelDropdown = !this.showModelDropdown;
  }

  selectModel(model: 'v1' | 'v2') {
    // Разрешаем выбор V2 только если у пользователя есть подписка (basic, pro, ultra)
    // или если это V1 (он доступен всем)
    if (model === 'v2') {
      const isSubscribed = this.userData?.subscriptionType && ['basic', 'pro', 'ultra'].includes(this.userData.subscriptionType);
      
      // Если подписки нет - нельзя выбрать V2
      if (!isSubscribed) {
        return;
      }
    }

    if (model === 'v2' && this.isLocked) {
      return;
    }
    
    this.currentModel = model;
    this.modelChanged.emit(model);
    this.showModelDropdown = false;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onGenerate();
    }
  }

  onGoToPlans() {
    this.goToPlans.emit();
  }
}
