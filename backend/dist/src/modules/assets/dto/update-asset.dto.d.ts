import { AssetStatus } from '@prisma/client';
export declare class UpdateAssetDto {
    name?: string;
    category?: string;
    serialNo?: string;
    status?: AssetStatus;
}
