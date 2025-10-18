import { Injectable } from "@nestjs/common";
import { Cat } from "./cat.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CatCreateDto } from "./dto";

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private catsRepository: Repository<Cat>,
  ) { }

  async createCat(dto: CatCreateDto): Promise<Cat> {
    const newCat = this.catsRepository.create(dto);
    return this.catsRepository.save(newCat);
  }

  getCats(): Promise<Cat[]> {
    return this.catsRepository.find();
  }
}