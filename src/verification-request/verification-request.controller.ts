import { Body, Controller, Post } from '@nestjs/common';
import { VerificationRequestService } from './verification-request.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  OmitType,
} from '@nestjs/swagger';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { ValidateVerificationRequestDto } from './dto/validate-verification-request.dto';
import { ValidateRequestEntity } from './entity/validate-request.entity';
import { VerificationRequest } from './entity/verification-request.entity';
import { Admin } from 'src/admin/entities/admin.entity';

class VerificationRequestWithoutToken extends OmitType(VerificationRequest, [
  'token',
] as const) {}

@Controller('verification-request')
@ApiTags('verification-request')
export class VerificationRequestController {
  constructor(
    private readonly verificationRequestService: VerificationRequestService,
  ) {}

  @ApiOperation({
    summary: 'Create a verification request',
  })
  @Post('create')
  @ApiOkResponse({
    type: VerificationRequestWithoutToken,
  })
  createVerificationRequest(
    @Body() createVerificationRequestDto: CreateVerificationRequestDto,
  ): Promise<Omit<VerificationRequest, 'token'>> {
    return this.verificationRequestService.createVerificationRequest({
      createVerificationRequestDto,
    });
  }

  @ApiOperation({
    summary: 'Validate a verification request',
  })
  @ApiOkResponse({
    type: ValidateRequestEntity,
  })
  @Post('validate')
  validateVerificationRequest(
    @Body() validateVerificationRequestDto: ValidateVerificationRequestDto,
  ) {
    return this.verificationRequestService.validateVerificationRequest(
      validateVerificationRequestDto,
    );
  }

  @ApiOperation({
    summary: 'Verify an email (only for admin email verification)',
  })
  @Post('verify-email')
  @ApiOkResponse({
    type: Admin,
  })
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<false | Admin> {
    return this.verificationRequestService.verifyEmail(verifyEmailDto);
  }
}
