import { Schema, Document, Types, model } from "mongoose";

export interface Relationship extends Document {
	friendA: Types.ObjectId,
	friendB: Types.ObjectId,
}

export const relationshipSchema = new Schema<Relationship>({
	friendA: { type: Schema.Types.ObjectId, required: true },
	friendB: { type: Schema.Types.ObjectId, required: true },
});

const RelationshipModel = model<Relationship>("Relationship", relationshipSchema);
export default RelationshipModel;