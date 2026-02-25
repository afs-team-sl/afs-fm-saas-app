import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    create(createAssetDto: CreateAssetDto, tenantId: string): Promise<{
        tenantId: string;
        id: string;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        site: string | null;
        location: string | null;
        customId: string | null;
        assetNumber: string | null;
        manufacturer: string | null;
        modelNumber: string | null;
        installYear: number | null;
        filterSize: string | null;
        beltSize: string | null;
        notes: string | null;
        department: string | null;
        image: string | null;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        roomId: string | null;
    }>;
    findAll(tenantId: string, status?: string, category?: string): Promise<{
        tenantId: string;
        id: string;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        site: string | null;
        location: string | null;
        customId: string | null;
        assetNumber: string | null;
        manufacturer: string | null;
        modelNumber: string | null;
        installYear: number | null;
        filterSize: string | null;
        beltSize: string | null;
        notes: string | null;
        department: string | null;
        image: string | null;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        roomId: string | null;
    }[]>;
    findOne(id: string, tenantId: string): Promise<{
        latestReadings: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray | null;
        room: ({
            floor: {
                building: {
                    tenantId: string;
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    address: string | null;
                };
            } & {
                number: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                buildingId: string;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            floorId: string;
        }) | null;
        workOrders: ({
            assignedTo: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            tenantId: string;
            id: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            priority: import(".prisma/client").$Enums.WorkOrderPriority;
            assetId: string;
            assignedToId: string | null;
            completionNote: string | null;
            startedAt: Date | null;
            dueDate: Date | null;
            laborHours: number | null;
            checklistData: import("@prisma/client/runtime/library").JsonValue | null;
            legacyId: string | null;
        })[];
        documents: {
            id: string;
            name: string;
            createdAt: Date;
            assetId: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
        }[];
        tenantId: string;
        id: string;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        site: string | null;
        location: string | null;
        customId: string | null;
        assetNumber: string | null;
        manufacturer: string | null;
        modelNumber: string | null;
        installYear: number | null;
        filterSize: string | null;
        beltSize: string | null;
        notes: string | null;
        department: string | null;
        image: string | null;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        roomId: string | null;
    }>;
    update(id: string, tenantId: string, updateAssetDto: UpdateAssetDto): Promise<{
        tenantId: string;
        id: string;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        site: string | null;
        location: string | null;
        customId: string | null;
        assetNumber: string | null;
        manufacturer: string | null;
        modelNumber: string | null;
        installYear: number | null;
        filterSize: string | null;
        beltSize: string | null;
        notes: string | null;
        department: string | null;
        image: string | null;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        roomId: string | null;
    }>;
    remove(id: string, tenantId: string, req: any): Promise<{
        tenantId: string;
        id: string;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        site: string | null;
        location: string | null;
        customId: string | null;
        assetNumber: string | null;
        manufacturer: string | null;
        modelNumber: string | null;
        installYear: number | null;
        filterSize: string | null;
        beltSize: string | null;
        notes: string | null;
        department: string | null;
        image: string | null;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        roomId: string | null;
    }>;
    bulkCreate(assets: CreateAssetDto[], tenantId: string): Promise<{
        count: number;
        message: string;
    }>;
    removeAll(tenantId: string): Promise<{
        count: number;
        message: string;
    }>;
    uploadImage(assetId: string, tenantId: string, file: Express.Multer.File): Promise<{
        imageUrl: string;
    }>;
    uploadDocument(assetId: string, tenantId: string, file: Express.Multer.File): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        assetId: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }>;
    getDocuments(assetId: string, tenantId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        assetId: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }[]>;
    deleteDocument(assetId: string, documentId: string, tenantId: string): Promise<{
        message: string;
    }>;
}
