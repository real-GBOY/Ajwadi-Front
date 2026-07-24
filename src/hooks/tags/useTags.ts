/** @format */

import { useListTags, useGetTagById } from './tag.queries';
import {
   useCreateTag,
   useUpdateTag,
   useDeleteTag,
} from './tag.mutations';

export const useTags = () => {
   return {
      useListTags,
      useGetTagById,
      useCreateTag,
      useUpdateTag,
      useDeleteTag,
   };
};

// Export individual hooks for direct imports
export { useListTags, useGetTagById } from './tag.queries';
export {
   useCreateTag,
   useUpdateTag,
   useDeleteTag,
} from './tag.mutations';
