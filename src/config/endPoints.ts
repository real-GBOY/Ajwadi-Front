// Paths only - relative to apiClient's baseURL (see src/config/axios.ts), which
// is the single place that decides whether that base is a relative "/api" or
// an absolute "https://.../api". Prepending VITE_API_BASE_URL here too would
// double it once axios also applies its own baseURL.
const endpoints = {
  auth: {
    login: `/auth/login`,
    logout: `/auth/logout`,
    register: `/auth/register`,
  },
  dashboard: {
    stats: `/dashboard/stats`,
    overview: `/dashboard/overview`,
    activeProjects: `/dashboard/active-projects`,
    freelancersByCountry: `/dashboard/freelancers-by-country`,
    projectsByField: `/dashboard/projects-by-field`,
  },
  skills: {
    getAll: `/skills`,
    getById: (id: string | number) => `/skills/${id}`,
    create: `/skills`,
    update: (id: string | number) => `/skills/${id}`,
    delete: (id: string | number) => `/skills/${id}`,
  },
  specifications: {
    getAll: `/specifications`,
    getById: (id: string | number) => `/specifications/${id}`,
    create: `/specifications`,
    update: (id: string | number) => `/specifications/${id}`,
    delete: (id: string | number) => `/specifications/${id}`,
  },
  tags: {
    getAll: `/tags`,
    getById: (id: string | number) => `/tags/${id}`,
    create: `/tags`,
    update: (id: string | number) => `/tags/${id}`,
    delete: (id: string | number) => `/tags/${id}`,
  },
  privacyPolicy: {
    getAll: `/privacy-policies`,
    getById: (id: string | number) => `/privacy-policies/${id}`,
    create: `/privacy-policies`,
    update: (id: string | number) => `/privacy-policies/${id}`,
    delete: (id: string | number) => `/privacy-policies/${id}`,
  },
  employees: {
    getAll: `/employees`,
    getById: (id: string | number) => `/employees/${id}`,
    create: `/employees`,
    update: (id: string | number) => `/employees/${id}`,
    delete: (id: string | number) => `/employees/${id}`,
    login: `/employees/login`,
    getMe: `/employees/me`,
  },
  s3: {
    getUploadUrl: `/s3/upload-url`,
  },
  users: {
    getAll: `/users`,
    getById: (id: string | number) => `/users/${id}`,
    verifyFreelancer: (id: string | number) => `/users/${id}/verify/freelancer`,
    verifyClient: (id: string | number) => `/users/${id}/verify/client`,
    unverifyFreelancer: (id: string | number) => `/users/${id}/unverify/freelancer`,
    unverifyClient: (id: string | number) => `/users/${id}/unverify/client`,
    getIdentity: (id: string | number) => `/users/${id}/identity`,
  },
  proposals: {
    getByUserId: (userId: string | number) => `/proposals/user/${userId}`,
    getByProjectId: (projectId: string | number) => `/proposals/project/${projectId}`,
  },
  contracts: {
    getById: (id: string | number) => `/contracts/${id}`,
    getFinancial: (id: string | number) => `/contracts/${id}/financial`,
    getByClientId: (clientId: string | number) => `/contracts/client/${clientId}`,
    getByFreelancerId: (freelancerId: string | number) => `/contracts/freelancer/${freelancerId}`,
    getByProjectId: (projectId: string | number) => `/contracts/project/${projectId}`,
    getHistory: (projectId: string | number) => `/contracts/project/${projectId}/history`,
    getLatest: `/contracts/employee/latest`,
  },
  reports: {
    list: `/reports`,
    getById: (id: string | number) => `/reports/${id}`,
    update: (id: string | number) => `/reports/${id}`,
  },
  withdrawals: {
    create: `/withdrawals`,
    getMy: `/withdrawals`,
    getAll: `/withdrawals/all`,
    updateStatus: (id: string | number) => `/withdrawals/${id}/status`,
  },
  wallet: {
    getAllTransactions: `/wallet/transactions/all`,
    getTransactions: `/wallet/transactions`,
    getTransactionById: (id: string | number) => `/wallet/transactions/${id}`,
    getTaxableTransactions: `/wallet/transactions/taxable`,
    topUp: `/wallet/top-up`,
    verifyTransaction: (id: string | number) => `/wallet/transactions/${id}/verify`,
    getCards: `/wallet/cards`,
    startContractTransaction: (contractId: string | number) => `/wallet/contracts/${contractId}/start-transaction`,
    verifyContractTransaction: (id: string | number) => `/wallet/transactions/${id}/verify-contract`,
    verifyContractTransactionCard: (id: string | number) => `/wallet/transactions/${id}/verify-contract-card`,
  },
  projects: {
    getAll: `/projects`,
    getById: (id: string | number) => `/projects/${id}`,
    getByUserId: (userId: string | number) => `/projects?createdById=${userId}`,
  },
  demands: {
    verification: {
      getAll: `/demands/verification`,
      getCount: `/demands/verification/count`,
    },
    tagAttachments: {
      getAll: `/demands/tag-attachments`,
      getCount: `/demands/tag-attachments/count`,
      updateStatus: (id: string | number) => `/tags/attachments/${id}/status`,
    },
    experience: {
      getAll: `/experience-demands`,
      getById: (id: string | number) => `/experience-demands/${id}`,
      getUnderReview: `/experience-demands/under-review`,
      getCount: `/experience-demands/count`,
      create: `/experience-demands`,
      update: (id: string | number) => `/experience-demands/${id}`,
      approve: (id: string | number) => `/experience-demands/${id}/approve`,
      reject: (id: string | number) => `/experience-demands/${id}/reject`,
      delete: (id: string | number) => `/experience-demands/${id}`,
    },
  },
  complains: {
    getAll: `/complains`,
    getById: (id: string | number) => `/complains/${id}`,
    create: `/complains`,
    update: (id: string | number) => `/complains/${id}`,
    delete: (id: string | number) => `/complains/${id}`,
    markAsRead: (id: string | number) => `/complains/${id}/read`,
    markAsUnread: (id: string | number) => `/complains/${id}/unread`,
    pin: (id: string | number) => `/complains/${id}/pin`,
    unpin: (id: string | number) => `/complains/${id}/unpin`,
    resolve: (id: string | number) => `/complains/${id}/resolve`,
    getCount: `/complains/count`,
  },
  chat: {
    conversations: {
      create: `/chat/conversations`,
      getAll: `/chat/conversations`,
      getById: (id: string) => `/chat/conversations/${id}`,
      delete: (id: string) => `/chat/conversations/${id}`,
      markAsRead: (id: string) => `/chat/conversations/${id}/read`,
    },
    messages: {
      send: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
      getByConversation: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
      getById: (id: string) => `/chat/messages/${id}`,
      update: (id: string) => `/chat/messages/${id}`,
      delete: (id: string) => `/chat/messages/${id}`,
    },
  },
  push: {
    register: `/push/register`,
    revoke: `/push/revoke`,
    test: `/push/test`,
    notify: `/push/notify`,
    broadcast: `/push/broadcast`,
  },
};

export default endpoints;
export { endpoints as endPoints };
