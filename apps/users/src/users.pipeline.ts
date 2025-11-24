import { PipelineStage } from 'mongoose';

export const rankingPipeline = (filter: any): PipelineStage[] => {
  const pipeline = [
    {
      $match: filter,
    },
    {
      $setWindowFields: {
        sortBy: { experiencePoint: -1 } as Record<string, 1 | -1>,
        output: {
          rank: {
            $denseRank: {},
          },
        },
      },
    },
    {
      $project: {
        rank: 1,
        fullName: 1,
        avatarImage: 1,
        experiencePoint: 1,
      },
    },
  ];
  return pipeline;
};
