import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entity/wallet.entity';
import { User } from '../user/entity/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Wallet, User])],
  controllers: [WalletController],
  providers: [WalletService, UserService],
})
export class WalletModule {}
