import { Burn, Mint } from '../generated/UniswapV2Pair/UniswapV2Pair';
import { User } from '../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleMint(event: Mint): void {
	let user = User.load(event.transaction.from.toHex());
	if (user == null) {
		user = newUser(event.params.sender.toHex(), event.params.sender.toHex());
	}
	user.daiBalance = user.daiBalance.plus(event.params.amount0);
	user.debaseBalance = user.debaseBalance.plus(event.params.amount1);
	user.transactionCount = user.transactionCount + 1;
	user.save();
}

export function handleBurn(event: Burn): void {
	let user = User.load(event.transaction.from.toHex());
	if (user == null) {
		user = newUser(event.transaction.from.toHex(), event.transaction.from.toHex());
	}

	let newDaiBalance = user.daiBalance.minus(event.params.amount0);
	let newDebaseBalance = user.debaseBalance.minus(event.params.amount1);

	if (newDaiBalance.lt(BigInt.fromI32(0))) {
		user.daiBalance = BigInt.fromI32(0);
	} else {
		user.daiBalance = newDaiBalance;
	}

	if (newDebaseBalance.lt(BigInt.fromI32(0))) {
		user.debaseBalance = BigInt.fromI32(0);
	} else {
		user.debaseBalance = newDebaseBalance;
	}

	user.transactionCount = user.transactionCount + 1;
	user.save();
}

function newUser(id: string, address: string): User {
	let user = new User(id);
	user.address = address;
	user.daiBalance = BigInt.fromI32(0);
	user.debaseBalance = BigInt.fromI32(0);
	user.transactionCount = 0;
	return user;
}
