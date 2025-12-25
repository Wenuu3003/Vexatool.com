import { useLocation } from "react-router-dom";

const BASE_URL = "https://mypdfs.in";

export const useCanonicalUrl = () => {
  const location = useLocation();
  const path = location.pathname === "/" ? "" : location.pathname;
  return `${BASE_URL}${path}`;
};

export const getCanonicalUrl = (path: string) => {
  const cleanPath = path === "/" ? "" : path;
  return `${BASE_URL}${cleanPath}`;
};
