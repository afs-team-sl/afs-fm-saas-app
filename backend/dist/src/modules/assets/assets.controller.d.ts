import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    create(createAssetDto: CreateAssetDto, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        roomId: string | null;
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
    }>;
    findUniqueLocations(tenantId: string): Promise<(string | null)[]>;
    findAll(tenantId: string, status?: string, category?: string, roomId?: string, location?: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        roomId: string | null;
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
    }[]>;
    findOne(id: string, tenantId: string): Promise<{
        latestReadings: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray | null;
        workOrders: ({
            assignedTo: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            title: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
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
        room: ({
            floor: {
                building: {
                    id: string;
                    tenantId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            floorId: string;
        }) | null;
        documents: {
            id: string;
            createdAt: Date;
            name: string;
            assetId: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
        }[];
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        roomId: string | null;
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
    }>;
    update(id: string, tenantId: string, updateAssetDto: UpdateAssetDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        roomId: string | null;
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
    }>;
    remove(id: string, tenantId: string, req: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        roomId: string | null;
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
        createdAt: Date;
        name: string;
        assetId: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }>;
    getDocuments(assetId: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        assetId: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }[]>;
    deleteDocument(assetId: string, documentId: string, tenantId: string): Promise<{
        message: string;
    }>;
}
