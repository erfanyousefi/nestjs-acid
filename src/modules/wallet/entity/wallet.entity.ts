import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { WalletType } from "../wallet.enum";
import { User } from "src/modules/user/entity/user.entity";

@Entity("wallet")
export class Wallet {
    @PrimaryGeneratedColumn("increment")
    id: number;
    @Column({ type: "enum", enum: WalletType })
    type: string
    @Column({type: "numeric"})
    amount: number
    @Column({nullable: true})
    reason: string
    @Column({nullable: true})
    productId: number
    @Column()
    invoice_number: string
    @CreateDateColumn()
    created_at: Date;
    @Column()
    userId: number;
    @ManyToOne(() => User, user => user.transactions, {onDelete: "CASCADE"})
    user: User
}