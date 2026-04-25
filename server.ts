import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { kv } from "@vercel/kv";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "inventory.json");

const DEFAULT_CATEGORIES = [
  { name: 'Diapers', icon: 'Droplets', color: 'sky-400', borderColor: 'sky-100', shadowColor: 'sky-50' },
  { name: 'Feeding', icon: 'Heart', color: 'pink-400', borderColor: 'pink-100', shadowColor: 'pink-50' },
  { name: 'Clothing', icon: 'Shirt', color: 'amber-400', borderColor: 'amber-100', shadowColor: 'amber-50' },
  { name: 'Health', icon: 'Stethoscope', color: 'emerald-400', borderColor: 'emerald-100', shadowColor: 'emerald-50' },
  { name: 'Gear', icon: 'Package', color: 'indigo-500', borderColor: 'indigo-100', shadowColor: 'indigo-50' },
  { name: 'Other', icon: 'MoreHorizontal', color: 'slate-400', borderColor: 'slate-100', shadowColor: 'slate-50' },
];

// Determine if we are using Vercel KV (Production) or Local File (Dev)
const isVercel = !!process.env.KV_REST_API_URL;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const readData = async () => {
    if (isVercel) {
      try {
        const data = await kv.get("chotu_mottu_data");
        if (data) return data;
      } catch (e) {
        console.error("KV Read Error:", e);
      }
      return { items: [], categories: DEFAULT_CATEGORIES, feedingLogs: [] };
    }

    try {
      const data = await fs.readFile(DATA_FILE, "utf-8");
      const parsed = JSON.parse(data);
      return {
        items: parsed.items || [],
        categories: parsed.categories || DEFAULT_CATEGORIES,
        feedingLogs: parsed.feedingLogs || []
      };
    } catch {
      return { items: [], categories: DEFAULT_CATEGORIES, feedingLogs: [] };
    }
  };

  const saveData = async (data: any) => {
    if (isVercel) {
      try {
        await kv.set("chotu_mottu_data", data);
        return;
      } catch (e) {
        console.error("KV Save Error:", e);
      }
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  };

  // API Routes
  app.get("/api/data", async (req, res) => {
    const data = await readData();
    res.json(data);
  });

  app.post("/api/data", async (req, res) => {
    await saveData(req.body);
    res.json({ status: "success" });
  });

  // Export for Vercel
  if (process.env.NODE_ENV === "production" || isVercel) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  // Only listen if not in a Vercel-like environment (Vercel uses the exported handler)
  if (!isVercel) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  return app;
}

export default startServer();
