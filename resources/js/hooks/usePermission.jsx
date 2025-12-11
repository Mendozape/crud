// src/hooks/usePermission.js

import { useMemo } from 'react';

/**
 * Custom hook to check user permissions based on the data loaded from Laravel/Spatie.
 * It provides a reusable 'can' function similar to Laravel's authorization method.
 * * We assume the 'user' object comes from window.Laravel.user 
 * and contains a 'permissions' property which is an ARRAY of permission names (strings).
 */
const usePermission = (user) => {

    // 1. Memoize the list of permissions to optimize performance.
    // This recalculates only when the 'user' object changes.
    const permissions = useMemo(() => {
        // Ensure 'permissions' is an array (even if null or undefined)
        // This prevents errors when trying to call .includes() later.
        return user?.permissions || []; 
    }, [user]);

    /**
     * Checks if the authenticated user has a specific permission or any of a list of permissions.
     * * @param {string | string[]} requiredPermission - The name of the required permission (or an array of permissions).
     * @returns {boolean} - true if the user has the permission(s), false otherwise.
     */
    const can = (requiredPermission) => {
        // If the user object is not available (not authenticated), deny access.
        if (!user) {
            return false;
        }

        // --- Handle Single Permission (string) ---
        if (typeof requiredPermission === 'string') {
            // Check if the permission exists in the user's memoized permissions array.
            return permissions.includes(requiredPermission);
        }

        // --- Handle Multiple Permissions (array - OR logic) ---
        if (Array.isArray(requiredPermission)) {
            // Use the 'some' method to check if the user has AT LEAST ONE of the required permissions.
            // This replicates the '|' (OR) logic often used in Laravel/Spatie middlewares.
            return requiredPermission.some(permission => permissions.includes(permission));
        }

        // Default return for invalid input
        return false;
    };

    // Return the authorization checking function and the user object itself
    return { can, user };
};

export default usePermission;