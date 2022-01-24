export interface UserLike {
	id: number;
	email: string;
	password: Buffer;
	salt: string;
	name: string;
	lastLogin: Date;
};
