import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { InjectRepository } from '@nestjs/typeorm';
import { ListItem } from './entities/list-item.entity';
import { Repository } from 'typeorm';
import { List } from 'src/lists/entities/list.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

@Injectable()
export class ListItemService {
  constructor(
    @InjectRepository(ListItem)
    private readonly lisItemRepository: Repository<ListItem>,
  ) {}

  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
    const { itemId, listId, ...rest } = createListItemInput;

    const newListItem = this.lisItemRepository.create({
      ...rest,
      item: { id: itemId },
      list: { id: listId },
    });

    await this.lisItemRepository.save(newListItem);

    return this.findOne( newListItem.id );
  }

  async findAll(
    list: List,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.lisItemRepository
      .createQueryBuilder()
      .take(limit)
      .offset(offset)
      .where(`"listId" = :listId`, { listId: list.id }); // que no envie solo los que sean

    if (search) {
      queryBuilder.andWhere('LOWER(list.name) like :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }

    return queryBuilder.getMany();
  }
  async totalItemsByList(list: List): Promise<number> {
    return await this.lisItemRepository.count({
      where: {
        list: {
          id: list.id,
        },
      },
    });
  }

  async findOne(id: string): Promise<ListItem> {
    const listItem = await this.lisItemRepository.findOneBy({ id });

    if (!listItem) throw new NotFoundException('No item found');

    return listItem;
  }

  async update(id: string, updateListItemInput: UpdateListItemInput) {
    const { listId, itemId, ...rest } = updateListItemInput;

    // const listItem = await this.lisItemRepository.preload({
    //   ...rest,
    //   list: { id: listId},
    //   item: { id: itemId },
    // })

    const queryBuilder = this.lisItemRepository
      .createQueryBuilder()
      .update()
      .set(rest)
      .where('id = :id', { id });

    if (listId) queryBuilder.set({ list: { id: listId } });
    if (itemId) queryBuilder.set({ item: { id: itemId } });

    await queryBuilder.execute();
    
    return await this.findOne(id);
  }

  // remove(id: number) {
  //   return `This action removes a #${id} listItem`;
  // }
}
