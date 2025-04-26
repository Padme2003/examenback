import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Producto } from '../../../productos/entities/producto.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ValidateProductosPipe implements PipeTransform {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
  ) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (value.productos) {
      for (const item of value.productos) {
        const producto = await this.productosRepository.findOneBy({ id: item.productoId });
        if (!producto) {
          throw new BadRequestException(`Producto con ID ${item.productoId} no existe`);
        }
      }
    }
    return value;
  }
}
