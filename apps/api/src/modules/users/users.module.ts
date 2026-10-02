import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Injectable()
class DeletionSweeper implements OnModuleInit {
  constructor(private readonly users: UsersService) {}
  onModuleInit(): void {
    const timer = setInterval(() => void this.users.processDueDeletions(), 12 * 60 * 60 * 1000);
    timer.unref?.();
  }
}

@Module({
  controllers: [UsersController],
  providers: [UsersService, DeletionSweeper],
  exports: [UsersService],
})
export class UsersModule {}