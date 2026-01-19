import { AssetStatus } from '@prisma/client';
export declare class CreateAssetDto {
    name: string;
    category: string;
    serialNo?: string;
    status: AssetStatus;
}
