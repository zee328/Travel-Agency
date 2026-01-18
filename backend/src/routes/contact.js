import { Router } from 'express';
import { supabase, requireSupabase } from '../lib/supabase.js';

const router = Router();

router.post('/', async (req, res) => {
  if (!requireSupabase(res)) return;
  const { name, email, phone = '', destination = '', message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const { error } = await supabase
    .from('contact_messages')
    .insert([{ name, email, phone, destination, message }]);

  if (error) {
    return res.status(500).json({ error: 'Failed to send message' });
  }

  res.status(201).json({ success: true });
});

export default router;
