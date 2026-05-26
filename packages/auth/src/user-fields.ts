/**
 * Better Auth user additional fields — must match Drizzle `user` columns.
 * @see https://better-auth.com/docs/concepts/typescript#additional-fields
 */
export const authUserAdditionalFields = {
  businessName: {
    type: "string",
    required: false,
    input: true,
  },
} as const;
