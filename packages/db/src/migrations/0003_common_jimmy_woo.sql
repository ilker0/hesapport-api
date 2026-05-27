CREATE TABLE "org_user_role" (
	"id" text PRIMARY KEY NOT NULL,
	"org_user_id" text NOT NULL,
	"role_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "org_user" DROP CONSTRAINT "org_user_role_id_organization_role_id_fk";
--> statement-breakpoint
ALTER TABLE "org_user_role" ADD CONSTRAINT "org_user_role_org_user_id_org_user_id_fk" FOREIGN KEY ("org_user_id") REFERENCES "public"."org_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_user_role" ADD CONSTRAINT "org_user_role_role_id_organization_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."organization_role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "org_user_role_user_role_uidx" ON "org_user_role" USING btree ("org_user_id","role_id");--> statement-breakpoint
CREATE INDEX "org_user_role_user_idx" ON "org_user_role" USING btree ("org_user_id");--> statement-breakpoint
CREATE INDEX "org_user_role_role_idx" ON "org_user_role" USING btree ("role_id");--> statement-breakpoint
ALTER TABLE "org_user" DROP COLUMN "role_id";