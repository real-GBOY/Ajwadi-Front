/** @format */

import { useListSpecifications, useGetSpecificationById } from './specification.queries';
import {
   useCreateSpecification,
   useUpdateSpecification,
   useDeleteSpecification,
} from './specification.mutations';

export const useSpecifications = () => {
   return {
      useListSpecifications,
      useGetSpecificationById,
      useCreateSpecification,
      useUpdateSpecification,
      useDeleteSpecification,
   };
};

// Export individual hooks for direct imports
export { useListSpecifications, useGetSpecificationById } from './specification.queries';
export {
   useCreateSpecification,
   useUpdateSpecification,
   useDeleteSpecification,
} from './specification.mutations';
