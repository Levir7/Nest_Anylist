import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { Item } from './entities/item.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './../users/entities/user.entity';
import { PaginationArgs, SearchArgs } from './../common/dto/args';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item) // le indicamos que va trabajar con una entidad del tipo Item
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    delete user.password;

    const newItem = this.itemsRepository.create({ ...createItemInput, user });

    return await this.itemsRepository.save(newItem);
  }

  async findAll(
    user: User,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<Item[]> {
    const { limit, offset } = paginationArgs; // obtenemos lo de pagnation
    const { search } = searchArgs;

    const queryBuilder = this.itemsRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where('"userId" = :userId', { userId: user.id });

      // * si viene el search que pase a lowercase todo en la columna name de la bd y aplique el like name ( que es el valor de %search.tolowerCase()% )
    if (search) {
      queryBuilder.andWhere('LOWER(name) like :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }

    return queryBuilder.getMany();

    //TODO: Filtrar, paginar, por usuario
    // return await this.itemsRepository.find({
    //   take: limit, // limit
    //   skip: offset, // offset
    //   where: {
    //     user: {
    //       id: user1.id,
    //     },
    //     name: Like(`%${search}%`)  // select * from items where name like = ''
    //   },
    // });
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({
      id,
      user: {
        id: user.id,
      },
    });

    if (!item) throw new NotFoundException(`Item ${id} not found`);

    return item;
  }

  async update(
    id: string,
    updateItemInput: UpdateItemInput,
    user: User,
  ): Promise<Item> {
    await this.findOne(id, user);

    const item = await this.itemsRepository.preload({id, ...updateItemInput, user});

    if (!item) throw new NotFoundException(`Item ${id} not found`);

    return this.itemsRepository.save(item);
  }

  async remove(id: string, user: User): Promise<Item> {
    //TODO: soft delete, integridad referencial
    const item = await this.findOne(id, user);

    await this.itemsRepository.remove(item);

    return { ...item, id };
  }

  async itemCountByUser(user: User): Promise<number> {
    return this.itemsRepository.count({
      where: {
        user: {
          id: user.id,
        },
      },
    });
  }
}
