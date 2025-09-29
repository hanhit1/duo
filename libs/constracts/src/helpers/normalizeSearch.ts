/**
 * Chuẩn hóa search trước khi dùng trong MongoDB $text
 * - trim khoảng trắng đầu/cuối
 * - lowercase
 * - loại bỏ dấu tiếng Việt
 */
export const normalizeSearch = (searchKeyword: string): string => {
  if (!searchKeyword) return '';

  let term = searchKeyword.trim().toLowerCase();
  // Loại bỏ dấu tiếng Việt
  term = term.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  return term;
};
