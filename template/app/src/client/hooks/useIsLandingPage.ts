import { useMemo } from "react";
import { useLocation } from "react-router";

export const useIsLandingPage = () => {
  const location = useLocation();

  return useMemo(() => {
    return location.pathname === "/";
  }, [location]);
};
