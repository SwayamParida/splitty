import UserModel, { User } from "../models/user.ts";
import RelationshipModel from "../models/relationship.ts";

async function isUserValid(userId: string): Promise<boolean> {
	const user: User | null = await UserModel.findById(userId);
	return Boolean(user);
}

async function areUsersFriends(userA: User, userB: User): Promise<boolean> {
	return Boolean(await RelationshipModel.findRelationship(userA, userB));
}

export { 
	isUserValid,
	areUsersFriends,
};