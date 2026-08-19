import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Cat, CatDocument } from './schemas/cat.schema';

@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name) private catModel: Model<CatDocument>) {}

  create(createCatDto: CreateCatDto) {
    return this.catModel.create(createCatDto);
  }

  findAll() {
    return this.catModel.find().exec();
  }

  async findOne(id: string) {
    const cat = await this.catModel.findById(id).exec();
    if (!cat) {
      throw new NotFoundException(`Cat with id ${id} not found`);
    }
    return cat;
  }

  async update(id: string, updateCatDto: UpdateCatDto) {
    const cat = await this.catModel
      .findByIdAndUpdate(id, updateCatDto, { returnDocument: 'after' })
      .exec();
    if (!cat) {
      throw new NotFoundException(`Cat with id ${id} not found`);
    }
    return cat;
  }

  async remove(id: string) {
    const cat = await this.catModel.findByIdAndDelete(id).exec();
    if (!cat) {
      throw new NotFoundException(`Cat with id ${id} not found`);
    }
    return cat;
  }
}
