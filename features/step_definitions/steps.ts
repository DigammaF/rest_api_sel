import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'expect';

class Adder {
	private accumulator: number = 0;

	add(n: number): number {
		this.accumulator += n;
		return this.accumulator;
	}

	getAccumulator(): number {
		return this.accumulator;
	}
}

let adder: Adder;

Given('adder is empty', function () {
  adder = new Adder();
});

When('{int} is added', function (n: number) {
  adder.add(n);
});

Then('accumulator should be {int}', function (n: number) {
  expect(adder.getAccumulator()).toBe(n);
});
