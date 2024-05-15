import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';

@Injectable()
export class SeedService {
  // validar
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly usersService: UsersService,

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

    return true;
  }

  async deleteDatabase() {
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
}
