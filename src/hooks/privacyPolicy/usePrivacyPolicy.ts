/** @format */

import { useListPrivacyPolicies, useGetPrivacyPolicyById } from './privacyPolicy.queries';
import {
   useCreatePrivacyPolicy,
   useUpdatePrivacyPolicy,
   useDeletePrivacyPolicy,
} from './privacyPolicy.mutations';

export const usePrivacyPolicy = () => {
   return {
      useListPrivacyPolicies,
      useGetPrivacyPolicyById,
      useCreatePrivacyPolicy,
      useUpdatePrivacyPolicy,
      useDeletePrivacyPolicy,
   };
};

// Export individual hooks for direct imports
export { useListPrivacyPolicies, useGetPrivacyPolicyById } from './privacyPolicy.queries';
export {
   useCreatePrivacyPolicy,
   useUpdatePrivacyPolicy,
   useDeletePrivacyPolicy,
} from './privacyPolicy.mutations';
