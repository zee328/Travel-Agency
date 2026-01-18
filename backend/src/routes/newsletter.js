import { Router } from 'express';
import { supabase, requireSupabase } from '../lib/supabase.js';
import { addNewsletterEmail } from '../lib/devStore.js';

const router = Router();

router.post('/', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // If Supabase is configured, use it; otherwise fallback to local dev store
  if (supabase && requireSupabase(res)) {
    const { error } = await supabase
      .from('newsletter')
      .insert([{ email }]);

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Already subscribed' });
      }
      return res.status(500).json({ error: 'Failed to subscribe' });
    }
    return res.status(201).json({ success: true });
  }

  // Dev fallback (file-based storage)
  try {
    const result = await addNewsletterEmail(email);
    if (!result.ok && result.status === 409) {
      return res.status(409).json({ error: 'Already subscribed' });
    }
    return res.status(201).json({ success: true, dev: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
});

export default router;
