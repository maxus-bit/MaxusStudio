import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../../core/models/chat.model';

@Component({
  selector: 'app-chat-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-feed.component.html',
  styleUrl: './chat-feed.component.scss'
})
export class ChatFeedComponent implements OnInit, OnChanges, AfterViewChecked {
  @Input() messages: ChatMessage[] = [];
  @Input() isLoading: boolean = false;
  @Input() showWelcome: boolean = true;
  @Input() userEmail: string = '';
  
  @ViewChild('chatFeed') chatFeed?: ElementRef<HTMLDivElement>;
  
  private shouldScroll = false;
  
  get displayName(): string {
    if (!this.userEmail) return 'User';
    // Извлекаем имя из email (часть до @)
    const name = this.userEmail.split('@')[0];
    return name || 'User';
  }

  ngOnInit() {
    if (this.messages.length > 0) {
      this.shouldScroll = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['messages'] && this.messages.length > 0) {
      this.shouldScroll = true;
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom() {
    if (this.chatFeed?.nativeElement) {
      const element = this.chatFeed.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id || `${message.role}-${index}`;
  }

  async onDownloadImage(imageUrl: string, event: Event) {
    event.stopPropagation();
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `maxus-generated-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
      
    } catch (error) {
      console.error('Download failed via blob, falling back to direct link:', error);
      
      // Fallback
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `maxus-generated-${new Date().getTime()}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}