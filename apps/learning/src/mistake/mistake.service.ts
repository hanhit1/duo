import { Injectable } from '@nestjs/common';
import { Mistake } from '../schema/mistake.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AppError, CRUDService, ErrorMessage } from '@app/constracts';
import { CreateMistakeDto } from '@app/constracts/learning/dto/create-mistake.dto';
import { err, ok, Result } from 'neverthrow';
import { UpdateMistakeDto } from '@app/constracts/learning/dto/update-mistake.dto';
import { LessonService } from '../lesson/lesson.service';
import { QuestionService } from '../question/question.service';

@Injectable()
export class MistakeService extends CRUDService<Mistake> {
  constructor(
    @InjectModel(Mistake.name) private readonly mistakeModel: Model<Mistake>,
    private readonly questionService: QuestionService,
    private readonly lessonService: LessonService,
  ) {
    super(mistakeModel);
  }

  async insert(
    createDto: Partial<CreateMistakeDto & { userId: string }>,
  ): Promise<Result<string, AppError>> {
    try {
      const currentList = (
        await this.mistakeModel
          .find({ userId: new mongoose.Types.ObjectId(createDto.userId) })
          .select('questionId')
          .lean()
      ).map((item) => item.questionId.toString());

      const newMistakes: string[] = [];
      createDto.wrongAnswer?.forEach((questionId) => {
        if (!currentList.includes(questionId)) {
          newMistakes.push(questionId);
        }
      });

      if (newMistakes.length > 0) {
        /// get unitId from question -> lesson -> unit
        let unitId: any = null;
        const lessonId = await this.questionService
          .findOne({ _id: newMistakes[0] })
          .then((res) => (res.isOk() ? res.value.lessonId : null));

        if (lessonId) {
          const unitIdOfLesson: any = await this.lessonService
            .findOne({ _id: lessonId })
            .then((res) => (res.isOk() ? res.value.unitId : null));
          if (unitIdOfLesson) {
            unitId = unitIdOfLesson;
          }
        }

        await this.mistakeModel.insertMany(
          newMistakes.map((questionId) => ({
            unitId: new mongoose.Types.ObjectId(unitId),
            userId: new mongoose.Types.ObjectId(createDto.userId),
            questionId: new mongoose.Types.ObjectId(questionId),
          })),
        );
        return ok('Insert mistakes successfully');
      }

      return ok('No new mistakes to insert');
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_CREATING_MODEL,
        statusCode: 500,
        context: createDto,
        cause: e,
      });
    }
  }

  async removeMistakes(
    userId: string,
    updateDto: UpdateMistakeDto,
  ): Promise<Result<string, AppError>> {
    try {
      await this.mistakeModel.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
        $or: updateDto.correctAnswer?.map((item) => ({
          unitId: new mongoose.Types.ObjectId(item.unitId),
          questionId: new mongoose.Types.ObjectId(item.questionId),
        })),
      });

      return ok('Remove mistakes successfully');
    } catch (e) {
      return err({
        message: 'Error when removing mistakes',
        statusCode: 500,
        context: updateDto,
        cause: e,
      });
    }
  }
}
