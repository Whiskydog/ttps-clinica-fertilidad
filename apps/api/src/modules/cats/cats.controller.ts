import { Body, Controller, Get, Post } from "@nestjs/common";
import { CatsService } from "./cats.service";
import { CatCreateDto, CatResponseDto } from "./dto";
import { ZodSerializerDto } from "nestjs-zod";
import { Cat } from "./cat.entity";

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) { }

  @Post()
  @ZodSerializerDto(CatResponseDto)
  async createCat(@Body() dto: CatCreateDto): Promise<Cat> {
    const cat = await this.catsService.createCat(dto);
    return cat;
  }

  @Get()
  @ZodSerializerDto([CatResponseDto])
  async getCats(): Promise<Cat[]> {
    const cats = await this.catsService.getCats();
    return cats;
  }
}