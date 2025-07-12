// filepath: supabase-api/index.ts
import express from 'express';
import { supabase, updateResponses } from './supabaseClient';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

app.post('/supabase/updateResponses', async (req, res) => {
  const { userId, responses } = req.body;
  const result = await updateResponses(userId, responses);
  res.json(result);
});

app.listen(4000, () => console.log('Supabase API running on port 4000'));