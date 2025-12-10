import { AppError, CreateQuestionDto, CRUDService, ErrorMessage } from '@app/constracts';
import { Injectable } from '@nestjs/common';
import { Question } from '../schema/question.schema';
import { LessonService } from '../lesson/lesson.service';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ok, err, Result } from 'neverthrow';
import { UpdateQuestionDto } from '@app/constracts/learning/dto/update-question.dto';
import { QuestionType } from '@app/constracts/common/enum';

@Injectable()
export class QuestionService extends CRUDService<Question> {
  constructor(
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
    private readonly lessonService: LessonService,
  ) {
    super(questionModel);
  }

  async insert(createDto: CreateQuestionDto): Promise<Result<Question, AppError>> {
    try {
      if (createDto.lessonId) {
        //check lesson
        const hasLesson = this.lessonService.findOne({ _id: createDto.lessonId });
        if (!hasLesson) {
          return err({
            message: 'LessonId not found',
            statusCode: 400,
          });
        }
        // calculate displayOrder of question
        if (!createDto.displayOrder) {
          // get question has max displayOrder in the same lesson
          const lastQuestion = await this.questionModel
            .findOne({ lessonId: createDto.lessonId })
            .sort({ displayOrder: -1 })
            .select({ displayOrder: 1 })
            .lean();

          createDto.displayOrder = lastQuestion ? lastQuestion.displayOrder + 1 : 1;
        } else {
          const isExistDisplayOrder = await this.questionModel.findOne({
            lessonId: createDto.lessonId,
            displayOrder: Number(createDto.displayOrder),
          });
          if (isExistDisplayOrder) {
            return err({
              message: 'Display order already exists',
              statusCode: 400,
            });
          }
        }
      }

      if (createDto.typeQuestion === QuestionType.MATCHING) {
        for (let i = 0; i < (createDto.leftText as any).length; i++) {
          const pairId = new mongoose.Types.ObjectId();
          (createDto.leftText as any)[i] = { ...(createDto.leftText as any)[i], pairId };
          (createDto.rightText as any)[i] = { ...(createDto.rightText as any)[i], pairId };
        }
      }

      const modelInstance = new this.questionModel(createDto);
      const createdModel = await modelInstance.save();
      return ok(createdModel.toObject() as Question);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_CREATING_MODEL,
        statusCode: 500,
        context: createDto,
        cause: e,
      });
    }
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Result<Question, AppError>> {
    try {
      const hasQuestion = await this.questionModel.findById(id);
      if (!hasQuestion) return err({ message: 'This question is not exist', statusCode: 404 });

      const targetLessonId = updateQuestionDto.lessonId
        ? updateQuestionDto.lessonId
        : hasQuestion.lessonId;
      const targetDisplayOrder = Number(
        updateQuestionDto.displayOrder ? updateQuestionDto.displayOrder : hasQuestion.displayOrder,
      );
      const hasLesson = await this.lessonService.findOne({ _id: targetLessonId });
      if (!hasLesson) return err({ message: 'LessonId not found', statusCode: 400 });

      const isExistingDisplayOrder = await this.questionModel.findOne({
        lessonId: targetLessonId,
        displayOrder: targetDisplayOrder,
        _id: { $ne: id },
      });
      if (isExistingDisplayOrder) {
        return err({
          message: 'Display order already exists',
          statusCode: 400,
        });
      }

      const questionFieldsMap: Record<string, string[]> = {
        matching: ['leftText', 'rightText', 'correctAnswers'],
        ordering: ['fragmentText', 'exactFragmentText'],
        gap: ['mediaUrl', 'correctAnswer'],
        multiple_choice: ['mediaUrl', 'correctAnswer', 'answers', 'title'],
      };

      const unsetFieldsMultipleChoice: Record<string, string> = {}; // delete mediaUrl or title if empty string

      // check if update typeQuestion
      if (updateQuestionDto.typeQuestion) {
        if (updateQuestionDto.typeQuestion && !questionFieldsMap[updateQuestionDto.typeQuestion]) {
          return err({ message: 'Invalid typeQuestion', statusCode: 400 });
        }

        // remove fields of old typeQuestion
        const unsetFields = questionFieldsMap[hasQuestion.typeQuestion] || [];
        if (unsetFields.length > 0) {
          await this.questionModel.updateOne(
            {
              _id: id,
            },
            {
              $unset: Object.fromEntries(unsetFields.map((item) => [item, ''])),
            },
          );
        }

        // remove invalid fields from DTO
        for (const key of Object.keys(updateQuestionDto)) {
          if (
            !questionFieldsMap[updateQuestionDto.typeQuestion].includes(key) &&
            !['lessonId', 'displayOrder', 'typeQuestion'].includes(key)
          ) {
            delete updateQuestionDto[key];
          }
        }

        // if typeQuestion is MULTIPLE_CHOICE has title or mediaUrl is empty string, unset it

        for (const key of ['mediaUrl', 'title']) {
          if (updateQuestionDto[key] === '') {
            unsetFieldsMultipleChoice[key] = '';
            delete updateQuestionDto[key];
          }
        }
      }

      // process pairId for MATCHING question
      if (updateQuestionDto.typeQuestion === QuestionType.MATCHING) {
        for (let i = 0; i < (updateQuestionDto.leftText as any).length; i++) {
          const pairId = new mongoose.Types.ObjectId();
          (updateQuestionDto.leftText as any)[i] = {
            ...(updateQuestionDto.leftText as any)[i],
            pairId,
          };
          (updateQuestionDto.rightText as any)[i] = {
            ...(updateQuestionDto.rightText as any)[i],
            pairId,
          };
        }
      }
      // end process pairId for MATCHING question

      const updatedQuestion = await this.questionModel.findOneAndUpdate(
        {
          _id: id,
        },
        {
          ...updateQuestionDto,
          ...(Object.keys(unsetFieldsMultipleChoice).length > 0
            ? { $unset: unsetFieldsMultipleChoice }
            : {}),
        },
        { new: true },
      );

      return ok(updatedQuestion as Question);
    } catch (e) {
      return err({
        message: 'Error when updating question',
        statusCode: 500,
        context: updateQuestionDto,
        cause: e,
      });
    }
  }
}
