export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path; // already absolute
    return `${process.env.NEXT_PUBLIC_BACKEND_FILE_URL}/${path}`;
  };