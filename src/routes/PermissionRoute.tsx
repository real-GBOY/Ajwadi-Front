import { ReactNode } from 'react';
import { usePermissions } from '../contexts/PermissionContext';
import UnauthorizedPage from '../pages/UnauthorizedPage';

interface PermissionRouteProps {
  children: ReactNode;
  permission: string;
}

export default function PermissionRoute({ children, permission }: PermissionRouteProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
}
