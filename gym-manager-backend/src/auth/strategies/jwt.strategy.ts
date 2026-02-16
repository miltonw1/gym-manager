import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SECRET_KEY', // Debe coincidir con el de AuthModule
    });
  }

  async validate(payload: any) {
    // Lo que retornemos aquí se guardará en req.user
    return { 
      id: payload.sub, 
      email: payload.email, 
      role: payload.role, 
      gymId: payload.gymId 
    };
  }
}
