import {sqliteTable,integer,text} from 'drizzle-orm/sqlite-core';
export const tripState=sqliteTable('trip_state',{id:integer('id').primaryKey(),body:text('body').notNull(),revision:integer('revision').notNull().default(0),updated:text('updated').notNull()});
