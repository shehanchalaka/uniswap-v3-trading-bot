import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const schema = z.object({
  CHAIN_ID: z.coerce.number(),
  WS_RPC_URL: z.string().url(),
  UNISWAP_V3_POOL_ADDRESS: z.string(),
  THRESHOLD_PRICE: z.coerce.number(),
  BUY_BPS_BELOW: z.coerce.number(),
  SELL_BPS_ABOVE: z.coerce.number(),
  PRIVATE_KEY: z.string(),
});

export const env = schema.parse(process.env);
