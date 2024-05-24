import { InputType, Int, Field } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { PrimaryGeneratedColumn } from 'typeorm';

@InputType()
export class CreateListInput {
  
  // @Field(() => User)
  // user: User;

  @Field(() => String)
  @MinLength(3)
  @IsString()
  name: string;

}
