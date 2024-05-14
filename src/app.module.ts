import { Module } from '@nestjs/common';
import { WalletModule } from './modules/wallet/wallet.module';
import { UserModule } from './modules/user/user.module';
import { TypeOrmConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot(TypeOrmConfig()),
    WalletModule, 
    UserModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
