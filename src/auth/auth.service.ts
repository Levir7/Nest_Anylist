import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthReponse } from './types/auth-response.type';
import { UsersService } from '../users/users.service';
import { LoginInput, SignupInput } from './dto/inputs';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {

    constructor(
        private readonly userService : UsersService,
        private readonly jwtService : JwtService,
    ){}

    private getJwtToken( userId: string) {
        return this.jwtService.sign({ id: userId })
    }

    async signup( signupInput: SignupInput): Promise<AuthReponse> {
        //TODO: Crear usuario
        const user = await this.userService.create(signupInput)

        //TODO: Crear JWT
        const token = this.getJwtToken(user.id)


        return {
            token, user
        }
    }

    async login(
        loginInput: LoginInput
    ): Promise<AuthReponse>{

        const {email, password} = loginInput; //* destructuramos el objeto que estamos recibiendo

        const user = await this.userService.findOneByEmail(email) // * enviamos el email a la fucnion que busca por email en users

        if( !bcrypt.compareSync( password, user.password ) ) //* si regresa un usuario vamos a comparar la password del usuario con la que estamos recibiendo y si no coincide vamos a retornar un error
            throw new BadRequestException('Email / Password do not match');

            //TODO:
        const token = this.getJwtToken(user.id)

        return {
            token,
            user
        }
    }
//* funcion  para validar un usuario
    async validateUser(id: string): Promise<User> {

        const user = await this.userService.findOneById(id)

        if(!user.isActive ) 
            throw new UnauthorizedException('user is inactive talk with a administrator')

            delete user.password;

        return user
    }

    reValidateToken(user: User): AuthReponse {

        const token =  this.getJwtToken(user.id) // creamos el token y regresamos el token con el user

        return { token, user}
    }
}
