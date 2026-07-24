/** @format */

import { useListReports, useGetReportById } from './report.queries';
import { useUpdateReport } from './report.mutations';

export const useReports = () => {
  return {
    useListReports,
    useGetReportById,
    useUpdateReport,
  };
};

export { useListReports, useGetReportById } from './report.queries';
export { useUpdateReport } from './report.mutations';

