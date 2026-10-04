import { supabase } from './supabase'

// Fire-and-forget: callers don't await these, and a failure here should
// never block or surface to the visitor. Click tracking is best-effort.

export function trackPublicLinkClick(linkId: string) {
  void supabase.rpc('increment_public_click_by_link_id', { p_link_id: linkId }).then(
    () => {},
    () => {}
  )
}

export function trackDemoClick() {
  void supabase.rpc('increment_public_click_count', { p_slug: 'try_demo' }).then(
    () => {},
    () => {}
  )
}
