import "dotenv/config";
import { getNifData } from "../index.js";

const nif = process.env.NIF_REAL;

if (!nif) {
  throw new Error("Defina NIF_REAL no arquivo .env para executar este script.");
}

const data = await getNifData(nif);

console.log(JSON.stringify(data, null, 2));

