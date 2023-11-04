```ts
import { Config, Effect } from "effect";
import { Database, createAdaptor } from "../src/bun";

interface Tables {
	users: { id: number };
}

const DBAdaptor = createAdaptor<Tables>();

const db: Effect.Effect<Database<Tables>, never, void> = Effect.gen(function* (_) {
	const { query } = yield* _(DBAdaptor.tag);
	query((db) => db.selectFrom("users"));
});


const layer = DBAdaptor.makeLayer(
	Config.succeed({
		filename: ":memory:"
	})
);

db.pipe(Effect.provide(layer));
```