import { Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { AppError } from '@app/constracts';
import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
dotenv.config();

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  async sendVerificationCode(email: string, code: string): Promise<Result<boolean, AppError>> {
    try {
      const mailOptions = {
        from: process.env.GMAIL_USER!,
        to: email,
        subject: 'Email Verification Code',
        html: `
        ${code} is your verification code. It is valid for 10 minutes. If you did not request this code, please ignore this email.
         `,
      };

      await this.transporter.sendMail({
        from: mailOptions.from,
        to: email,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
      console.log('Verification email sent successfully');
      return ok(true);
    } catch (error) {
      console.error('Email sending error:', error);
      return err({
        message: 'Failed to send verification email',
        cause: error,
        statusCode: 500,
      });
    }
  }

  async sendForgotPasswordCode(email: string, code: string): Promise<Result<boolean, AppError>> {
    try {
      const mailOptions = {
        from: `${process.env.GMAIL_USER}`,
        to: email,
        subject: 'Email Forgot Password Code',
        html: `
          <p>Hi there,</p>
          <p>You requested a password reset. Please use the following code to reset your password:</p>
          <h2>${code}</h2>
          <p>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        `,
      };

      await this.transporter.sendMail({
        from: mailOptions.from,
        to: email,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });

      return ok(true);
    } catch (error) {
      console.error('Email sending error:', error);
      return err({
        message: 'Failed to send verification email',
        cause: error,
        statusCode: 500,
      });
    }
  }
}
