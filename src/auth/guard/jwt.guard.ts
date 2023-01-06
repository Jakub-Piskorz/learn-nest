import { AuthGuard } from '@nestjs/passport';

export class GwtGuard extends AuthGuard('gwt') {
  constructor() {
    super();
  }
}
