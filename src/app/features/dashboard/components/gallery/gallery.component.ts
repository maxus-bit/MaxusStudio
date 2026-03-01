import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { Chat, ChatMessage } from '../../../../core/models/chat.model';
import { Subscription } from 'rxjs';
import { AppStateService } from '../../../../core/state/app.state';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit, OnDestroy {
  @Input() userId: string = '';

  chats: Chat[] = [];
  allImages: Array<{ chatId: string; messageId: string; imageUrl: string; prompt: string; timestamp: number }> = [];
  private subscriptions: Subscription[] = [];
  isDeleting: boolean = false;

  constructor(
    private firestoreService: FirestoreService,
    private appState: AppStateService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    if (this.userId) {
      this.loadGallery();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadGallery() {
    const sub = this.firestoreService.getChatHistory$(this.userId).subscribe(chats => {
      this.chats = chats;
      this.extractImages();
    });
    this.subscriptions.push(sub);
  }

  extractImages() {
    this.allImages = [];
    this.chats.forEach(chat => {
      chat.messages.forEach((message, index) => {
        if (message.role === 'ai' && this.isImageUrl(message.content)) {
          // Находим соответствующий промпт пользователя
          const userMessage = chat.messages[index - 1];
          const prompt = userMessage?.content || 'Untitled';
          const timestamp = message.timestamp ? (typeof message.timestamp === 'object' ? (message.timestamp as any).toMillis() : new Date(message.timestamp).getTime()) : Date.now();
          
          this.allImages.push({
            chatId: chat.id,
            messageId: message.id || index.toString(),
            imageUrl: message.content,
            prompt: prompt,
            timestamp: timestamp
          });
        }
      });
    });

    // Sort images by timestamp
    this.allImages.sort((a, b) => b.timestamp - a.timestamp);
  }

  isImageUrl(content: string): boolean {
    return content.startsWith('http') || content.startsWith('data:image');
  }

  onImageClick(image: any) {
  }

  onStartCreating() {
    this.appState.setActiveSection('home');
  }

  async onDownload(event: Event, image: any) {
    event.stopPropagation();
    
    try {
        const response = await fetch(image.imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        
        // Generate a safe filename from prompt or timestamp
        const safePrompt = image.prompt.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
        a.download = `maxus-ai-${safePrompt}-${Date.now()}.png`;
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);
        
        this.toastService.success('Image downloaded successfully');
    } catch (error) {
        console.error('Download failed:', error);
        
        // Fallback for simple link download
        const a = document.createElement('a');
        a.href = image.imageUrl;
        a.target = '_blank';
        a.download = `maxus-ai-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
  }

  async onDelete(event: Event, image: any) {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }

    this.isDeleting = true;
    try {
        const chat = this.chats.find(c => c.id === image.chatId);
        if (!chat) {
            throw new Error('Chat not found');
        }

        // Filter out the message with the image URL
        const newMessages = chat.messages.filter(m => m.content !== image.imageUrl);
        
        await this.firestoreService.updateChatMessages(this.userId, image.chatId, newMessages);
        this.toastService.success('Image deleted');
    } catch (error) {
        console.error('Delete failed:', error);
        this.toastService.error('Failed to delete image');
    } finally {
        this.isDeleting = false;
    }
  }
}