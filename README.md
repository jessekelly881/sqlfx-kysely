```ts
import { createAdaptor } from "sqlfx-kysley/bun"

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
```