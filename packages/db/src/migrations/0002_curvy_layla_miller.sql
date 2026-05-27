CREATE TABLE "auth_session" (
	"id" text PRIMARY KEY NOT NULL,
	"principal_type" text NOT NULL,
	"principal_id" text NOT NULL,
	"organization_id" text,
	"ip_address" text,
	"user_agent" text,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_session_principal_idx" ON "auth_session" USING btree ("principal_type","principal_id");--> statement-breakpoint
CREATE INDEX "auth_session_org_idx" ON "auth_session" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "auth_session_expires_idx" ON "auth_session" USING btree ("expires_at");