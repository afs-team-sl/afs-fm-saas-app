"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./common/prisma/prisma.module");
const users_module_1 = require("./modules/users/users.module");
const assets_module_1 = require("./modules/assets/assets.module");
const work_orders_module_1 = require("./modules/work-orders/work-orders.module");
const auth_module_1 = require("./modules/auth/auth.module");
const tenancy_module_1 = require("./modules/tenancy/tenancy.module");
const parts_module_1 = require("./modules/parts/parts.module");
const maintenance_plans_module_1 = require("./modules/maintenance-plans/maintenance-plans.module");
const facilities_module_1 = require("./modules/facilities/facilities.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            assets_module_1.AssetsModule,
            work_orders_module_1.WorkOrdersModule,
            auth_module_1.AuthModule,
            tenancy_module_1.TenancyModule,
            parts_module_1.PartsModule,
            maintenance_plans_module_1.MaintenancePlansModule,
            facilities_module_1.FacilitiesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map