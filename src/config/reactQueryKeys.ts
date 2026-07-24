export const reactQueryKeys = {
  dashboard: {
    all: ['dashboard'] as const,
    stats: ['dashboard', 'stats'] as const,
    overview: (params?: { startDate?: string; endDate?: string }) =>
      [...reactQueryKeys.dashboard.all, 'overview', { params }] as const,
    activeProjects: (params?: { startDate?: string; endDate?: string }) =>
      [...reactQueryKeys.dashboard.all, 'activeProjects', { params }] as const,
    freelancersByCountry: () =>
      [...reactQueryKeys.dashboard.all, 'freelancersByCountry'] as const,
    projectsByField: () =>
      [...reactQueryKeys.dashboard.all, 'projectsByField'] as const,
  },
  auth: {
    user: ['auth', 'user'] as const,
  },
  skills: {
    all: ['skills'] as const,
    lists: () => [...reactQueryKeys.skills.all, 'list'] as const,
    list: (filters?: { page?: number; limit?: number; search?: string }) =>
      [...reactQueryKeys.skills.lists(), { filters }] as const,
    details: () => [...reactQueryKeys.skills.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...reactQueryKeys.skills.details(), id] as const,
  },
  specifications: {
    all: ['specifications'] as const,
    lists: () => [...reactQueryKeys.specifications.all, 'list'] as const,
    list: (filters?: { page?: number; limit?: number; search?: string }) =>
      [...reactQueryKeys.specifications.lists(), { filters }] as const,
    details: () => [...reactQueryKeys.specifications.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...reactQueryKeys.specifications.details(), id] as const,
  },
  tags: {
    all: ['tags'] as const,
    lists: () => [...reactQueryKeys.tags.all, 'list'] as const,
    list: (filters?: { page?: number; limit?: number; search?: string }) =>
      [...reactQueryKeys.tags.lists(), { filters }] as const,
    details: () => [...reactQueryKeys.tags.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...reactQueryKeys.tags.details(), id] as const,
  },
  privacyPolicy: {
    all: ['privacyPolicy'] as const,
    lists: () => [...reactQueryKeys.privacyPolicy.all, 'list'] as const,
    list: (filters?: { page?: number; limit?: number; search?: string }) =>
      [...reactQueryKeys.privacyPolicy.lists(), { filters }] as const,
    details: () => [...reactQueryKeys.privacyPolicy.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...reactQueryKeys.privacyPolicy.details(), id] as const,
  },
  employees: {
    all: ['employees'] as const,
    lists: () => [...reactQueryKeys.employees.all, 'list'] as const,
    list: (filters?: { page?: number; limit?: number; search?: string }) =>
      [...reactQueryKeys.employees.lists(), { filters }] as const,
    details: () => [...reactQueryKeys.employees.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...reactQueryKeys.employees.details(), id] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...reactQueryKeys.users.all, 'list'] as const,
    list: (filters?: {
      page?: number;
      limit?: number;
      search?: string;
      mode?: 'freelancer' | 'client';
      isVerifiedAsFreelancer?: boolean;
      isVerifiedAsClient?: boolean;
      specification?: string;
      sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'avgRating';
      sortOrder?: 'asc' | 'desc';
    }) => [...reactQueryKeys.users.lists(), { filters }] as const,
    details: () => [...reactQueryKeys.users.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...reactQueryKeys.users.details(), id] as const,
  },
  demands: {
    all: ['demands'] as const,
    verification: {
      all: () => [...reactQueryKeys.demands.all, 'verification'] as const,
      lists: () => [...reactQueryKeys.demands.verification.all(), 'list'] as const,
      list: (filters?: {
        page?: number;
        limit?: number;
        search?: string;
        mode?: 'freelancer' | 'client';
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }) => [...reactQueryKeys.demands.verification.lists(), { filters }] as const,
      count: (filters?: {
        search?: string;
        mode?: 'freelancer' | 'client';
      }) => [...reactQueryKeys.demands.verification.all(), 'count', { filters }] as const,
    },
    tagAttachments: {
      all: () => [...reactQueryKeys.demands.all, 'tagAttachments'] as const,
      lists: () => [...reactQueryKeys.demands.tagAttachments.all(), 'list'] as const,
      list: (filters?: {
        page?: number;
        limit?: number;
        tagId?: string;
        userId?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }) => [...reactQueryKeys.demands.tagAttachments.lists(), { filters }] as const,
      count: (filters?: {
        tagId?: string;
        userId?: string;
      }) => [...reactQueryKeys.demands.tagAttachments.all(), 'count', { filters }] as const,
    },
    experience: {
      all: () => [...reactQueryKeys.demands.all, 'experience'] as const,
      lists: () => [...reactQueryKeys.demands.experience.all(), 'list'] as const,
      list: (filters?: {
        page?: number;
        limit?: number;
        userId?: string;
        isUnderReview?: boolean;
        reviewStatus?: 'pending' | 'approved' | 'rejected';
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }) => [...reactQueryKeys.demands.experience.lists(), { filters }] as const,
      underReview: (filters?: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }) => [...reactQueryKeys.demands.experience.all(), 'underReview', { filters }] as const,
      details: () => [...reactQueryKeys.demands.experience.all(), 'detail'] as const,
      detail: (id: string | number) =>
        [...reactQueryKeys.demands.experience.details(), id] as const,
      count: (filters?: {
        userId?: string;
        isUnderReview?: boolean;
        reviewStatus?: 'pending' | 'approved' | 'rejected';
      }) => [...reactQueryKeys.demands.experience.all(), 'count', { filters }] as const,
    },
  },
  projects: {
    all: ['projects'] as const,
    lists: () => [...reactQueryKeys.projects.all, 'list'] as const,
    list: (filters?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    }) => [...reactQueryKeys.projects.lists(), { filters }] as const,
    details: () => [...reactQueryKeys.projects.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...reactQueryKeys.projects.details(), id] as const,
    proposals: (projectId: string | number) =>
      [...reactQueryKeys.projects.detail(projectId), 'proposals'] as const,
    contracts: (projectId: string | number) =>
      [...reactQueryKeys.projects.detail(projectId), 'contracts'] as const,
  },
  contracts: {
    all: ['contracts'] as const,
    lists: () => [...reactQueryKeys.contracts.all, 'list'] as const,
    list: (filters?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    }) => [...reactQueryKeys.contracts.lists(), { filters }] as const,
    details: () => [...reactQueryKeys.contracts.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...reactQueryKeys.contracts.details(), id] as const,
  },
  wallet: {
    all: ['wallet'] as const,
    transactions: {
      all: () => [...reactQueryKeys.wallet.all, 'transactions'] as const,
      lists: () => [...reactQueryKeys.wallet.transactions.all(), 'list'] as const,
      list: () => [...reactQueryKeys.wallet.transactions.lists()] as const,
      allTransactions: () => [...reactQueryKeys.wallet.transactions.all(), 'all'] as const,
      taxable: (filters?: { page?: number; limit?: number }) =>
        [...reactQueryKeys.wallet.transactions.all(), 'taxable', { filters }] as const,
    },
  },
  withdrawals: {
    all: ['withdrawals'] as const,
    lists: () => [...reactQueryKeys.withdrawals.all, 'list'] as const,
    list: (filters?: {
      page?: number;
      limit?: number;
      status?: 'pending' | 'completed' | 'failed';
      userId?: string;
    }) => [...reactQueryKeys.withdrawals.lists(), { filters }] as const,
    details: () => [...reactQueryKeys.withdrawals.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...reactQueryKeys.withdrawals.details(), id] as const,
  },
  reports: {
    all: ['reports'] as const,
    lists: () => [...reactQueryKeys.reports.all, 'list'] as const,
    list: (filters?: {
      page?: number;
      limit?: number;
      status?: 'open' | 'reviewed' | 'resolved';
      userId?: string;
      projectId?: string | null;
      proposalId?: string | null;
    }) => [...reactQueryKeys.reports.lists(), { filters }] as const,
    details: () => [...reactQueryKeys.reports.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...reactQueryKeys.reports.details(), id] as const,
  },
};

export default reactQueryKeys;
