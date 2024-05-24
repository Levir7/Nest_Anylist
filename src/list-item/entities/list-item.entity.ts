import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { List } from '../../lists/entities/list.entity';
import { Item } from 'src/items/entities/item.entity';

@Entity('listItems') //TYPEORM
@ObjectType() //GRAPHQL
export class ListItem {
  
  @PrimaryGeneratedColumn('uuid')// TYPEORM
  @Field( () => ID) // GRAPHQL
  id: string;

  @Column({ type: 'numeric'})
  @Field( () => Number )
  quantity: number;

   @Column({ type: 'boolean'})
  @Field( () => Boolean )
  completed: boolean;

  // * Relaciones
  // * muchos list-item pueden relacionarse a una sola list
  @ManyToOne( () => List, (list) => list.listItem, { lazy: true} )
  @Field(() => List) // este es el que me va a mostrar los datos de la lista en graphql
  list: List;

  // * muchos list-item pueden relacionarse a un solo item
  @ManyToOne( () => Item, (item) => item.listItem, { lazy: true} )
  @Field(() => Item) // este es el que me va a mostrar los datos del item en graphql
  item: Item;

}
