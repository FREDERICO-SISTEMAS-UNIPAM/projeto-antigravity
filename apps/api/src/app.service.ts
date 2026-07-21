import { Injectable } from '@nestjs/common';
import { User, UserSchema, ApiResponse } from '@repo/types';

@Injectable()
export class AppService {
  getHealth(): ApiResponse<{ status: string; userValidation: boolean }> {
    const testUser: User = {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'API System User',
      email: 'api@antigravity.io',
    };

    const isUserValid = UserSchema.safeParse(testUser).success;

    return {
      success: true,
      message: 'API Antigravity Operational',
      data: {
        status: 'ok',
        userValidation: isUserValid,
      },
    };
  }
}
