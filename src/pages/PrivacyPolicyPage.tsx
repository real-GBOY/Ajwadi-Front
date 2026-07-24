import { useState, useCallback, useEffect } from 'react';
import { Modal } from '../designSystem/ui/modal';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchInput from '../designSystem/SearchInput';
import { useListPrivacyPolicies, useDeletePrivacyPolicy, useCreatePrivacyPolicy, useUpdatePrivacyPolicy } from '../hooks/privacyPolicy/usePrivacyPolicy';
import { useDebounce } from '../hooks/useDebounce';
import type { PrivacyPolicy, CreatePrivacyPolicyRequest } from '../services/privacyPolicyService';
import PrivacyPolicyForm from '../components/forms/PrivacyPolicyForm';
import Loader from '../designSystem/Loader';

const LANGUAGE_MAP: Record<string, string> = {
   ar: 'العربية',
   en: 'English',
   fr: 'Français',
   es: 'Español',
};

export default function PrivacyPolicyPage() {
   const { t } = useTranslation();
   const [searchQuery, setSearchQuery] = useState('');
   const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 9,
   });
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedPrivacyPolicy, setSelectedPrivacyPolicy] = useState<PrivacyPolicy | null>(null);

   const debouncedSearchQuery = useDebounce(searchQuery, 500);

   useEffect(() => {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
   }, [debouncedSearchQuery]);

   const {
      data: privacyPoliciesData,
      isLoading,
      refetch,
   } = useListPrivacyPolicies(
      {
         page: pagination.pageIndex + 1,
         limit: pagination.pageSize,
         search: debouncedSearchQuery || undefined,
      },
      { enabled: true }
   );

   const deletePrivacyPolicyMutation = useDeletePrivacyPolicy();
   const createPrivacyPolicyMutation = useCreatePrivacyPolicy();
   const updatePrivacyPolicyMutation = useUpdatePrivacyPolicy();

   const data = privacyPoliciesData?.data || [];
   const pageCount = privacyPoliciesData?.pagination?.total_pages || 0;

   const handleEdit = (privacyPolicy: PrivacyPolicy) => {
      setSelectedPrivacyPolicy(privacyPolicy);
      setIsModalOpen(true);
   };

   const handleDelete = useCallback(async (privacyPolicy: PrivacyPolicy) => {
      if (window.confirm('هل أنت متأكد من حذف سياسة الخصوصية هذه؟')) {
         try {
            await deletePrivacyPolicyMutation.mutateAsync(privacyPolicy.id);
            refetch();
         } catch (error) {
            console.error('Error deleting privacy policy:', error);
         }
      }
   }, [deletePrivacyPolicyMutation, refetch]);

   const handleAdd = () => {
      setSelectedPrivacyPolicy(null);
      setIsModalOpen(true);
   };

   const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedPrivacyPolicy(null);
   };

   const handleSubmit = async (formData: CreatePrivacyPolicyRequest) => {
      try {
         if (selectedPrivacyPolicy) {
            await updatePrivacyPolicyMutation.mutateAsync({
               id: selectedPrivacyPolicy.id,
               payload: formData,
            });
         } else {
            await createPrivacyPolicyMutation.mutateAsync(formData);
         }
         refetch();
         handleCloseModal();
      } catch (error) {
         console.error('Error saving privacy policy:', error);
         throw error;
      }
   };

   const currentPage = pagination.pageIndex + 1;

   return (
      <div className="p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-strong">
               {t('sidebar.privacyPolicy')}
            </h1>
            <button
               onClick={handleAdd}
               className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto shrink-0">
               <Plus className="w-5 h-5 shrink-0" />
               <span>إضافة سياسة خصوصية</span>
            </button>
         </div>

         <div className="p-3 sm:p-4 mb-4 bg-white rounded-lg border border-border">
            <SearchInput
               value={searchQuery}
               onChange={setSearchQuery}
               placeholder="ابحث عن سياسة خصوصية..."
               className="w-full max-w-md"
            />
         </div>

         {isLoading ? (
            <div className="flex justify-center items-center py-16">
               <Loader label={t('loading.general', 'جاري التحميل...')} />
            </div>
         ) : data.length === 0 ? (
            <div className="bg-white rounded-lg border border-border p-8 text-center text-text-sub">
               لا توجد سياسات خصوصية
            </div>
         ) : (
            <>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {data.map((policy) => (
                     <article
                        key={policy.id}
                        className="bg-white rounded-lg border border-border overflow-hidden flex flex-col hover:shadow-subtle transition-shadow">
                        <div className="p-4 sm:p-5 flex-1 flex flex-col min-w-0">
                           <h3 className="text-base sm:text-lg font-semibold text-text-strong truncate mb-2" title={policy.title}>
                              {policy.title}
                           </h3>
                           <span className="inline-flex self-start px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mb-3">
                              {LANGUAGE_MAP[policy.language] || policy.language}
                           </span>
                           <p className="text-sm text-text-sub line-clamp-3 flex-1 min-h-[3.75rem]">
                              {policy.content || '-'}
                           </p>
                           {policy.createdAt && (
                              <p className="text-xs text-text-soft mt-3">
                                 {new Date(policy.createdAt).toLocaleDateString('ar-SA', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                 })}
                              </p>
                           )}
                        </div>
                        <div className="flex items-center justify-end gap-1 p-3 border-t border-border bg-bg-weak/50">
                           <button
                              onClick={() => handleEdit(policy)}
                              className="p-2 text-text-sub hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="تعديل">
                              <Edit className="w-4 h-4" />
                           </button>
                           <button
                              onClick={() => handleDelete(policy)}
                              className="p-2 text-text-sub hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                              title="حذف">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </article>
                  ))}
               </div>

               {pageCount > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6 py-4 px-3 bg-white rounded-lg border border-border">
                     <span className="text-sm text-text-sub">
                        صفحة {currentPage} من {pageCount}
                     </span>
                     <div className="flex items-center gap-1">
                        <button
                           type="button"
                           onClick={() => setPagination((p) => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))}
                           disabled={pagination.pageIndex === 0}
                           className="p-2 rounded-lg text-text-sub hover:bg-bg-weak disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                           <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                           type="button"
                           onClick={() => setPagination((p) => ({ ...p, pageIndex: Math.min(pageCount - 1, p.pageIndex + 1) }))}
                           disabled={pagination.pageIndex >= pageCount - 1}
                           className="p-2 rounded-lg text-text-sub hover:bg-bg-weak disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                           <ChevronLeft className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
               )}
            </>
         )}

         <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={selectedPrivacyPolicy ? 'تعديل سياسة خصوصية' : 'إضافة سياسة خصوصية جديدة'}
            size="lg"
            className="max-w-[95vw] sm:max-w-2xl">
            <PrivacyPolicyForm
               privacyPolicy={selectedPrivacyPolicy}
               onSubmit={handleSubmit}
               onCancel={handleCloseModal}
               isLoading={createPrivacyPolicyMutation.isPending || updatePrivacyPolicyMutation.isPending}
            />
         </Modal>
      </div>
   );
}
