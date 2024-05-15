import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { AuthReponse } from './types/auth-response.type';
import { LoginInput, SignupInput } from './dto/inputs';

import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ValidRoles } from './enums/valid-roles.enums';


@Resolver( () => AuthReponse )
export class AuthResolver {

  constructor(
    private readonly authService: AuthService
    ) {}

    @Mutation(() => AuthReponse, { name: 'signup' })
    async signUp(
      @Args('signupInput') signupInput: SignupInput
    ): Promise<AuthReponse> {
      return this.authService.signup( signupInput )
    }

    @Mutation(() => AuthReponse, { name: 'login' })
    async login(
      @Args('loginInput') loginInput: LoginInput
    ): Promise<AuthReponse> {
      return this.authService.login(loginInput)
    }

    @Query( () => AuthReponse , { name: 'revalidate' })
    @UseGuards( JwtAuthGuard )
    revalidateToken( 
      @CurrentUser( /* [ ValidRoles.admin ] */ ) user : User // guardamos el user que nos retorna el guard del context en el parametro
     ): AuthReponse {
      return this.authService.reValidateToken( user )
    }
}