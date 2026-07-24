/** @format */

import React from 'react';
import Programming from '@/components/icons/programming';
import Business from '@/components/icons/business';
import Gear from '@/components/icons/gear';
import Education from '@/components/icons/education';
import ContentWriting from '@/components/icons/content-writing';
import Graduation from '@/components/icons/graduation';
import Web from '@/components/icons/web';
import Mobile from '@/components/icons/mobile';
import Database from '@/components/icons/database';
import VideoEditing from '@/components/icons/video-editing';
import DataAnalysis from '@/components/icons/data-analysis';
import CustomerSupport from '@/components/icons/customer-support';

export interface IconOption {
  value: string;
  label: string;
  component: React.ComponentType<{ size?: number; active?: boolean; isRTL?: boolean; className?: string }>;
  category: string;
}

// Available icon options for dropdown
export const SPECIFICATION_ICONS: IconOption[] = [
  {
    value: 'programming',
    label: 'برمجة (Programming)',
    component: Programming,
    category: 'Development',
  },
  {
    value: 'business',
    label: 'أعمال (Business)',
    component: Business,
    category: 'Business',
  },
  {
    value: 'gear',
    label: 'إعدادات (Gear)',
    component: Gear,
    category: 'Infrastructure',
  },
  {
    value: 'education',
    label: 'تعليم (Education)',
    component: Education,
    category: 'Education',
  },
  {
    value: 'content-writing',
    label: 'كتابة محتوى (Content Writing)',
    component: ContentWriting,
    category: 'Content',
  },
  {
    value: 'graduation',
    label: 'تخرج (Graduation)',
    component: Graduation,
    category: 'Education',
  },
  {
    value: 'web',
    label: 'ويب (Web)',
    component: Web,
    category: 'Development',
  },
  {
    value: 'mobile',
    label: 'موبايل (Mobile)',
    component: Mobile,
    category: 'Development',
  },
  {
    value: 'database',
    label: 'قاعدة بيانات (Database)',
    component: Database,
    category: 'Infrastructure',
  },
  {
    value: 'video-editing',
    label: 'مونتاج فيديو (Video Editing)',
    component: VideoEditing,
    category: 'Media',
  },
  {
    value: 'data-analysis',
    label: 'تحليل بيانات (Data Analysis)',
    component: DataAnalysis,
    category: 'Data',
  },
  {
    value: 'customer-support',
    label: 'دعم العملاء (Customer Support)',
    component: CustomerSupport,
    category: 'Support',
  },
];

/**
 * Get specification icon component based on icon filename/value
 * @param iconName - Icon filename or value from API (e.g., 'web-icon.svg', 'programming', etc.)
 * @param isRTL - Whether to render in RTL mode
 * @param isDark - Whether dark mode is active (for future use)
 * @param size - Icon size
 * @returns React component or null
 */
export function getSpecificationIcon(
  iconName: string | null | undefined,
  isRTL: boolean = false,
  isDark: boolean = false,
  size: number = 24
): React.ReactNode | null {
  if (!iconName) {
    return null;
  }

  // Normalize icon name: remove .svg extension, convert to lowercase, trim
  const normalized = iconName
    .toLowerCase()
    .replace(/\.svg$/, '')
    .replace(/\.png$/, '')
    .replace(/\.jpg$/, '')
    .replace(/\.jpeg$/, '')
    .trim();

  // Find matching icon
  const iconOption = SPECIFICATION_ICONS.find((icon) => {
    // Direct match
    if (icon.value === normalized) return true;
    
    // Check common aliases
    const aliases: Record<string, string[]> = {
      programming: ['ai', 'ai-ml', 'machine-learning', 'data-science', 'analytics', 'game', 'game-development', 'desktop', 'desktop-development'],
      business: ['ecommerce', 'e-commerce', 'cms', 'content-management', 'ui', 'ux', 'ui-ux-design', 'design'],
      gear: ['devops', 'cloud', 'backend', 'blockchain', 'cybersecurity', 'cyber-security', 'testing', 'qa'],
      education: ['education', 'training', 'learning'],
      'content-writing': ['content-writing', 'copywriting', 'blogging', 'technical-writing'],
      graduation: ['graduation', 'academic', 'certification', 'course'],
      web: ['web', 'web-development', 'web-icon'],
      mobile: ['mobile', 'mobile-development'],
      database: ['database'],
      'video-editing': ['video', 'video-editing', 'video-edit', 'editing', 'nvideo-editing'],
      'data-analysis': ['data-analysis', 'data-analytics', 'data-analysis-icon', 'data anyliysis', 'data analysis'],
      'customer-support': ['customer-support', 'support', 'customer_support', 'customer support'],
    };
    
    return aliases[icon.value]?.includes(normalized);
  });

  if (iconOption) {
    const IconComponent = iconOption.component;
    return <IconComponent size={size} active={false} isRTL={isRTL} />;
  }

  // Fallback to Gear icon
  return <Gear size={size} active={false} isRTL={isRTL} />;
}

/**
 * Get icon option by value
 */
export function getIconOption(value: string): IconOption | undefined {
  return SPECIFICATION_ICONS.find((icon) => icon.value === value);
}
