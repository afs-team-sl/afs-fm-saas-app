"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const storage_blob_1 = require("@azure/storage-blob");
const config_1 = require("@nestjs/config");
let StorageService = class StorageService {
    configService;
    blobServiceClient;
    constructor(configService) {
        this.configService = configService;
        const connectionString = this.configService.get('AZURE_STORAGE_CONNECTION_STRING');
        if (!connectionString) {
            throw new Error('AZURE_STORAGE_CONNECTION_STRING is not defined in environment variables');
        }
        this.blobServiceClient =
            storage_blob_1.BlobServiceClient.fromConnectionString(connectionString);
    }
    async getContainerClient(containerName) {
        const containerClient = this.blobServiceClient.getContainerClient(containerName);
        const exists = await containerClient.exists();
        if (!exists) {
            await containerClient.create({
                access: 'blob',
            });
            console.log(`✅ Container "${containerName}" created successfully`);
        }
        return containerClient;
    }
    async uploadFile(file, containerName) {
        try {
            const containerClient = await this.getContainerClient(containerName);
            const timestamp = Date.now();
            const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            const blobName = `${timestamp}-${sanitizedFilename}`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.uploadData(file.buffer, {
                blobHTTPHeaders: {
                    blobContentType: file.mimetype,
                },
            });
            return blockBlobClient.url;
        }
        catch (error) {
            console.error('Azure Blob Upload Error:', error);
            throw new common_1.InternalServerErrorException('Failed to upload file to Azure Blob Storage');
        }
    }
    async deleteFile(blobUrl, containerName) {
        try {
            const containerClient = await this.getContainerClient(containerName);
            const blobName = blobUrl.split('/').pop();
            if (!blobName) {
                throw new Error('Invalid blob URL');
            }
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.deleteIfExists();
            console.log(`✅ Deleted blob: ${blobName}`);
        }
        catch (error) {
            console.error('Azure Blob Delete Error:', error);
            throw new common_1.InternalServerErrorException('Failed to delete file from Azure Blob Storage');
        }
    }
    getBlobUrl(containerName, blobName) {
        const containerClient = this.blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        return blockBlobClient.url;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map