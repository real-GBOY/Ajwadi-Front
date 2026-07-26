import { useMemo, useState, useCallback, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../designSystem/ui/data-table';
import { Modal } from '../designSystem/ui/modal';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2 } from 'lucide-react';
import SearchInput from '../designSystem/SearchInput';
import { useListSkills, useDeleteSkill, useCreateSkill, useUpdateSkill } from '../hooks/skills/useSkills';
import { useDebounce } from '../hooks/useDebounce';
import type { Skill, CreateSkillRequest } from '../services/skillService';
import SkillsForm from '../components/forms/SkillsForm';

export default function SkillsPage() {
   const { t, i18n } = useTranslation();
   const [searchQuery, setSearchQuery] = useState('');
   const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 10,
   });
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

   // Debounce search query for server-side search
   const debouncedSearchQuery = useDebounce(searchQuery, 500);

   // Reset to first page when search changes
   useEffect(() => {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
   }, [debouncedSearchQuery]);

   // Fetch data using React Query with server-side search
   const {
      data: skillsData,
      isLoading,
      refetch,
   } = useListSkills(
      {
         page: pagination.pageIndex + 1,
         limit: pagination.pageSize,
         search: debouncedSearchQuery || undefined,
      },
      {
         enabled: true,
      }
   );

   const deleteSkillMutation = useDeleteSkill();
   const createSkillMutation = useCreateSkill();
   const updateSkillMutation = useUpdateSkill();

   const data = skillsData?.data || [];
   const pageCount = skillsData?.pagination?.total_pages || 0;

   const handleEdit = (skill: Skill) => {
      setSelectedSkill(skill);
      setIsModalOpen(true);
   };

   const handleDelete = useCallback(async (skill: Skill) => {
      if (window.confirm(t('appData.confirmDeleteSkill', 'هل أنت متأكد من حذف هذه المهارة؟'))) {
         try {
            await deleteSkillMutation.mutateAsync(skill.id);
            refetch();
         } catch (error) {
            console.error('Error deleting skill:', error);
         }
      }
   }, [deleteSkillMutation, refetch, t]);

   const handleAdd = () => {
      setSelectedSkill(null);
      setIsModalOpen(true);
   };

   const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedSkill(null);
   };

   const handleSubmit = async (formData: CreateSkillRequest) => {
      try {
         if (selectedSkill) {
            await updateSkillMutation.mutateAsync({
               id: selectedSkill.id,
               payload: formData,
            });
         } else {
            await createSkillMutation.mutateAsync(formData);
         }
         refetch();
         handleCloseModal();
      } catch (error) {
         console.error('Error saving skill:', error);
         throw error;
      }
   };

   const columns: ColumnDef<Skill>[] = useMemo(
      () => [
         {
            accessorKey: 'name',
            header: t('appData.skillName', 'اسم المهارة'),
            size: 140,
            cell: ({ row }) => (
               <span className="truncate block max-w-[140px] sm:max-w-none" title={row.original.name}>
                  {row.original.name}
               </span>
            ),
         },
         {
            accessorKey: 'createdAt',
            header: t('labels.createdAt', 'تاريخ الإنشاء'),
            size: 110,
            cell: ({ row }) => {
               const date = row.getValue('createdAt') as string;
               if (!date) return <span className="text-text-soft">-</span>;
               try {
                  const d = new Date(date);
                  return (
                     <span className="whitespace-nowrap text-[11px] sm:text-sm">
                        {d.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
                           year: 'numeric',
                           month: 'short',
                           day: 'numeric',
                        })}
                     </span>
                  );
               } catch {
                  return <span>{date}</span>;
               }
            },
         },
         {
            id: 'actions',
            header: t('labels.actions', 'الإجراءات'),
            size: 80,
            cell: ({ row }) => {
               const skill = row.original;
               return (
                  <div className="flex items-center gap-2" data-row-click-ignore>
                     <button
                        onClick={(e) => {
                           e.stopPropagation();
                           handleEdit(skill);
                        }}
                        className="p-1.5 text-text-sub hover:text-primary hover:bg-primary/10 rounded transition-colors"
                        title={t('actions.edit', 'تعديل')}>
                        <Edit className="w-4 h-4" />
                     </button>
                     <button
                        onClick={(e) => {
                           e.stopPropagation();
                           handleDelete(skill);
                        }}
                        className="p-1.5 text-text-sub hover:text-danger hover:bg-danger/10 rounded transition-colors"
                        title={t('actions.delete', 'حذف')}>
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               );
            },
         },
      ],
      [handleDelete, t, i18n.language]
   );

   return (
      <div className="p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-strong">
               {t('sidebar.skills')}
            </h1>
            <button
               onClick={handleAdd}
               className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto shrink-0">
               <Plus className="w-5 h-5 shrink-0" />
               <span>{t('appData.addSkill', 'إضافة مهارة')}</span>
            </button>
         </div>

         <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-border">
               <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder={t('appData.searchSkill', 'ابحث عن مهارة...')}
                  className="w-full max-w-md"
               />
            </div>
            <div className="overflow-x-auto min-w-0">
               <DataTable
                  columns={columns}
                  data={data}
                  pageSize={pagination.pageSize}
                  showPagination={true}
                  isLoading={isLoading}
                  enableRowHover={true}
                  pagination={pagination}
                  onPaginationChange={setPagination}
                  manualPagination={true}
                  pageCount={pageCount}
                  scrollContainerClassName="max-h-[50vh] sm:max-h-[62vh]"
               />
            </div>
         </div>

         {/* Modal */}
         <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={selectedSkill ? t('appData.editSkill', 'تعديل مهارة') : t('appData.addNewSkill', 'إضافة مهارة جديدة')}
            size="md"
            className="max-w-[95vw] sm:max-w-lg">
            <SkillsForm
               skill={selectedSkill}
               onSubmit={handleSubmit}
               onCancel={handleCloseModal}
               isLoading={createSkillMutation.isPending || updateSkillMutation.isPending}
            />
         </Modal>
      </div>
   );
}
