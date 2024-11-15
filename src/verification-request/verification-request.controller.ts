import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { VerificationRequestService } from './verification-request.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { ValidateVerificationRequestDto } from './dto/validate-verification-request.dto';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { ValidateRequestEntity } from './entity/validate-request.entity';
import { VerificationRequest } from './entity/verification-request.entity';

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
    type: VerificationRequest,
  })
  createVerificationRequest(
    @Body() createVerificationRequestDto: CreateVerificationRequestDto,
  ) {
    if (createVerificationRequestDto.type === 'EMAIL_VERIFICATION') {
      throw new ConflictException(ErrorMessagesHelper.CONFLICT);
    }

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
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.verificationRequestService.verifyEmail(verifyEmailDto);
  }
}
