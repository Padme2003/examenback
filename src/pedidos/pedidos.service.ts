import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { PedidoProducto } from './entities/pedido-producto.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Repository, DataSource } from 'typeorm';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private pedidosRepository: Repository<Pedido>,
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
    @InjectRepository(PedidoProducto)
    private pedidoProductoRepository: Repository<PedidoProducto>,
    private dataSource: DataSource,
  ) {}

  async create(createPedidoDto: CreatePedidoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pedido = this.pedidosRepository.create({ fecha: createPedidoDto.fecha });
      await queryRunner.manager.save(pedido);

      for (const item of createPedidoDto.productos) {
        const producto = await this.productosRepository.findOneBy({ id: item.productoId });
        if (!producto) {
          throw new NotFoundException(`Producto con ID ${item.productoId} no encontrado`);
        }

        const pedidoProducto = this.pedidoProductoRepository.create({
          pedido,
          producto,
          cantidad: item.cantidad,
        });

        await queryRunner.manager.save(pedidoProducto);
      }

      await queryRunner.commitTransaction();
      return pedido;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return this.pedidosRepository.find({ relations: ['pedidoProductos', 'pedidoProductos.producto'] });
  }

  async findOne(id: number) {
    const pedido = await this.pedidosRepository.findOne({ 
      where: { id }, 
      relations: ['pedidoProductos', 'pedidoProductos.producto'] 
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return pedido;
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    const pedido = await this.findOne(id);

    if (updatePedidoDto.fecha) {
      if (isNaN(new Date(updatePedidoDto.fecha).getTime())) {
        throw new BadRequestException('Fecha inválida');
      }
      pedido.fecha = new Date(updatePedidoDto.fecha);
    }

    if (updatePedidoDto.productos) {
      await this.pedidoProductoRepository.delete({ pedido: { id } });

      for (const item of updatePedidoDto.productos) {
        const producto = await this.productosRepository.findOneBy({ id: item.productoId });
        if (!producto) {
          throw new NotFoundException(`Producto con ID ${item.productoId} no encontrado`);
        }

        const pedidoProducto = this.pedidoProductoRepository.create({
          pedido,
          producto,
          cantidad: item.cantidad,
        });

        await this.pedidoProductoRepository.save(pedidoProducto);
      }
    }

    return this.pedidosRepository.save(pedido);
  }

  async remove(id: number) {
    const pedido = await this.findOne(id);
    return this.pedidosRepository.remove(pedido);
  }
}
