import { JoinMode, Sport } from '@prisma/client';
import { z } from 'zod';

export enum SportModel {
  ROAD_CYCLING = 'ROAD_CYCLING',
  ROAD_MOUNTAIN = 'ROAD_MOUNTAIN',
  RUNNING = 'RUNNING',
  TRAIL = 'TRAIL',
}

export const SportSchema = z.nativeEnum(Sport);

export const groupTypeEnum = z.enum([
  JoinMode.INVITATION,
  JoinMode.PRIVATE,
  JoinMode.PUBLIC,
]);

export const sportPracticedEnum = z.array(SportSchema);
