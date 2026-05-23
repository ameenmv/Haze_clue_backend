import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactDto } from './dto/contact.dto';
import { SupportTicket, SupportTicketDocument } from './schemas/support-ticket.schema';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    @InjectModel(SupportTicket.name)
    private readonly ticketModel: Model<SupportTicketDocument>,
  ) {}

  async createTicket(dto: ContactDto) {
    const ticket = await this.ticketModel.create({
      fullName: dto.fullName,
      email: dto.email,
      subject: dto.subject,
      message: dto.message,
    });

    // Send email to hazeclue@gmail.com
    try {
      const transporter = require('nodemailer').createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER || 'hazeclue@gmail.com',
          pass: process.env.SMTP_PASS, // User needs to set this in .env
        },
      });

      await transporter.sendMail({
        from: `"HazeClue Support" <${process.env.SMTP_USER || 'hazeclue@gmail.com'}>`,
        to: 'hazeclue@gmail.com',
        subject: `New Support Ticket: ${dto.subject}`,
        text: `You have received a new message from the contact form.\n\nName: ${dto.fullName}\nEmail: ${dto.email}\nSubject: ${dto.subject}\nMessage:\n${dto.message}`,
        html: `
          <h3>New Support Ticket</h3>
          <p><strong>Name:</strong> ${dto.fullName}</p>
          <p><strong>Email:</strong> ${dto.email}</p>
          <p><strong>Subject:</strong> ${dto.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${dto.message.replace(/\n/g, '<br>')}</p>
        `,
      });
      this.logger.log(`Email sent to hazeclue@gmail.com for ticket ${ticket.id}`);
    } catch (error) {
      this.logger.error('Failed to send email:', error);
    }

    this.logger.log(`Support ticket created: ${ticket.id} from ${dto.email}`);
    return ticket;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.ticketModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.ticketModel.countDocuments().exec(),
    ]);
    return { data, total, page, limit };
  }
}
