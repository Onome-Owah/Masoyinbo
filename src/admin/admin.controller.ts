import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Create_Admin_Dto } from './dto/create-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('onboard-admin')
  @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'), SuperAdminGuard)
  create(@Body() dto: Create_Admin_Dto, @Req() req) {
    return this.adminService.onboardAdmin(dto);
  }
}
