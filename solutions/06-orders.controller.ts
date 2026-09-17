// Reference solution for lesson 06 — try it yourself first.
import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { Order, OrdersService } from '../src/lessons/06-controller/orders.service';

@Controller('orders')
class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Order {
    const result = this.ordersService.findById(id);
    if (!result.ok) throw new BadRequestException(result.error);
    return result.data;
  }
}

export { OrdersController };
