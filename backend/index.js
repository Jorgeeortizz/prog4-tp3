import express from "express";

import { testConnection } from "./db";

const app = express();
const port = process.env.PORT || 3000;



app.listen(PORT, () => {
  console.log(`puerto http://localhost:${PORT} funcionando`);
  testConnection();
});