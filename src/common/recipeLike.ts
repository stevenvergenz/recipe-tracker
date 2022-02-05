import { UserLike } from ".";

export interface RecipePreview
{
	id: number;
	name: string;
	tags: string[];
}

export interface RecipeLike extends RecipePreview
{
	ownerId: number;
	owner?: UserLike;
	body: string;
	thumbnailId: string;
	createdOn: Date;
	updatedOn: Date;
}
