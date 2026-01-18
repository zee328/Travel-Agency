import { Router } from 'express';
import { supabase, requireSupabase } from '../lib/supabase.js';

const router = Router();

// Fallback testimonials for development
const fallbackTestimonials = [
  { 
    id: 1,
    name: 'Ava L.', 
    rating: 5, 
    comment: 'Seamless booking and amazing support. The Europe trip was unforgettable!',
    created_at: new Date().toISOString()
  },
  { 
    id: 2,
    name: 'Noah R.', 
    rating: 5, 
    comment: 'Loved the beach escape package—great resorts and activities.',
    created_at: new Date().toISOString()
  },
  { 
    id: 3,
    name: 'Mia K.', 
    rating: 4, 
    comment: 'Asia Adventure was well organized. Guides were friendly and knowledgeable.',
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'James T.',
    rating: 5,
    comment: 'Exceeded all expectations! zee trivago made our honeymoon absolutely perfect.',
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Sophie M.',
    rating: 5,
    comment: 'Best travel agency ever! Professional, friendly, and great pricing.',
    created_at: new Date().toISOString()
  }
];

router.get('/', async (_req, res) => {
  // If Supabase is not configured, return fallback testimonials
  if (!supabase) {
    return res.json(fallbackTestimonials);
  }

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // On error, also return fallback testimonials to keep UI alive
    console.warn('Testimonials fetch error:', error);
    return res.json(fallbackTestimonials);
  }
  
  res.json(data && data.length > 0 ? data : fallbackTestimonials);
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
