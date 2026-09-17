import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { Order, OrdersService } from './orders.service';

@Controller('orders')
class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Order {
    const result = this.ordersService.findById(id);

    // TODO: this is the one rule every controller should follow —
    // if (!result.ok) throw new BadRequestException(result.error);
    // return result.data;
    throw new Error('TODO: branch on result.ok');
  }
}

export { OrdersController };
