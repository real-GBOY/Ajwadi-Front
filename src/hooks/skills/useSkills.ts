/** @format */

import { useListSkills, useGetSkillById } from './skill.queries';
import {
   useCreateSkill,
   useUpdateSkill,
   useDeleteSkill,
} from './skill.mutations';

export const useSkills = () => {
   return {
      useListSkills,
      useGetSkillById,
      useCreateSkill,
      useUpdateSkill,
      useDeleteSkill,
   };
};

// Export individual hooks for direct imports
export { useListSkills, useGetSkillById } from './skill.queries';
export {
   useCreateSkill,
   useUpdateSkill,
   useDeleteSkill,
} from './skill.mutations';
