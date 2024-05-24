import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lists'})
@ObjectType()
export class List {
  
  @Field( () => ID )
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({
    type: 'text',
  })
  @IsString()
  @MinLength(3)
  name: string;

  // TODO: RELATIONS
  @ManyToOne( () => User,  (user) => user.lists, { lazy: true })
  @Index('userId-list-index')
  @Field(() => User)
  user: User;

  @OneToMany( () => ListItem, (listItem) => listItem.list, { lazy: true })
  // @Field(() => [ListItem] ) // * quitamos el field para que no lo regrese de manera automatica y generamos un resolved para poder paginar, filtra, etc...
  listItem: ListItem[];

}
