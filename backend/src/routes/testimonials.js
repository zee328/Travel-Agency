import { Router } from 'express';
import { supabase, requireSupabase } from '../lib/supabase.js';

const router = Router();

router.get('/', async (_req, res) => {
  if (!requireSupabase(res)) return;
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Failed to fetch testimonials' });
  res.json(data || []);
});

router.post('/', async (req, res) => {
  if (!requireSupabase(res)) return;
  const { name, rating, comment = '' } = req.body;
  if (!name || !rating) return res.status(400).json({ error: 'Name and rating are required' });

  const { data, error } = await supabase
    .from('testimonials')
    .insert([{ name, rating, comment }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to create testimonial' });
  res.status(201).json(data);
});

export default router;
