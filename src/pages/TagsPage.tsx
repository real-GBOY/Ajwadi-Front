import { useMemo, useState, useCallback, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../designSystem/ui/data-table';
import { Modal } from '../designSystem/ui/modal';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2 } from 'lucide-react';
import SearchInput from '../designSystem/SearchInput';
import { useListTags, useDeleteTag, useCreateTag, useUpdateTag } from '../hooks/tags/useTags';
import { useDebounce } from '../hooks/useDebounce';
import type { Tag, CreateTagRequest } from '../services/tagService';
import TagForm from '../components/forms/TagForm';

export default function TagsPage() {
   const { t } = useTranslation();
   const [searchQuery, setSearchQuery] = useState('');
   const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 10,
   });
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

   // Debounce search query for server-side search
   const debouncedSearchQuery = useDebounce(searchQuery, 500);

   // Reset to first page when search changes
   useEffect(() => {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
   }, [debouncedSearchQuery]);

   const {
      data: tagsData,
      isLoading,
      refetch,
   } = useListTags(
      {
         page: pagination.pageIndex + 1,
         limit: pagination.pageSize,
         search: debouncedSearchQuery || undefined,
      },
      {
         enabled: true,
      }
   );

   const deleteTagMutation = useDeleteTag();
   const createTagMutation = useCreateTag();
   const updateTagMutation = useUpdateTag();

   const data = tagsData?.data || [];
   const pageCount = tagsData?.pagination?.total_pages || 0;

   const handleEdit = (tag: Tag) => {
      setSelectedTag(tag);
      setIsModalOpen(true);
   };

   const handleDelete = useCallback(async (tag: Tag) => {
      if (window.confirm('هل أنت متأكد من حذف هذه العلامة؟')) {
         try {
            await deleteTagMutation.mutateAsync(tag.id);
            refetch();
         } catch (error) {
            console.error('Error deleting tag:', error);
         }
      }
   }, [deleteTagMutation, refetch]);

   const handleAdd = () => {
      setSelectedTag(null);
      setIsModalOpen(true);
   };

   const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedTag(null);
   };

   const handleSubmit = async (formData: CreateTagRequest) => {
      try {
         if (selectedTag) {
            await updateTagMutation.mutateAsync({
               id: selectedTag.id,
               payload: formData,
            });
         } else {
            await createTagMutation.mutateAsync(formData);
         }
         refetch();
         handleCloseModal();
      } catch (error) {
         console.error('Error saving tag:', error);
         throw error;
      }
   };

   const columns: ColumnDef<Tag>[] = useMemo(
      () => [
         {
            accessorKey: 'name',
            header: 'اسم العلامة',
            size: 200,
         },
         {
            accessorKey: 'badgeUrl',
            header: 'الشارة',
            size: 150,
            cell: ({ row }) => {
               const badgeUrl = row.getValue('badgeUrl') as string;
               return badgeUrl ? (
                  <div className="flex items-center justify-center">
                     <img
                        src={badgeUrl}
                        alt={row.original.name}
                        className="w-12 h-12 object-contain rounded-lg border border-gray-200"
                        onError={(e) => {
                           const target = e.target as HTMLImageElement;
                           target.style.display = 'none';
                           const parent = target.parentElement;
                           if (parent) {
                              parent.innerHTML = '<span class="text-text-soft text-xs">فشل تحميل الصورة</span>';
                           }
                        }}
                     />
                  </div>
               ) : (
                  <span className="text-text-soft">-</span>
               );
            },
         },
         {
            accessorKey: 'status',
            header: 'الحالة',
            size: 120,
            cell: ({ row }) => {
               const status = row.getValue('status') as string;
               const statusMap: Record<string, { label: string; className: string }> = {
                  pending: { label: 'قيد الانتظار', className: 'bg-yellow-100 text-yellow-800' },
                  accepted: { label: 'مقبول', className: 'bg-green-100 text-green-800' },
                  rejected: { label: 'مرفوض', className: 'bg-red-100 text-red-800' },
               };
               const statusInfo = statusMap[status] || { label: status || '-', className: 'bg-gray-100 text-gray-800' };
               return (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.className}`}>
                     {statusInfo.label}
                  </span>
               );
            },
         },
         {
            accessorKey: 'createdAt',
            header: 'تاريخ الإنشاء',
            size: 180,
            cell: ({ row }) => {
               const date = row.getValue('createdAt') as string;
               if (!date) return <span className="text-text-soft">-</span>;
               try {
                  const d = new Date(date);
                  return (
                     <span>
                        {d.toLocaleDateString('ar-SA', {
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
            header: 'الإجراءات',
            size: 100,
            cell: ({ row }) => {
               const tag = row.original;
               return (
                  <div className="flex items-center gap-2" data-row-click-ignore>
                     <button
                        onClick={(e) => {
                           e.stopPropagation();
                           handleEdit(tag);
                        }}
                        className="p-1.5 text-text-sub hover:text-primary hover:bg-primary/10 rounded transition-colors"
                        title="تعديل">
                        <Edit className="w-4 h-4" />
                     </button>
                     <button
                        onClick={(e) => {
                           e.stopPropagation();
                           handleDelete(tag);
                        }}
                        className="p-1.5 text-text-sub hover:text-danger hover:bg-danger/10 rounded transition-colors"
                        title="حذف">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               );
            },
         },
      ],
      [handleDelete]
   );

   return (
      <div className="p-8">
         <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-semibold text-text-strong">
               {t('sidebar.tags')}
            </h1>
            <button
               onClick={handleAdd}
               className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
               <Plus className="w-5 h-5" />
               <span>إضافة علامة</span>
            </button>
         </div>

         <div className="bg-white rounded-lg border border-border">
            <div className="p-4 border-b border-border">
               <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="ابحث عن علامة..."
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
               globalFilter={searchQuery}
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
            title={selectedTag ? 'تعديل علامة' : 'إضافة علامة جديدة'}
            size="md">
            <TagForm
               tag={selectedTag}
               onSubmit={handleSubmit}
               onCancel={handleCloseModal}
               isLoading={createTagMutation.isPending || updateTagMutation.isPending}
            />
         </Modal>
      </div>
   );
}
