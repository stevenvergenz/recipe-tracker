import { Client } from 'pg';

/**
 * Base class for all database models
 */
export interface DatabaseModel
{
	create(client: Client): Promise<void>;
	read(client: Client): Promise<void>;
	update(client: Client): Promise<void>;
	delete(client: Client): Promise<void>;
}
