import { CustomRequest, Public, toApiErrorResp, uploadImage } from '@app/constracts';
import { Controller, Post, Req, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Public()
@Controller('file')
export class FileController {
  @Post('upload')
  async uploadFile(@Req() req: CustomRequest, @Res() res: FastifyReply) {
    const parts = req.parts();

    for await (const part of parts) {
      if (part.type === 'file' && part.file) {
        const chunks: Buffer[] = [];

        for await (const chunk of part.file) {
          chunks.push(chunk);
        }

        const buffer = Buffer.concat(chunks);

        const result = await uploadImage(buffer, part.filename);
        if (result.isOk()) {
          return res.status(200).send({ url: result.value.url });
        } else {
          return res.status(500).send(toApiErrorResp(result.error));
        }
      } else {
        if (part.type === 'file' && part.file) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for await (const _ of part.file) {
            // consume stream to avoid hanging
          }
        }
      }
    }
    return res.status(400).send(toApiErrorResp({ message: 'No image file provided' }));
  }
}
