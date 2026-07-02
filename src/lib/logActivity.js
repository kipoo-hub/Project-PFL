import { supabase } from './supabase';

/**
 * Log an activity to activity_logs table in Supabase.
 * @param {string} action - The action description (e.g., 'Mengambil antrian', 'Mengirim chat')
 * @param {Object} [metadata={}] - Optional metadata for the log
 * @param {string} [actorTypeOverride] - Force actor_type ('guest', 'member', 'admin'). If omitted, automatically determined by auth session.
 */
export async function logActivity(action, metadata = {}, actorTypeOverride = null) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    let actorType = actorTypeOverride || 'guest';
    let actorId = null;

    if (session?.user) {
      actorId = session.user.id;
      actorType = session.user.user_metadata?.role || 'member';
      
      // If role is not in user_metadata, try to query it from profiles table
      if (!session.user.user_metadata?.role) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', actorId)
          .single();
        if (profile?.role) {
          actorType = profile.role;
        }
      }
    }

    const { error } = await supabase
      .from('activity_logs')
      .insert([{
        actor_type: actorType,
        actor_id: actorId,
        action,
        metadata
      }]);

    if (error) {
      console.error('Error inserting activity log:', error);
    }
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}
