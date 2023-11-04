import { Config, Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAdaptor } from "../src/bun";

interface Tables {
	users: { id: number };
}

const DBAdaptor = createAdaptor<Tables>();
const layer = DBAdaptor.makeLayer(
	Config.succeed({
		filename: ":memory:"
	})
);

Effect.gen(function* (_) {
	const { query } = yield* _(DBAdaptor.tag);
	query((db) => db.selectFrom("users"));
}).pipe(Effect.provide(layer));

describe("", () => {
	it("", () => expect(1).toBe(1));
});
