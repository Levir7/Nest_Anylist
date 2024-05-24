import { ObjectType, Field, Int, ID, Float } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ListItem } from 'src/list-item/entities/list-item.entity';

@Entity({ name: 'items' })
@ObjectType()
export class Item {
  
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  // @Column()
  // @Field(() => Float)
  // quantity: number;

  @Column({ nullable: true }) // nullable en TypeScript TypeORM
  @Field(() => String, { nullable: true }) // nullable en GraphQL
  quantityUnits?: string; // g, ml, kg, nullable en TypeScript


  @ManyToOne( () => User, (user) => user.items, { nullable: false, lazy: true } )
  @Index('userId-index')
  @Field( () => User )
  user: User;

  // un item puede pertenecer muchos list - item 
  @OneToMany( () => ListItem, (listItem) => listItem.item, {lazy: true} )
  @Field( () => [ListItem] )
  listItem: ListItem[];



}
