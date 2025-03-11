import type { Config, Context } from "@netlify/edge-functions";
import { env } from "process";

export default async (request: Request, context: Context) => {

    const myImportantVariable = env.MY_IMPORTANT_VARIABLE;

    return new Response(JSON.stringify({ message: myImportantVariable}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });

    
};

export const config: Config = {
  path: "/",
};
