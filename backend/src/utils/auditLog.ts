import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const logAudit = async (
  req: AuthRequest,
  action: string,
  tableName: string,
  recordId?: number,
  details?: string
) => {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.user?.id || null,
      action,
      table_name: tableName,
      record_id: recordId || null,
      details: details || null,
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
};
