import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entity/wallet.entity';
import { DataSource, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { DepositDto, WithdrawDto } from './wallet.dto';
import { User } from '../user/entity/user.entity';
import { WalletType } from './wallet.enum';
import { ProductList } from '../products';

@Injectable()
export class WalletService {
    constructor(
        @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
        private userService: UserService,
        private dataSource: DataSource
    ) { }

    async deposit(depositDto: DepositDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { amount, fullname, mobile } = depositDto;
            const user = await this.userService.createUser({ mobile, fullname });
            const userData = await queryRunner.manager.findOneBy(User, {id: user.id});
            const newBalance = userData.balance + amount;
            await queryRunner.manager.update(User, {id: user.id}, {balance: newBalance});
            await queryRunner.manager.insert(Wallet, {
                amount,
                type: WalletType.Deposit,
                invoice_number: Date.now().toString(),
                userId: user.id
            });
            //commit
            await queryRunner.commitTransaction();
            await queryRunner.release();
        } catch (error) {
            //rollback
            console.log(error);
            await queryRunner.rollbackTransaction();
            await queryRunner.release()
        }
        return {
            message: "payment successfully"
        }
    }
    async paymentByWallet(withdrawDto: WithdrawDto) {
        const {productId, userId} = withdrawDto;
        const product = ProductList.find(product => product.id === productId);
        if(!product) throw new NotFoundException("notfound product");
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await queryRunner.manager.findOneBy(User, {id: userId});
            if(!user) throw new NotFoundException("user notfound");
            if(product.price > user.balance) {
                throw new BadRequestException("user balance not enough");
            }
            const newBalance = user.balance - product.price;
            await queryRunner.manager.update(User, {id: userId}, {balance: newBalance});
            await queryRunner.manager.insert(Wallet, {
                amount: product.price,
                userId,
                reason: "buy product " + product.name,
                productId,
                invoice_number: Date.now().toString(),
                type: WalletType.Withdraw
            });
            //commit
            await queryRunner.commitTransaction();
            await queryRunner.release();
        } catch (error) {
            //rollback
            await queryRunner.rollbackTransaction();
            await queryRunner.release()
            if(error?.statusCode) {
                throw new HttpException(error.message, error?.statusCode)
            }
            throw new BadRequestException(error?.message)
        }
        return {
            message: "payment order successfully"
        }
    }
}
