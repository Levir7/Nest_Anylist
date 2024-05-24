import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsUUID, Min} from 'class-validator';

@InputType()
export class CreateListItemInput {
  
  @Field(() => Number, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity: number = 1;

  @Field(() => ID, { nullable: false })
  @IsUUID()
  listId: string;

  @Field(() => ID, { nullable: false })
  @IsUUID()
  itemId: string;

  
  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  completed: boolean = false;


}
