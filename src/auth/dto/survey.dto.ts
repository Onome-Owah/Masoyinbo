import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ArrayNotEmpty,
  IsEnum,
} from 'class-validator';

export class SurveyResponseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Email must be a string' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray({ message: 'Survey reasons must be an array' })
  @ArrayNotEmpty({ message: 'Survey reasons cannot be empty' })
  @IsString({ each: true, message: 'Each reason must be a string' })
  survey_reason?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray({ message: 'Survey usage must be an array' })
  @ArrayNotEmpty({ message: 'Survey usage cannot be empty' })
  @IsString({ each: true, message: 'Each usage entry must be a string' })
  survey_usage?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Survey commitment must be a string' })
  survey_commitment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  survey_age?: string;
}
