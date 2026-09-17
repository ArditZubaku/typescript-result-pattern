import { Module } from '@nestjs/common';
import { OrdersModule } from './lessons/06-controller/orders.module';

@Module({
  imports: [OrdersModule],
})
class AppModule {}

export { AppModule };
