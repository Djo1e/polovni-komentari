import { createContext, useContext } from "react"

export const ShadowPortalContext = createContext<HTMLElement | null>(null)

export function useShadowPortal(): HTMLElement | null {
  return useContext(ShadowPortalContext)
}
