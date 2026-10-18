CREATE TABLE "articles" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"body" text NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"source" text NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"guest_label" text NOT NULL,
	"room" text DEFAULT '' NOT NULL,
	"topic" text NOT NULL,
	"status" text NOT NULL,
	"escalated" boolean DEFAULT false NOT NULL,
	"last_message_preview" text DEFAULT '' NOT NULL,
	"guest_token_hash" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"grounded" boolean DEFAULT false NOT NULL,
	"sample" boolean DEFAULT false NOT NULL,
	"citations" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"check_in" text DEFAULT '3:00 PM' NOT NULL,
	"check_out" text DEFAULT '11:00 AM' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"rooms" jsonb NOT NULL,
	"amenities" jsonb NOT NULL,
	"policies" jsonb NOT NULL,
	"recommendations" jsonb NOT NULL,
	"setup_complete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"conversation_id" text,
	"type" text NOT NULL,
	"room" text DEFAULT '' NOT NULL,
	"guest_label" text DEFAULT '' NOT NULL,
	"summary" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "articles_property_idx" ON "articles" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "conversations_property_idx" ON "conversations" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "properties_owner_idx" ON "properties" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "properties_slug_idx" ON "properties" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tickets_property_idx" ON "tickets" USING btree ("property_id");