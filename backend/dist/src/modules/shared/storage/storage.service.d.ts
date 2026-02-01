import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private configService;
    private blobServiceClient;
    constructor(configService: ConfigService);
    private getContainerClient;
    uploadFile(file: Express.Multer.File, containerName: string): Promise<string>;
    deleteFile(blobUrl: string, containerName: string): Promise<void>;
    getBlobUrl(containerName: string, blobName: string): string;
}
