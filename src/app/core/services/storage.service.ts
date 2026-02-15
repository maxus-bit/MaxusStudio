import { Injectable } from '@angular/core';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private storage: Storage) {}

  async uploadImageBase64(uid: string, imageBase64: string): Promise<string> {
    const filePath = `generated/${uid}/${Date.now()}.png`;
    const storageRef = ref(this.storage, filePath);
    await uploadString(storageRef, imageBase64, 'data_url');
    return await getDownloadURL(storageRef);
  }
}

