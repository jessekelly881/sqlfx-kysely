import type * as Statement from "@sqlfx/sql/Statement";
import * as Sql from "@sqlfx/sqlite/bun";
import { Config, Context, Effect, Layer } from "effect";
import type { Compilable, InferResult, Sql as KyselySql } from "kysely";

import {
	CamelCasePlugin,
	DummyDriver,
	Kysely,
	sql as kyselySql,
	SqliteAdapter,
	SqliteIntrospector,
	SqliteQueryCompiler
} from "kysely";

type QueryFn<Tb, T extends Compilable<unknown>> = (
	db: Kysely<Tb>,
	sql: KyselySql
) => T;

type KyselyRowResult<T extends Compilable<unknown>> = InferResult<T>[number];

type Database<Tb> = {
	sql: Sql.SqliteClient;
	query: <T extends Compilable<unknown>>(
		queryFn: QueryFn<Tb, T>
	) => Statement.Statement<KyselyRowResult<T>>;
};

export const createAdaptor = <Tables>(identifier?: string) => {
	const tag = Context.Tag<Database<Tables>>(identifier);

	type Transform = (typeof Transform)[keyof typeof Transform];
	const Transform = {
		CamelCase: "camel_case"
	} as const;

	type DatabaseConfig = Omit<
		Sql.SqliteBunConfig,
		"transformQueryNames" | "transformResultNames"
	> & {
		readonly transform?: Transform;
	};

	const make = (config: DatabaseConfig) =>
		Effect.gen(function* (_) {
			const sql = yield* _(
				Sql.make({
					...config,
					transformQueryNames:
						config.transform === Transform.CamelCase
							? Sql.transform.camelToSnake
							: undefined,
					transformResultNames:
						config.transform === Transform.CamelCase
							? Sql.transform.camelToSnake
							: undefined
				})
			);

			const kyselyPlugins = [];
			if (config.transform === Transform.CamelCase) {
				kyselyPlugins.push(
					new CamelCasePlugin({
						maintainNestedObjectKeys: config.transform
							? false
							: true
					})
				);
			}

			const db = new Kysely<Tables>({
				dialect: {
					createAdapter: () => new SqliteAdapter(),
					createDriver: () => new DummyDriver(),
					createIntrospector: (db) => new SqliteIntrospector(db),
					createQueryCompiler: () => new SqliteQueryCompiler()
				},
				plugins: kyselyPlugins
			});

			const query = <T extends Compilable<unknown>>(
				queryFn: QueryFn<Tables, T>
			) => {
				const { sql: querySql, parameters: queryParameters } = queryFn(
					db,
					kyselySql
				).compile();
				return sql.unsafe<KyselyRowResult<T>>(
					querySql,
					queryParameters as any[]
				);
			};

			return tag.of({
				sql,
				query
			});
		});

	const makeLayer = (config: Config.Config.Wrap<DatabaseConfig>) =>
		Layer.scoped(
			tag,
			Effect.flatMap(Effect.config(Config.unwrap(config)), make)
		);

	return {
		tag,
		makeLayer
	};
};
