import { Router } from 'express';
import { supabase, requireSupabase } from '../lib/supabase.js';

const router = Router();

router.get('/', async (_req, res) => {
  if (!requireSupabase(res)) return;
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Failed to fetch destinations' });
  res.json(data || []);
});

router.post('/', async (req, res) => {
  if (!requireSupabase(res)) return;
  const { name, description = '', price = null, region = '', imageUrl = '', country = '' } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const { data, error } = await supabase
    .from('destinations')
    .insert([{ name, description, price, region, image_url: imageUrl, country }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to create destination' });
  res.status(201).json(data);
});

export default router;
