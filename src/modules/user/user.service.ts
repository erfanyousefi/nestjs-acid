import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ) { }
    async findById(id: number) {
        const user = await this.userRepository.findOneBy({id});
        if(!user) throw new NotFoundException();
        return user;
    }
    async createUser(createDto: CreateUserDto) {
        const {mobile} = createDto;
        let user = await this.userRepository.findOneBy({mobile});
        if(!user) {
            user = this.userRepository.create(createDto);
            return await this.userRepository.save(user)
        }
        return user;
    }
}
