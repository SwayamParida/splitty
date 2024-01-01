import { strict as assert } from "assert";
import { Schema, Document, Model, model } from "mongoose";
import { Money } from "ts-money";
import { User } from "./user.ts";
import TransactionModel, { Transaction } from "./transaction.ts";

// TypeScript interfaces
interface RelationshipAttributes {
	friendA: User,
	friendB: User,
	dateAdded: Date,
}
export interface Relationship extends RelationshipAttributes, Document { 
	getTransactions(): Promise<Transaction[]>,
	getBalance(): Promise<Money>
}
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
relationshipSchema.methods.getTransactions = async function (): Promise<Transaction[]> {
	const relationship: Relationship = await RelationshipModel.findRelationship(this.friendA, this.friendB);
	return await TransactionModel
		.find({relationship: relationship._id})
		.select("-__v")
		.populate("debtor creditor poster", "-__v");
};
relationshipSchema.methods.getBalance = async function(): Promise<Money> {
	const transactions: Transaction[] = await this.getTransactions();
	const sumMoneyReducer = (accumulator: Money, curTransaction: Transaction): Money => {
		return accumulator.add(curTransaction.amount);
	};
	const amountReceivable: Money = transactions
		.filter((transaction: Transaction): boolean => transaction.creditor.equals(this.friendA))
		.reduce<Money>(sumMoneyReducer, new Money(0, "USD"));
	const amountPayable: Money = transactions
		.filter((transaction: Transaction): boolean => transaction.debtor.equals(this.friendA))
		.reduce<Money>(sumMoneyReducer, new Money(0, "USD"));
	return amountReceivable.subtract(amountPayable);
};

// Static functions
relationshipSchema.statics.findRelationship = async function (userA: User, userB: User): Promise<Relationship> {
	const abRelationship: Relationship | undefined = await this.findOne({friendA: userA._id, friendB: userB._id}, "-__v");
	const baRelationship: Relationship | undefined = await this.findOne({friendA: userB._id, friendB: userA._id}, "-__v");
	if (abRelationship) return abRelationship;
	assert(baRelationship);
	return baRelationship;
};

const RelationshipModel = model<Relationship, RelationshipStatics>("Relationship", relationshipSchema);
export default RelationshipModel;