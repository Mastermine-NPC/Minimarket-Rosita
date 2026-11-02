import { type ReactNode } from "react";
import { BrowserRouter } from "react-router";
import { MotionConfig } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { OrderNotificationsProvider } from "@/features/pedidos/order-notifications-provider";
import { RositaProvider } from "./state/rosita-provider";
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <RositaProvider>
        <BrowserRouter><OrderNotificationsProvider>{children}</OrderNotificationsProvider></BrowserRouter>
        <Toaster
          position="bottom-right"
          closeButton
          toastOptions={{ duration: 4500 }}
        />
      </RositaProvider>
    </MotionConfig>
  );
}
