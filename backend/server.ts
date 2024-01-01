// Library imports
import { strict as assert } from "assert";
import express, { Express, Request, Response } from "express";
import { connect } from "mongoose";

// Application models
import UserModel, { User } from "./models/user.ts";
import RelationshipModel, { Relationship } from "./models/relationship.ts";
import TransactionModel, { Transaction } from "./models/transaction.ts";

// Application services
import * as validation from "./services/validation.ts";

// DB connection details
const port: number = 9000;
const dbConnectionString: string = "mongodb+srv://splitty.qqepqpo.mongodb.net/splitty?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority";
const dbConnectionCredentials: string = "config/mongodb_user_cert.pem";

// Express configuration
const app: Express = express();
app.use(express.json());

app.get("/users", async (req: Request, res: Response) => {
	const users: User[] = await UserModel.find({});
	res.status(200).send(users);
});

app.post("/users", async (req: Request, res: Response) => {
	let newUser = new UserModel(req.body);
	newUser = await newUser.save();
	res.status(201).send({userId: newUser._id});
});

app.get("/users/:userId/friends", async (req: Request, res: Response) => {
	const { userId } = req.params;
	// Validate that user exists
	if (!await validation.isUserValid(userId)) {
		res.status(400).send("Specified user does not exist");
		return;
	}
	
	// Fetch all friendships involving user
	const user = await UserModel.findById(userId);
	const friends: User[] | undefined = await user?.getFriends();
	res.status(200).send(friends);
});

app.get("/users/:userId/friends/:friendUserId", async (req: Request, res: Response) => {
	const { userId, friendUserId } = req.params;
	// Validate that both users exist
	const isUserValid: boolean = await validation.isUserValid(userId);
	const isFriendValid: boolean = await validation.isUserValid(friendUserId);
	if (!isUserValid || !isFriendValid) {
		res.status(400).send("User IDs specified are invalid");
		return;
	}

	// Validate that users are already friends
	const userA: User | null = await UserModel.findById(userId);
	const userB: User | null = await UserModel.findById(friendUserId);
	assert(userA && userB);
	if (!await validation.areUsersFriends(userA, userB)) {
		res.status(400).send("Users are not friends");
		return;
	}

	// Retrieve relationship details
	const relationshipDetails: Relationship = await RelationshipModel.findRelationship(userA, userB);
	const balance = await relationshipDetails.getBalance();
	res.status(200).send({
		...relationshipDetails.toObject(),
		balance: `${balance.getCurrencyInfo().symbol}${balance.toString()}`
	});
});

app.post("/users/:userId/friends/:friendUserId", async (req: Request, res: Response) => {
	const { userId, friendUserId } = req.params;
	// Validate that both users exist
	const isUserValid: boolean = await validation.isUserValid(userId);
	const isFriendValid: boolean = await validation.isUserValid(friendUserId);
	if (!isUserValid || !isFriendValid) {
		res.status(400).send("User IDs specified are invalid");
		return;
	}

	// Validate that users aren't already friends
	const userA: User | null = await UserModel.findById(userId);
	const userB: User | null = await UserModel.findById(friendUserId);
	assert(userA && userB);
	if (await validation.areUsersFriends(userA, userB)) {
		res.status(400).send("Specified users are already friends");
		return;
	}

	// Record relationship in DB
	const newRelationship: Relationship = new RelationshipModel({
		friendA: userA,
		friendB: userB,
		dateAdded: new Date(),
	});
	await newRelationship.save();
	res.status(201).send();
});

app.get("/users/:userId/friends/:friendUserId/transactions", async (req: Request, res: Response) => {
	const { userId, friendUserId } = req.params;

	// Validate that both users exist
	const isUserValid: boolean = await validation.isUserValid(userId);
	const isFriendValid: boolean = await validation.isUserValid(friendUserId);
	if (!isUserValid || !isFriendValid) {
		res.status(400).send("User IDs specified are invalid");
		return;
	}

	// Validate that users are friends
	const userA: User | null = await UserModel.findById(userId);
	const userB: User | null = await UserModel.findById(friendUserId);
	assert(userA && userB);
	if (!await validation.areUsersFriends(userA, userB)) {
		res.status(400).send("Specified users must be friends before they can have transactions");
		return;
	}

	// Fetch transactions from DB
	const relationship: Relationship = await RelationshipModel.findRelationship(userA, userB);
	res.status(200).send(await relationship.getTransactions());
});

app.post("/users/:userId/friends/:friendUserId/transactions", async (req: Request, res: Response) => {
	const { userId, friendUserId } = req.params;
	const { amount, dateTransacted, memo } = req.body;

	// Validate that both users exist
	const isUserValid: boolean = await validation.isUserValid(userId);
	const isFriendValid: boolean = await validation.isUserValid(friendUserId);
	if (!isUserValid || !isFriendValid) {
		res.status(400).send("User IDs specified are invalid");
		return;
	}

	// Validate that users are friends
	const userA: User | null = await UserModel.findById(userId);
	const userB: User | null = await UserModel.findById(friendUserId);
	assert(userA && userB);
	if (!await validation.areUsersFriends(userA, userB)) {
		res.status(400).send("Specified users must be friends to transact");
		return;
	}

	// Record transaction in DB
	const newTransaction: Transaction = new TransactionModel({
		relationship: (await RelationshipModel.findRelationship(userA, userB))._id,
		creditor: userA._id,
		debtor: userB._id,
		poster: userA._id,
		amount: amount,
		dateAdded: new Date(),
		dateLastEdited: new Date(),
		dateTransacted: dateTransacted,
		memo: memo
	});
	await newTransaction.save();
	res.status(201).send();
});

// Initialize DB connection and Express server
connect(dbConnectionString, {tlsCertificateKeyFile: dbConnectionCredentials})
	.then(
		() => {
			app.listen(port, () => {
				console.log(`Splitty REST API available on port ${port}`);
			});
		},
		(reason) => {
			console.error(reason);
		}
	);