import { Config, Effect } from "effect";
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

const s = Effect.gen(function* (_) {
	const { query } = yield* _(DBAdaptor.tag);
	query((db) => db.selectFrom("users"));
}).pipe(Effect.provide(layer));
