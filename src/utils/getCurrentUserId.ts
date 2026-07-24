/**
 * Utility function to get the current authenticated employee/user ID
 * Tries multiple methods to retrieve the ID
 */
export function getCurrentUserId(): string | null {
  // Method 1: Try to get from localStorage (stored during login)
  const storedEmployee = localStorage.getItem('employee');
  if (storedEmployee) {
    try {
      const employee = JSON.parse(storedEmployee);
      if (employee?.id) {
        return employee.id;
      }
    } catch (e) {
      console.error('Failed to parse employee from localStorage:', e);
    }
  }

  // Method 2: Try to decode JWT token to get employee ID
  const token = localStorage.getItem('accessToken');
  if (token) {
    try {
      // JWT token structure: header.payload.signature
      const parts = token.split('.');
      if (parts.length === 3) {
        // Decode the payload (second part)
        const payload = JSON.parse(atob(parts[1]));
        
        // Try different possible fields for employee ID
        if (payload.employeeId) {
          return payload.employeeId;
        }
        if (payload.employee?.id) {
          return payload.employee.id;
        }
        if (payload.id) {
          return payload.id;
        }
        if (payload.sub) {
          return payload.sub;
        }
        if (payload.userId) {
          return payload.userId;
        }
      }
    } catch (e) {
      console.error('Failed to decode JWT token:', e);
    }
  }

  return null;
}
