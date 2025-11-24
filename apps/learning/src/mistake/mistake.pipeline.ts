import mongoose, { PipelineStage } from 'mongoose';

export const pipelineGetMistakeByUser = (userId: string): PipelineStage[] => {
  const pipeline = [
    {
      $match: { userId: new mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: '$unitId',
        questionIds: { $push: '$questionId' },
      },
    },
    {
      $lookup: {
        from: 'units',
        localField: '_id',
        foreignField: '_id',
        as: 'unitDetail',
      },
    },
    {
      $lookup: {
        from: 'questions',
        localField: 'questionIds',
        foreignField: '_id',
        as: 'questions',
      },
    },
    {
      $addFields: {
        unit: '$unitDetail',
      },
    },
    {
      $project: {
        _id: 0,
        questionIds: 0,
        unitDetail: 0,
      },
    },
  ];
  return pipeline;
};
