import * as v from "valibot";

export const wsMessageSchema = v.object({
  STABLE: v.boolean(),
  // number?
  INT: v.optional(v.number()),
  ACC: v.optional(
    v.object({
      X: v.number(),
      Y: v.number(),
      Z: v.number(),
    })
  ),
});

export type WsMessage = v.InferOutput<typeof wsMessageSchema>;
