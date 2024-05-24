import { Resolver, Query, Mutation, Args, Int, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { ValidRolesArgs } from './dto/args/roles.arg';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enums';
import { ItemsService } from '.././items/items.service';
import { Item } from '../items/entities/item.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';
import { ListsService } from '../lists/lists.service';
import { List } from 'src/lists/entities/list.entity';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService,
  ) {}

  @Query(() => [User], { name: 'users' })
  findAll(
    @Args() validRoles: ValidRolesArgs, // vamos a pedir los valid roles para la consulta en caso de que se agreguen y si no pues se va un array vacio como lo definimos en el ValidRolesArgs
    @CurrentUser([ValidRoles.admin]) user: User, // obtenemos el user y validamos que el user.roles coincida con el roles que enviamos en el array como lo definimos en nuestro decorator
  ): Promise<User[]> {
    return this.usersService.findAll(validRoles.roles);
  }

  @Query(() => User, { name: 'user' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin, ValidRoles.superUser]) user: User,
  ): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User, { name: 'updateUser' })
  updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([ValidRoles.admin]) user: User,
  ): Promise<User> {
    return this.usersService.update(updateUserInput.id, updateUserInput, user);
  }

  @Mutation(() => User, { name: 'blockUser' })
  blockUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin]) user: User, //* solo los admin pueden bloquear
  ) {
    return this.usersService.block(id, user);
  }

  // este es un campo calculado 
  @ResolveField( () => Int, { name: 'ItemCount'} ) // este es para agregar el campo a nuestro schema de User
  async itemCount(
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User, // con este decorador es para obtener la información del padre ( User )
  ): Promise<number> {
    
    return this.itemsService.itemCountByUser(user)
  }


   // este es un campo calculado 
   @ResolveField( () => [Item], { name: 'items'} ) // este es para agregar el campo a nuestro schema de User
   async getItemsByUser(
     @CurrentUser([ValidRoles.admin]) adminUser: User,
     @Parent() user: User, // con este decorador es para obtener la información del padre ( User )
     @Args()  paginationArgs : PaginationArgs,
     @Args() searchArgs : SearchArgs
   ): Promise<Item[]> {
     
     return this.itemsService.findAll( user, paginationArgs, searchArgs)
   }



   // este es un campo calculado 
   @ResolveField( () => [List], { name: 'lists'} ) // este es para agregar el campo a nuestro schema de User
   async getListsByUser(
     @CurrentUser([ValidRoles.admin]) adminUser: User,
     @Parent() user: User, // con este decorador es para obtener la información del padre ( User )
     @Args()  paginationArgs : PaginationArgs,
     @Args() searchArgs : SearchArgs
   ): Promise<List[]> {
     
     return this.listsService.findAll( user, paginationArgs, searchArgs)
   }

   
  @ResolveField( () => Int, { name: 'listCount'} ) // este es para agregar el campo a nuestro schema de User
  async listCount(
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User, // con este decorador es para obtener la información del padre ( User )
  ): Promise<number> {
    
    return this.listsService.listsCountByUser(user)
  }


}
