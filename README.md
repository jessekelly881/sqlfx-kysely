```ts
import { Config, Effect } from "effect";
import { Database, createAdaptor } from "sqlfx-kysely/dist/bun";

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

## Defining a table

```ts
import { Schema } from "@effect/schema";
import { GeneratedAlways, Insertable, Selectable, Updateable } from "kysely";

// User
const Base = Schema.struct({
	firstName: Schema.string,
	lastName: Schema.string,
});

export interface Table extends Schema.Schema.To<typeof Base> {
	id: GeneratedAlways<number>;
}

export type SelectSchema = Selectable<Table>;
export const SelectSchema: Schema.Schema<SelectSchema> = Base.pipe(
	Schema.extend(
		Schema.struct({
			id: Schema.number
		})
	)
);

export type InsertSchema = Insertable<Table>;
export const InsertSchema: Schema.Schema<InsertSchema> = Base;

export type UpdateSchema = Updateable<Table>;
export const UpdateSchema: Schema.Schema<UpdateSchema> = Base.pipe(
	Schema.partial
);
```