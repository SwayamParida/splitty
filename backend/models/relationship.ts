import { strict as assert } from "assert";
import { Schema, Document, Model, model } from "mongoose";
import { User } from "./user.ts";

// TypeScript interfaces
interface RelationshipAttributes {
	friendA: User,
	friendB: User,
	dateAdded: Date,
}
export interface Relationship extends RelationshipAttributes, Document { }
interface RelationshipStatics extends Model<Relationship> {
	findRelationship(userA: User, userB: User): Promise<Relationship>
}

// Schema properties
export const relationshipSchema = new Schema<Relationship>({
	friendA: { type: Schema.Types.ObjectId, ref: "User", required: true },
	friendB: { type: Schema.Types.ObjectId, ref: "User", required: true },
	dateAdded: { type: Schema.Types.Date, required: true },
});

// Schema methods
relationshipSchema.statics.findRelationship = async function (userA: User, userB: User): Promise<Relationship> {
	const abRelationship = await this.findOne({friendA: userA._id, friendB: userB._id});
	const baRelationship = await this.findOne({friendA: userB._id, friendB: userA._id});
	assert (abRelationship || baRelationship);
	return abRelationship ? abRelationship : baRelationship;
};

const RelationshipModel = model<Relationship, RelationshipStatics>("Relationship", relationshipSchema);
export default RelationshipModel;