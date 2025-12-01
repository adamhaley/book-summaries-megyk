import { Redirect } from 'expo-router';

/**
 * Dashboard index route
 * Redirects to library page (default dashboard view)
 */
export default function DashboardIndex() {
  return <Redirect href="/dashboard/library" />;
}
