import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Pedido } from './pedidos/entities/pedido.entity';
import { Producto } from './productos/entities/producto.entity';
import { PedidoProducto } from './pedidos/entities/pedido-producto.entity';
import { PedidosModule } from './pedidos/pedidos.module';
import { ProductosModule } from './productos/productos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,  // Puerto por defecto 5432
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Pedido, Producto, PedidoProducto],
      synchronize: true,
      logging: true,
    }),
    PedidosModule,
    ProductosModule,
  ],
})
export class AppModule {}


