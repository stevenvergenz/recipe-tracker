/**
 * Base class for all 
 */
export default abstract class DbModel
{
	public id: number;

	protected constructor(id: number)
	{
		this.id = id;
	}

	public abstract save(): Promise<void>;
}
