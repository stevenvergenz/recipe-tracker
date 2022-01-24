export * from './dbModel';
export * from './user';

import { Pool } from 'pg';
export const dbPool = new Pool();
