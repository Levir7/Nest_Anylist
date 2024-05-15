import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService
    ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // le indicamos donde vamos a recibir el token
    });
  }

  //* para que la estrategia funcione vamos a decirle que realice la validacion solo si recibe un bearer token
  async validate(payload: JwtPayload): Promise<User> {

    const { id } = payload;

    const user = await this.authService.validateUser(id)
    
    return user;

  }
}
