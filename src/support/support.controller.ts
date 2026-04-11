import { Body, Controller, Post } from '@nestjs/common';
import { ContactDto } from './dto/contact.dto';

@Controller('support')
export class SupportController {
  @Post('contact')
  async contact(@Body() dto: ContactDto) {
    // In a real app, logic to send an email or save to DB goes here
    return { message: 'Your message has been sent successfully' };
  }
}
