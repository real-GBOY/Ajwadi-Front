/** @format */

export const MAIN_COLORS = {
   light: {
      primary: "#1e40af",
      "primary-dark": "#1e3a8a",
      secondary: "#6b7280",
      background: "#ffffff",
      "background-dark": "#1a1a1a",
      "icon-sub": "#5C5C5C",
      icon: "#5C5C5C",
      "text-gray": "#5C5C5C",
      "text-main": "#ffffff",
      "text-strong": "#171717",
      "text-sub": "#5C5C5C",
      "text-soft": "#A3A3A3",
      "bg-weak": "#F7F7F7",
      "bg-dark": "#262626",
      border: "#EBEBEB",
      input: "#ffffff",
      card: "#ffffff",
      "card-dark": "#262626",
      danger: "#fb3748",
      "danger-light": "#ffebed",
      success: "#1fc16b",
      warning: "#FA7319",
      highlighted: "#FB4BA3",
      information: "#335CFF",
      info: "#335CFF",
      green: "#178C4E",
      faded: "#7B7B7B",
      "stroke-sub-300": "#D1D1D1",
      error: "#FB3748",
      "success-dark": "#0B4627",
      yellow: "#F6B51E",
      "green-strong": "#178C4E",
      overlay: "rgba(0, 0, 0, 0.4)",
      prospective: "#8259f4",
      elevated: "#ffffff",
      "chart-payment": "#fb4ba3",
      "chart-receipt": "#335cff",
      "badge-error-bg": "#ffeaeb",
      "badge-error-border": "#ffc0c5",
      "badge-error-text": "#681219",
      "badge-success-bg": "#e0faec",
      "badge-success-border": "#c2f5da",
      "badge-success-text": "#0b4627",
      "badge-info-bg": "#e0f2fe",
      "badge-info-border": "#bae6fd",
      "badge-info-text": "#0c4a6e",
      "badge-warning-bg": "#fef3c7",
      "badge-warning-border": "#fde68a",
      "badge-warning-text": "#78350f",
      "badge-primary-bg": "#dbeafe",
      "badge-primary-border": "#bfdbfe",
      "badge-primary-text": "#1e3a8a",
      "badge-gray-bg": "#f3f4f6",
      "badge-gray-border": "#e5e7eb",
      "badge-gray-text": "#374151",
      "chart-attendance-late": "#fb3748",
      "chart-attendance-dayoff": "#335cff",
      "chart-attendance-ontime": "#8259f4",
      "chart-requests-attendance": "#8259f4",
      "chart-requests-overtime": "#fa7319",
      "chart-requests-timeoff": "#f6b51e",
      "chart-members-active-bg": "rgba(120, 77, 239, 0.1)",
      "chart-members-inactive-bg-start": "rgba(235, 235, 235, 0.7)",
      "chart-members-inactive-bg-end": "rgba(235, 235, 235, 0.6)",
   },

   dark: {
      // Core Brand Colors - Slightly desaturated, maintaining brand identity
      primary: "#3b82f6", // Lighter dark blue for dark mode
      "primary-dark": "#2563eb", // Medium dark blue for dark mode
      secondary: "#9CA3AF", // Lighter gray for dark mode

      // Backgrounds - Dark gray system
      background: "#1A1A1A", // Slightly lighter than pure black
      "background-dark": "#0F0F0F", // Deepest background
      "bg-weak": "#262626", // Elevated surfaces
      "bg-dark": "#0F0F0F", // Deepest background

      // Text Colors - Practical hierarchy
      "text-main": "#0F0F0F", // For text on light surfaces
      "text-strong": "#EDEDED", // Slightly off-white (from #171717)
      "text-sub": "#A8A8A8", // Medium gray (from #5C5C5C)
      "text-soft": "#878787", // Softer gray (from #A3A3A3)
      "text-gray": "#A8A8A8", // Match text-sub

      // Icons
      icon: "#A8A8A8", // Consistent with text-sub
      "icon-sub": "#A8A8A8", // Consistent with text-sub

      // Borders & Strokes
      border: "#333333", // Visible but subtle (from #EBEBEB)
      input: "#262626", // Dark input background
      "stroke-sub-300": "#404040", // Slightly lighter for variety (from #D1D1D1)
      
      // Cards
      card: "#262626", // Dark card background
      "card-dark": "#1A1A1A", // Darker card background

      // Status Colors - Desaturated but recognizable
      danger: "#FB3748", // Keep original - it works
      "danger-light": "#2D1215", // Just slightly lighter than yours
      error: "#FB3748", // Keep original

      success: "#1FC16B", // Keep original - perfect
      "success-dark": "#0B4627", // Keep original

      warning: "#FA7319", // Keep original - works well
      yellow: "#F6B51E", // Keep original - good contrast

      information: "#4A73FF", // Just slightly brighter than #335CFF
      info: "#4A73FF", // Match information
      highlighted: "#FB4BA3", // Keep original - pops nicely

      green: "#1DA45E", // Just slightly lighter than #178C4E
      "green-strong": "#1DA45E", // Match grhttps://qwen.ai/homeeen
      faded: "#8A8A8A", // Just a touch lighter than #7B7B7B
      
      // Overlay & Other
      overlay: "rgba(0, 0, 0, 0.70)",
      prospective: "#9B7AFF", // Lighter purple for dark mode
      elevated: "#262626", // Elevated surface in dark mode

      /* Charts - Lighter and less saturated */
      "chart-payment": "#FF6DB8", // Lighter pink
      "chart-receipt": "#5580FF", // Lighter blue

      "chart-attendance-late": "#FA5862", // Lighter red
      "chart-attendance-dayoff": "#5580FF", // Lighter blue
      "chart-attendance-ontime": "#9B7AFF", // Lighter purple (from #8259F4)

      "chart-requests-attendance": "#9B7AFF", // Lighter purple
      "chart-requests-overtime": "#FF8A45", // Lighter orange
      "chart-requests-timeoff": "#FFC044", // Lighter yellow

      /* Badges - Proper semantic colors with good contrast */
      "badge-error-bg": "#2B1215", // Dark red (derived from danger)
      "badge-error-border": "#6B2329", // Mid red
      "badge-error-text": "#FFB3B8", // Light red

      "badge-success-bg": "#143D25", // Dark green (using success-dark)
      "badge-success-border": "#1F7045", // Mid green
      "badge-success-text": "#A8F5C8", // Light green

      "badge-info-bg": "#0C2E4A", // Dark blue
      "badge-info-border": "#1E5A8A", // Mid blue
      "badge-info-text": "#B3E0FF", // Light blue

      "badge-warning-bg": "#3D2E0F", // Dark yellow/orange
      "badge-warning-border": "#7A5A1F", // Mid yellow/orange
      "badge-warning-text": "#FFE5B3", // Light yellow/orange

      "badge-primary-bg": "#1E2A4A", // Dark primary blue
      "badge-primary-border": "#3B5A8A", // Mid primary blue
      "badge-primary-text": "#B3D0FF", // Light primary blue

      "badge-gray-bg": "#2A2A2A", // Dark gray
      "badge-gray-border": "#404040", // Mid gray
      "badge-gray-text": "#D1D1D1", // Light gray

      /* Members charts - Adjusted for dark bg */
      "chart-members-active-bg": "rgba(155, 122, 255, 0.18)",
      "chart-members-inactive-bg-start": "rgba(38, 38, 38, 0.85)",
      "chart-members-inactive-bg-end": "rgba(38, 38, 38, 0.65)",
   },
};

/**
 * Initialize colors in CSS variables
 * Call this function to set CSS variables from MAIN_COLORS
 */
export const initializeColors = (theme: "light" | "dark" = "light") => {
   const colors = MAIN_COLORS[theme];
   Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--c-${key}`, value);
   });
};

/**
 * Get color value by key
 */
export const getColor = (key: keyof typeof MAIN_COLORS.light, theme: "light" | "dark" = "light"): string => {
   return MAIN_COLORS[theme][key] || MAIN_COLORS.light[key];
};
