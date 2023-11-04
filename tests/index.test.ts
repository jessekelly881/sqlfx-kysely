import { Config, Effect } from "effect";
import { Database, createAdaptor } from "../src/bun";

interface Tables {
	users: { id: number };
}

const Database = createAdaptor<Tables>();

const db: Effect.Effect<Database<Tables>, never, void> = Effect.gen(function* (
	_
) {
	const { query } = yield* _(Database.tag);
	query((db) => db.selectFrom("users"));
});

const layer = Database.makeLayer(
	Config.succeed({
		filename: ":memory:"
	})
);

db.pipe(Effect.provide(layer));
