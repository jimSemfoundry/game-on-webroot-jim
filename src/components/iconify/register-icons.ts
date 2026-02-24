import { addCollection } from '@iconify/react';

/**
 * 异步加载图标，避免打包到主 bundle
 */
export const registerIcons = async () => {
  try {
    const icons = await import('@/assets/icons/icons.json');
    addCollection(icons.default);
  } catch (error) {
    console.warn('Failed to load icons:', error);
  }
};
