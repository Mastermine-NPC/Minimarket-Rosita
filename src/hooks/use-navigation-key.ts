import { createContext, useContext } from "react";
import { useLocation } from "react-router";
/** Actual router navigation, even while a cinematic transition displays the old route. */
export const NavigationKeyContext = createContext<string | null>(null);
export function useNavigationKey() {
  const actual = useContext(NavigationKeyContext);
  const location = useLocation();
  return actual ?? location.key;
}
