import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_LIST, SEED_USERS } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';
import { ListItemService } from '../list-item/list-item.service';
import { ListsService } from '../lists/lists.service';

@Injectable()
export class SeedService {
  // validar
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,

    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,

    @InjectRepository(List)
    private readonly listRepository: Repository<List>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly usersService: UsersService,
    private readonly listItemService : ListItemService,
    private readonly listsService : ListsService,
    private readonly itemsService : ItemsService
  ) {
    // * vamos a validar si la variable STATE es igual a prod y si así lo es, vamos a mandar true en el isProd para validar que estamos en produccion mas adelante
    this.isProd = configService.get('STATE') === 'prod';
  }

  async executeSeed() {
    // ! Si el STATE de las variables .env es igual a prod o true vamos a mandar el error y no ejecutaremos nada en produccion
    if (this.isProd) {
      throw new UnauthorizedException(' We cannot run SEED on production');
    }
    // Limpiar la base de datos BORRAR TODO
    await this.deleteDatabase();

    // Crear Usuarios
    const user = await this.loadUsers();
    // Crear Items
    await this.loadItems(user);
    //Crear Lists
    const list = await this.loadLists(user)
    //Creat listItems
    const items = await this.itemsService.findAll(user, { limit: 15, offset: 0},{});
    await this.loadListItems(list, items )

    return true;
  }

  async deleteDatabase() {
    // borrar listItems
    await this.listItemRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
   
      // borrar listItems
    await this.listRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
    
      // borrar items
    await this.itemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // borra usuarios
    await this.usersRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
  }

  async loadUsers(): Promise<User> {

    const users = [];

    for (const user of SEED_USERS) {
        users.push( await this.usersService.create( user ) )
    }

    return users[0];
  }

  async loadItems(user: User ): Promise<boolean> {

    const items = [];

    SEED_ITEMS.forEach( (item) => items.push( this.itemsService.create( item, user ) ) )

    await Promise.all( items ) ;

    return true;
  }
  
  async loadLists(
    user: User,
  ): Promise<List> {
    
    const lists = [];

    for ( const list of SEED_LIST ){
      lists.push( await this.listsService.create( list, user ) )
    }

    await Promise.all( lists ) ;
    
    return lists[0];
  }

  async loadListItems(
    list: List,
    items: Item[]
  ){
    
    const listItems = []

    for ( const item of items) {
      listItems.push( await this.listItemService.create( {
        quantity: Math.round( Math.random() * 10 ),
        listId: list.id,
        itemId: item.id,
        completed: Math.round( Math.random() * 1 ) === 0 ? false : true
      } ) )
    }

    return await Promise.all( listItems )
  }

}
