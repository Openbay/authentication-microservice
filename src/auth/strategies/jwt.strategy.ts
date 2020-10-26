import * as moment from 'moment';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { MessagingService } from '../../messaging/messaging.service';
import { AuthConfigService } from '../auth-config.service';
import { AuthenticatedUser, DecodedToken } from '../auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(readonly config: AuthConfigService, readonly messagingService: MessagingService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.publicKey.toString()
    });
  }

  async validate(token: DecodedToken) {
    const user: AuthenticatedUser = await this.messagingService.sendAsync('user.find-by', {
      id: token.sub
    });
    if (moment(user.tokenExpiration).isBefore(moment.unix(token.exp))) return false;

    return user;
  }
}
