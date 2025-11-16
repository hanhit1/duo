import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Progress } from '../schema/progress.schema';
import { CRUDService } from '@app/constracts';
import { Model } from 'mongoose';
@Injectable()
export class ProgressService extends CRUDService<Progress> {
  constructor(@InjectModel(Progress.name) private progressModel: Model<Progress>) {
    super(progressModel);
  }
}
