import { Injectable } from '@nestjs/common';
import { User } from '../../../../prisma/generated/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class UsersService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  public async findById(userId: string) {
    return this.prismaService.user.findUnique({
        where: {
        id: userId,
        },
    });
  }
}