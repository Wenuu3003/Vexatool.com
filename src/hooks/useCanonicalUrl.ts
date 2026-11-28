import { useLocation } from "react-router-dom";

const BASE_URL = "https://vexatool.com";

export const useCanonicalUrl = () => {
  const location = useLocation();
  return getCanonicalUrl(location.pathname);
};

export const getCanonicalUrl = (path: string) => {
  const cleanPath = path.split(/[?#]/)[0].replace(/\/+$/, "");
  return `${BASE_URL}${cleanPath}`;
};
