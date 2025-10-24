import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { options } from "@config/typeorm-datasource.config";

export default registerAs('typeorm', (): TypeOrmModuleOptions => (options));