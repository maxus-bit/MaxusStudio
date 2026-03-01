import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { UIStateService } from '../../../../core/state/ui.state';
import { AppStateService } from '../../../../core/state/app.state';
import { Chat } from '../../../../core/models/chat.model';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy, OnChanges {
  @Input() userId: string = '';
  @Input() activeChatId: string | null = null;
  @Output() chatSelected = new EventEmitter<string>();
  @Output() newChat = new EventEmitter<void>();
  @Output() sectionChanged = new EventEmitter<string>();
  @Output() settingsOpened = new EventEmitter<void>();

  chats: Chat[] = [];
  activeSection$: Observable<'home' | 'creations' | 'plans'>;
  sidebarOpen$!: Observable<boolean>;
  private subscriptions: Subscription[] = [];

  // Context Menu State
  openMenuChatId: string | null = null;

  // Modals State
  showRenameModal: boolean = false;
  showDeleteModal: boolean = false;
  selectedChatForAction: Chat | null = null;
  renameInputValue: string = '';

  constructor(
    private firestoreService: FirestoreService,
    private router: Router,
    private uiState: UIStateService,
    private appState: AppStateService
  ) {
    this.sidebarOpen$ = this.uiState.sidebarOpen$;
    this.activeSection$ = this.appState.activeSection$;
  }

  ngOnInit() {
    if (this.userId) {
      this.loadChatHistory();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userId'] && changes['userId'].currentValue) {
      this.loadChatHistory();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadChatHistory() {
    if (!this.userId) return;

    const sub = this.firestoreService.getChatHistory$(this.userId).subscribe(chats => {

      // Sort: Pinned first, then by date descending
      this.chats = chats.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    });
    this.subscriptions.push(sub);
  }

  onChatSelect(chatId: string) {
    this.activeChatId = chatId;
    this.chatSelected.emit(chatId);
    this.uiState.closeSidebar();
  }

  onNewChat() {
    this.activeChatId = null;
    this.newChat.emit();
    this.uiState.closeSidebar();
  }

  onSectionChange(section: string) {
    this.sectionChanged.emit(section);
    this.uiState.closeSidebar();
  }

  onSettings() {
    this.settingsOpened.emit();
    this.uiState.closeSidebar();
  }

  onClose() {
    this.uiState.closeSidebar();
  }

  // --- Context Menu Logic ---
  toggleMenu(event: Event, chatId: string) {
    event.stopPropagation();
    if (this.openMenuChatId === chatId) {
      this.openMenuChatId = null;
    } else {
      this.openMenuChatId = chatId;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close menu if clicked outside
    if (this.openMenuChatId) {
      this.openMenuChatId = null;
    }
  }

  // --- Actions ---
  onPinChat(event: Event, chat: Chat) {
    event.stopPropagation();
    this.openMenuChatId = null;
    const newStatus = !chat.isPinned;
    this.firestoreService.updateChat(this.userId, chat.id, { isPinned: newStatus })
      .then(() => console.log('Chat pinned status updated'))
      .catch(err => console.error('Error updating pin status', err));
  }

  onRenameClick(event: Event, chat: Chat) {
    event.stopPropagation();
    this.openMenuChatId = null;
    this.selectedChatForAction = chat;
    this.renameInputValue = chat.customName || chat.title || '';
    this.showRenameModal = true;
  }

  onDeleteClick(event: Event, chat: Chat) {
    event.stopPropagation();
    this.openMenuChatId = null;
    this.selectedChatForAction = chat;
    this.showDeleteModal = true;
  }

  // --- Rename Modal Actions ---
  cancelRename() {
    this.showRenameModal = false;
    this.selectedChatForAction = null;
    this.renameInputValue = '';
  }

  confirmRename() {
    if (this.selectedChatForAction && this.renameInputValue.trim()) {
      this.firestoreService.updateChat(this.userId, this.selectedChatForAction.id, { customName: this.renameInputValue.trim() })
        .then(() => {
          this.showRenameModal = false;
          this.selectedChatForAction = null;
        })
        .catch(err => console.error('Error renaming chat', err));
    }
  }

  // --- Delete Modal Actions ---
  cancelDelete() {
    this.showDeleteModal = false;
    this.selectedChatForAction = null;
  }

  confirmDelete() {
    if (this.selectedChatForAction) {
      this.firestoreService.deleteChat(this.userId, this.selectedChatForAction.id)
        .then(() => {
          if (this.activeChatId === this.selectedChatForAction?.id) {
            this.onNewChat(); // Reset to new chat if deleted active one
          }
          this.showDeleteModal = false;
          this.selectedChatForAction = null;
        })
        .catch(err => console.error('Error deleting chat', err));
    }
  }
}