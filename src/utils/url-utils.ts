import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";

export const pathsEqual = (path1: string, path2: string): boolean => {
  const normalizedPath1 = path1.replace(/^\/|\/$/g, "").toLowerCase();
  const normalizedPath2 = path2.replace(/^\/|\/$/g, "").toLowerCase();
  return normalizedPath1 === normalizedPath2;
};

const joinUrl = (...parts: string[]): string => {
  const joined = parts.join("/");
  return joined.replace(/\/+/g, "/");
};

export const getPostUrlBySlug = (slug: string): string => {
  return url(`/posts/${slug}/`);
};

export const getTagUrl = (tag: string): string => {
  if (!tag) return url("/archive/");
  return url(`/archive/?tag=${encodeURIComponent(tag.trim())}`);
};

export const getCategoryUrl = (category: string | null): string => {
  if (
    !category ||
    category.trim() === "" ||
    category.trim().toLowerCase() === i18n(I18nKey.uncategorized).toLowerCase()
  )
    return url("/archive/?uncategorized=true");
  return url(`/archive/?category=${encodeURIComponent(category.trim())}`);
};

export const getDir = (path: string): string => {
  const lastSlashIndex = path.lastIndexOf("/");
  if (lastSlashIndex < 0) {
    return "/";
  }
  return path.substring(0, lastSlashIndex + 1);
};

export const url = (path: string): string => {
  return joinUrl("", import.meta.env.BASE_URL, path);
};
