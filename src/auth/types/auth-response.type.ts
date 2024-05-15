import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "../../users/entities/user.entity";

//* la diferencia entre object e input type es que cuando estamos esperando informacion se les llama InputType, pero cuando vamos nosotros a responder es un ObjectType
@ObjectType()
export class AuthReponse {

    @Field(() => String)
    token: string;

    @Field(() => User)
    user: User;

}