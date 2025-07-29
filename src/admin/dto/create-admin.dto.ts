import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString } from "class-validator";

export class Create_Admin_Dto {
  @ApiProperty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsString()
  last_name: string;

  @ApiProperty()
  @IsString()
  role: string;
}