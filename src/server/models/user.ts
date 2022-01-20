import DbModel from './dbModel';

export type UserLike = {
	name?: string;
	email?: string;
	password?: Buffer;
	salt?: string;
	lastLogin?: Date;
};

export class UserModel extends DbModel
{
	private data: UserLike;

	protected constructor(id: number, data?: UserLike) {
		super(id);
		this.data = data;
	}

	public async save(): Promise<void> {

	}

	public async load(id: number): Promise<UserModel> {
		return new UserModel(id);
	}
}
