import { storage } from '../lib/firebase-admin.ts';
import { v4 as uuidv4 } from 'uuid';

export class ImageService {
  /**
   * Uploads an NPC profile image to Firebase Storage
   * Organized hierarchically: campaigns/{campaignId}/npcs/{npcId}/profile.{ext}
   * @param file - The image file buffer to upload
   * @param contentType - The MIME type of the file
   * @param campaignId - The ID of the campaign this NPC belongs to
   * @param npcId - The ID of the NPC this image belongs to
   * @param filename - Optional custom filename (defaults to "profile.jpg")
   * @returns The storage location path
   */
  async uploadNPCImage(file: Buffer, contentType: string, campaignId: string, npcId: string, filename?: string): Promise<string> {
    try {
      const bucket = storage.bucket();
      console.log('Storage bucket:', bucket.name);
      
      const fileName = filename || 'profile.jpg';
      const storageLocation = `campaigns/${campaignId}/npcs/${npcId}/${fileName}`;
      const fileUpload = bucket.file(storageLocation);
      
      // Set metadata for optimal image handling
      const metadata = {
        contentType,
        cacheControl: 'public, max-age=2592000', // Cache for 30 days (2592000 seconds)
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(), // Enable download tokens
        }
      };

      console.log('Uploading to:', storageLocation);
      console.log('File size:', file.length);
      console.log('Content type:', contentType);

      // Upload with metadata
      await fileUpload.save(file, { metadata });

      console.log('Upload successful!');
      return storageLocation;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generates a signed URL for a Firebase Storage file
   * @param storagePath - The path to the file in Firebase Storage
   * @param expiresInMinutes - How long the URL should be valid (default: 60 minutes)
   * @returns The signed URL or undefined if the file doesn't exist
   */
  async getSignedUrl(storagePath: string, expiresInMinutes: number = 60): Promise<string | undefined> {
    try {
      if (!storagePath) {
        return undefined;
      }

      const bucket = storage.bucket();
      const file = bucket.file(storagePath);
      
      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        return undefined;
      }

      // Generate signed URL
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + (expiresInMinutes * 60 * 1000), // Convert minutes to milliseconds
      });

      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return undefined;
    }
  }
}

