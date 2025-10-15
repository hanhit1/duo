import { AppError, CRUDService, ErrorMessage, UpdateTheoryDto } from '@app/constracts';
import { Injectable } from '@nestjs/common';
import { Theory } from '../schema/theory.schema';
import { UnitService } from '../unit/unit.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ok, err, Result } from 'neverthrow';

@Injectable()
export class TheoryService extends CRUDService<Theory> {
  constructor(
    @InjectModel(Theory.name) private readonly theoryModel: Model<Theory>,
    private readonly unitService: UnitService,
  ) {
    super(theoryModel);
  }

  async create(createDto: Partial<Theory>): Promise<Result<Theory, AppError>> {
    try {
      if (createDto.unitId) {
        //check unit
        const hasUnit = this.unitService.findOne({ _id: createDto.unitId });
        if (!hasUnit) {
          return err({
            message: 'UnitId not found',
            statusCode: 400,
          });
        }
        // calculate displayOrder of theory
        if (!createDto.displayOrder) {
          // get theory has max displayOrder in the same unit
          const lastTheory = await this.theoryModel
            .findOne({ unitId: createDto.unitId })
            .sort({ displayOrder: -1 })
            .select({ displayOrder: 1 })
            .lean();

          createDto.displayOrder = lastTheory ? lastTheory.displayOrder + 1 : 1;
        } else {
          const isExistDisplayOrder = await this.theoryModel.findOne({
            unitId: createDto.unitId,
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

      const modelInstance = new this.theoryModel(createDto);
      const createdModel = await modelInstance.save();
      return ok(createdModel.toObject() as Theory);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_CREATING_MODEL,
        statusCode: 500,
        context: createDto,
        cause: e,
      });
    }
  }

  async update(id: string, updateTheoryDto: UpdateTheoryDto): Promise<Result<Theory, AppError>> {
    try {
      const hasTheory = await this.theoryModel.findById(id);
      if (!hasTheory) return err({ message: 'This theory is not exist', statusCode: 404 });

      const targetUnitId = updateTheoryDto.unitId ? updateTheoryDto.unitId : hasTheory.unitId;
      const targetDisplayOrder = Number(
        updateTheoryDto.displayOrder ? updateTheoryDto.displayOrder : hasTheory.displayOrder,
      );
      const hasUnit = await this.unitService.findOne({ _id: targetUnitId });
      if (!hasUnit) return err({ message: 'UnitId not found', statusCode: 400 });

      const isExistingDisplayOrder = await this.theoryModel.findOne({
        unitId: targetUnitId,
        displayOrder: targetDisplayOrder,
        _id: { $ne: id },
      });
      if (isExistingDisplayOrder) {
        return err({
          message: 'Display order already exists',
          statusCode: 400,
        });
      }

      const theoryFieldsMap: Record<string, string[]> = {
        grammar: ['title', 'content', 'example'],
        phrase: ['audio', 'translation', 'phraseText'],
        flashcard: ['audio', 'translation', 'term', 'image', 'ipa', 'partOfSpeech'],
      };

      // check if update typeTheory
      if (updateTheoryDto.typeTheory && updateTheoryDto.typeTheory !== hasTheory.typeTheory) {
        if (updateTheoryDto.typeTheory && !theoryFieldsMap[updateTheoryDto.typeTheory]) {
          return err({ message: 'Invalid typeTheory', statusCode: 400 });
        }

        // remove fields of old typeTheory
        const unsetFields = theoryFieldsMap[hasTheory.typeTheory] || [];
        if (unsetFields.length > 0) {
          await this.theoryModel.updateOne(
            {
              _id: id,
            },
            {
              $unset: Object.fromEntries(unsetFields.map((item) => [item, ''])),
            },
          );
        }

        // remove invalid fields from DTO
        for (const key of Object.keys(updateTheoryDto)) {
          if (
            !theoryFieldsMap[updateTheoryDto.typeTheory].includes(key) &&
            !['unitId', 'displayOrder', 'typeTheory'].includes(key)
          ) {
            delete updateTheoryDto[key];
          }
        }
      }

      const updatedTheory = await this.theoryModel.findOneAndUpdate(
        {
          _id: id,
        },
        { ...updateTheoryDto },
        { new: true },
      );

      return ok(updatedTheory as Theory);
    } catch (e) {
      return err({
        message: 'Error when updating theory',
        statusCode: 500,
        context: updateTheoryDto,
        cause: e,
      });
    }
  }
}
