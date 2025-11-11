import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  // The canActivate method is inherited from AuthGuard('jwt')
  // and will handle JWT validation automatically.
  // The custom implementation with the AUTH_DISABLED bypass has been removed
  // to enhance security and prevent accidental deactivation of authentication in production.
}
