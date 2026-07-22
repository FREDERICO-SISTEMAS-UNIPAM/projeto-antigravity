import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GeoService } from './geo.service';
import { LocateCoordinatesDto } from './dto/locate-coordinates.dto';
import { CalculateEtaQueryDto } from './dto/calculate-eta.dto';

@ApiTags('Geolocalização & Bairros (Módulo 3)')
@Controller('api/geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Post('locate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Identifica o bairro a partir de coordenadas GPS (Latitude / Longitude)',
    description: 'Calcula o bairro mais próximo da posição GPS informada pelo motoboy utilizando Geofencing/Haversine.',
  })
  @ApiResponse({ status: 200, description: 'Bairro identificado com sucesso.' })
  locateNeighborhood(@Body() dto: LocateCoordinatesDto) {
    return this.geoService.getNeighborhoodFromCoordinates(dto.latitude, dto.longitude, dto.city);
  }

  @Get('eta')
  @ApiOperation({
    summary: 'Calcula a distância em km e o tempo estimado de chegada (ETA) entre dois bairros',
  })
  @ApiResponse({ status: 200, description: 'Estimativa de distância e tempo calculada.' })
  @ApiResponse({ status: 404, description: 'Um dos bairros informados não foi encontrado no cadastro.' })
  calculateEta(@Query() query: CalculateEtaQueryDto) {
    return this.geoService.calculateDistanceAndEta(query.originNeighborhood, query.destinationNeighborhood, query.city);
  }

  @Get('neighborhoods')
  @ApiOperation({ summary: 'Lista todos os bairros cadastrados de uma cidade' })
  @ApiResponse({ status: 200, description: 'Lista de bairros com coordenadas retornada.' })
  listNeighborhoods(@Query('city') citySlug?: string) {
    return this.geoService.findAllNeighborhoods(citySlug);
  }

  @Post('seed')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Executa a carga inicial (Seed) dos bairros com coordenadas centrais' })
  @ApiResponse({ status: 201, description: 'Seed executado com sucesso.' })
  seedNeighborhoods(@Query('city') citySlug?: string) {
    return this.geoService.seedNeighborhoods(citySlug);
  }
}
