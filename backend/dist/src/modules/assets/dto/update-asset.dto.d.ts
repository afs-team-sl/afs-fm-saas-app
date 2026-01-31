import { AssetStatus } from '@prisma/client';
export declare class UpdateAssetDto {
    name?: string;
    category?: string;
    serialNo?: string;
    status?: AssetStatus;
    roomId?: string;
    site?: string;
    location?: string;
    customId?: string;
    assetNumber?: string;
    manufacturer?: string;
    modelNumber?: string;
    installYear?: number;
    filterSize?: string;
    beltSize?: string;
    notes?: string;
}
