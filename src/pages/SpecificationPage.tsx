import { useMemo, useState, useCallback, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../designSystem/ui/data-table';
import { Modal } from '../designSystem/ui/modal';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2 } from 'lucide-react';
import SearchInput from '../designSystem/SearchInput';
import { useListSpecifications, useDeleteSpecification, useCreateSpecification, useUpdateSpecification } from '../hooks/specifications/useSpecifications';
import { useDebounce } from '../hooks/useDebounce';
import type { Specification, CreateSpecificationRequest } from '../services/specificationService';
import SpecificationForm from '../components/forms/SpecificationForm';

export default function SpecificationPage() {
   const { t, i18n } = useTranslation();
   const [searchQuery, setSearchQuery] = useState('');
   const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 10,
   });
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedSpecification, setSelectedSpecification] = useState<Specification | null>(null);

   // Debounce search query for server-side search
   const debouncedSearchQuery = useDebounce(searchQuery, 500);

   // Reset to first page when search changes
   useEffect(() => {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
   }, [debouncedSearchQuery]);

   const {
      data: specificationsData,
      isLoading,
      refetch,
   } = useListSpecifications(
      {
         page: pagination.pageIndex + 1,
         limit: pagination.pageSize,
         search: debouncedSearchQuery || undefined,
      },
      {
         enabled: true,
      }
   );

   const deleteSpecificationMutation = useDeleteSpecification();
   const createSpecificationMutation = useCreateSpecification();
   const updateSpecificationMutation = useUpdateSpecification();

   const data = specificationsData?.data || [];
   const pageCount = specificationsData?.pagination?.totalPages || 0;

   const handleEdit = (specification: Specification) => {
      setSelectedSpecification(specification);
      setIsModalOpen(true);
   };

   const handleDelete = useCallback(async (specification: Specification) => {
      if (window.confirm(t('appData.confirmDeleteSpec', 'هل أنت متأكد من حذف هذا المجال؟'))) {
         try {
            await deleteSpecificationMutation.mutateAsync(specification.id);
            refetch();
         } catch (error) {
            console.error('Error deleting specification:', error);
         }
      }
   }, [deleteSpecificationMutation, refetch, t]);

   const handleAdd = () => {
      setSelectedSpecification(null);
      setIsModalOpen(true);
   };

   const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedSpecification(null);
   };

   const handleSubmit = async (formData: CreateSpecificationRequest) => {
      try {
         if (selectedSpecification) {
            await updateSpecificationMutation.mutateAsync({
               id: selectedSpecification.id,
               payload: formData,
            });
         } else {
            await createSpecificationMutation.mutateAsync(formData);
         }
         refetch();
         handleCloseModal();
      } catch (error) {
         console.error('Error saving specification:', error);
         throw error;
      }
   };

   const columns: ColumnDef<Specification>[] = useMemo(
      () => [
         {
            accessorKey: 'name',
            header: t('labels.name', 'الاسم'),
            size: 250,
         },
         {
            accessorKey: 'icon',
            header: t('appData.icon', 'الأيقونة'),
            size: 200,
            cell: ({ row }) => {
               const icon = row.getValue('icon') as string;
               if (!icon) {
                  return <span className="text-text-soft">-</span>;
               }

               // Check if icon is an image file
               const isImageFile = /\.(svg|png|jpg|jpeg|gif|webp)$/i.test(icon);
               
               // Build icon URL - if it's not a full URL, prepend base URL
               const iconUrl = icon.startsWith('http') || icon.startsWith('/')
                  ? icon
                  : `${import.meta.env.VITE_API_BASE_URL || '/api'}/uploads/${icon}`;

               return (
                  <div className="flex items-center gap-2">
                     {isImageFile ? (
                        <img
                           src={iconUrl}
                           alt={row.original.name}
                           className="w-8 h-8 object-contain"
                           onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              // Show fallback text
                              const parent = target.parentElement;
                              if (parent) {
                                 const fallback = document.createElement('span');
                                 fallback.className = 'text-text-sub text-xs';
                                 fallback.textContent = icon;
                                 parent.appendChild(fallback);
                              }
                           }}
                        />
                     ) : (
                        <span className="text-text-sub text-sm">{icon}</span>
                     )}
                  </div>
               );
            },
         },
         {
            accessorKey: 'createdAt',
            header: t('labels.createdAt', 'تاريخ الإنشاء'),
            size: 200,
            cell: ({ row }) => {
               const date = row.getValue('createdAt') as string;
               if (!date) return <span className="text-text-soft">-</span>;
               try {
                  const dateObj = new Date(date);
                  return (
                     <span>
                        {dateObj.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
                           year: 'numeric',
                           month: 'long',
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
            size: 100,
            cell: ({ row }) => {
               const specification = row.original;
               return (
                  <div className="flex items-center gap-2" data-row-click-ignore>
                     <button
                        onClick={(e) => {
                           e.stopPropagation();
                           handleEdit(specification);
                        }}
                        className="p-1.5 text-text-sub hover:text-primary hover:bg-primary/10 rounded transition-colors"
                        title={t('actions.edit', 'تعديل')}>
                        <Edit className="w-4 h-4" />
                     </button>
                     <button
                        onClick={(e) => {
                           e.stopPropagation();
                           handleDelete(specification);
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
      <div className="p-8">
         <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-semibold text-text-strong">
               {t('sidebar.specification')}
            </h1>
            <button
               onClick={handleAdd}
               className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
               <Plus className="w-5 h-5" />
               <span>{t('appData.addSpec', 'إضافة مجال')}</span>
            </button>
         </div>

         <div className="bg-white rounded-lg border border-border">
            <div className="p-4 border-b border-border">
               <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder={t('appData.searchSpec', 'ابحث عن مجال...')}
                  className="max-w-md"
               />
            </div>
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
            />
         </div>

         {/* Modal */}
         <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={selectedSpecification ? t('appData.editSpec', 'تعديل مجال') : t('appData.addNewSpec', 'إضافة مجال جديد')}
            size="md">
            <SpecificationForm
               specification={selectedSpecification}
               onSubmit={handleSubmit}
               onCancel={handleCloseModal}
               isLoading={createSpecificationMutation.isPending || updateSpecificationMutation.isPending}
            />
         </Modal>
      </div>
   );
}
