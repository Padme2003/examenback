import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PedidosModule } from './pedidos/pedidos.module';
import { ProductsModule } from './products/products.module';
import { ProductosModule } from './productos/productos.module';

@Module({
  imports: [PedidosModule, ProductsModule, ProductosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
