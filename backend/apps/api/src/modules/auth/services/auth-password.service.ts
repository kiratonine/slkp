import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthPasswordService {
  private static readonly SALT_ROUNDS = 10;

  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, AuthPasswordService.SALT_ROUNDS);
  }
}