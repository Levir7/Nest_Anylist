import { createParamDecorator, ExecutionContext, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ValidRoles } from '../enums/valid-roles.enums';
import { User } from '../../users/entities/user.entity';



export const CurrentUser = createParamDecorator( 
    //* tenemos que definir dos parametros, uno va ser los roles que vamos a tener, y el context está tomando lo que existe en este momento en el request de la aplicacion y se lo enviamos al context de graphql para que lo use
    ( roles: ValidRoles[] = [], context: ExecutionContext ) => {

        const ctx = GqlExecutionContext.create( context );
        const user: User = ctx.getContext().req.user;

        if ( !user ) {
            throw new InternalServerErrorException(' No user inside the request - make sure that we used the UseGuard')
        }

        if( roles.length === 0 ) return user;

        //TODO: eliminar validroles
        for( const role of user.roles ) {
            if( roles.includes( role as ValidRoles )){
                return user;
            }
        }

        throw new ForbiddenException(
            `User ${ user.fullName } need a valid roles [ ${roles} ]`
        )

})