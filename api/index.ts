import express from "express";
import path from "path";
import fs from "fs/promises";
import { kv } from "@vercel/kv";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const DEFAULT_CATEGORIES = [
  { name: 'Diapers', icon: 'Droplets', color: 'sky-400', borderColor: 'sky-100', shadowColor: 'sky-50' },
  { name: 'Feeding', icon: 'Heart', color: 'pink-400', borderColor: 'pink-100', shadowColor: 'pink-50' },
  { name: 'Clothing', icon: 'Shirt', color: 'amber-400', borderColor: 'amber-100', shadowColor: 'amber-50' },
  { name: 'Health', icon: 'Stethoscope', color: 'emerald-400', borderColor: 'emerald-100', shadowColor: 'emerald-50' },
  { name: 'Gear', icon: 'Package', color: 'indigo-500', borderColor: 'indigo-100', shadowColor: 'indigo-50' },
  { name: 'Other', icon: 'MoreHorizontal', color: 'slate-400', borderColor: 'slate-100', shadowColor: 'slate-50' },
];

const isVercel = !!process.env.KV_REST_API_URL;

const readData = async () => {
  if (isVercel) {
    try {
      const data = await kv.get("chotu_mottu_data");
      if (data) return data;
    } catch (e) {
      console.error("KV Read Error:", e);
    }
  }
  return { items: [], categories: DEFAULT_CATEGORIES, feedingLogs: [] };
};

const saveData = async (data: any) => {
  if (isVercel) {
    try {
      await kv.set("chotu_mottu_data", data);
    } catch (e) {
      console.error("KV Save Error:", e);
    }
  }
};

app.get("/api/data", async (req, res) => {
  const data = await readData();
  res.json(data);
});

app.post("/api/data", async (req, res) => {
  await saveData(req.body);
  res.json({ status: "success" });
});

export default app;
