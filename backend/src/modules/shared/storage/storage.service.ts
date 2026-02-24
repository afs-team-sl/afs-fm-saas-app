import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';

/**
 * Azure Blob Storage Service
 * Handles file uploads and deletions to Azure Blob Storage
 */
@Injectable()
export class StorageService {
  private blobServiceClient: BlobServiceClient | null;

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>(
      'AZURE_STORAGE_CONNECTION_STRING',
    );

    if (!connectionString || connectionString.startsWith('http')) {
      console.warn(
        '⚠️  AZURE_STORAGE_CONNECTION_STRING is not configured properly. File uploads will be disabled.',
      );
      console.warn(
        '💡 To enable file uploads, get your connection string from Azure Portal:',
      );
      console.warn(
        '   Azure Portal → Storage Account (blobfmsdev) → Access Keys → Connection string',
      );
      this.blobServiceClient = null;
      return;
    }

    this.blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
  }

  /**
   * Get or create a container client
   * @param containerName - Name of the blob container
   */
  private async getContainerClient(
    containerName: string,
  ): Promise<ContainerClient> {
    if (!this.blobServiceClient) {
      throw new InternalServerErrorException(
        'Azure Storage is not configured. Please set AZURE_STORAGE_CONNECTION_STRING in .env',
      );
    }

    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);

    // Create container if it doesn't exist
    const exists = await containerClient.exists();
    if (!exists) {
      await containerClient.create({
        access: 'blob', // Public read access for blobs
      });
      console.log(`✅ Container "${containerName}" created successfully`);
    }

    return containerClient;
  }

  /**
   * Upload a file to Azure Blob Storage
   * @param file - Multer file object from request
   * @param containerName - Container name (e.g., 'work-order-evidence')
   * @returns Public URL of the uploaded blob
   */
  async uploadFile(
    file: Express.Multer.File,
    containerName: string,
  ): Promise<string> {
    try {
      const containerClient = await this.getContainerClient(containerName);

      // Generate unique blob name with timestamp
      const timestamp = Date.now();
      const sanitizedFilename = file.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        '_',
      );
      const blobName = `${timestamp}-${sanitizedFilename}`;

      // Get blob client
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Upload file buffer
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
      });

      // Return public URL
      return blockBlobClient.url;
    } catch (error) {
      console.error('Azure Blob Upload Error:', error);
      throw new InternalServerErrorException(
        'Failed to upload file to Azure Blob Storage',
      );
    }
  }

  /**
   * Delete a file from Azure Blob Storage
   * @param blobUrl - Full URL of the blob to delete
   * @param containerName - Container name
   */
  async deleteFile(blobUrl: string, containerName: string): Promise<void> {
    try {
      const containerClient = await this.getContainerClient(containerName);

      // Extract blob name from URL
      const blobName = blobUrl.split('/').pop();
      if (!blobName) {
        throw new Error('Invalid blob URL');
      }

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.deleteIfExists();
      console.log(`✅ Deleted blob: ${blobName}`);
    } catch (error) {
      console.error('Azure Blob Delete Error:', error);
      throw new InternalServerErrorException(
        'Failed to delete file from Azure Blob Storage',
      );
    }
  }

  /**
   * Get blob URL by name
   */
  getBlobUrl(containerName: string, blobName: string): string {
    if (!this.blobServiceClient) {
      throw new InternalServerErrorException(
        'Azure Storage is not configured. Please set AZURE_STORAGE_CONNECTION_STRING in .env',
      );
    }

    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.url;
  }
}
