import { Router } from 'express';
import { supabase, requireSupabase } from '../lib/supabase.js';

const router = Router();

router.post('/', async (req, res) => {
  if (!requireSupabase(res)) return;
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const { error } = await supabase
    .from('newsletter')
    .insert([{ email }]);

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Already subscribed' });
    }
    return res.status(500).json({ error: 'Failed to subscribe' });
  }

  res.status(201).json({ success: true });
});

export default router;
