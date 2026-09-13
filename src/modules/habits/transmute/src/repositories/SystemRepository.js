import { supabase } from '../lib/supabase';

export const SystemRepository = {
  async reportBug(userId, description, context = {}) {
    const { data, error } = await supabase
      .from('bug_reports')
      .insert([{ 
        user_id: userId, 
        description, 
        context: {
          ...context,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      }])
      .select();

    if (error) throw error;
    return data[0];
  },

  async initializeApp(userId) {
    const { data: habits } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (!habits || habits.length === 0) {
      await supabase.from('habits').insert([
        { 
          user_id: userId, 
          name: 'Meditación Matutina', 
          icon: 'sparkles', 
          description: 'Alinear la voluntad antes del alba.',
          area: 'Mental',
          method: '10 min de silencio'
        }
      ]);
      return true; 
    }
    return false;
  }
};
