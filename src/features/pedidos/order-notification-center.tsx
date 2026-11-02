import { Bell, BellRing } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useOrderNotices } from "./order-notifications-context";
import { orderDate } from "@/lib/order-date";
import "@/styles/order-notifications.css";
export function OrderNotificationCenter() {
  const notices = useOrderNotices();
  return <details className="order-notification-center">
    <summary><Bell size={18} aria-hidden="true" /><span>Notificaciones de tus pedidos</span>{notices.unread > 0 && <strong aria-label={`${notices.unread} sin leer`}>{notices.unread}</strong>}</summary>
    <div className="order-notification-body"><div className="order-notification-actions"><p>Historial guardado en este navegador. Los avisos de demostración no aparecen aquí.</p>{notices.unread > 0 && <Button variant="ghost" onClick={notices.markAllRead}>Marcar todas como leídas</Button>}</div>
      {notices.notifications.length ? <ol aria-label="Historial de notificaciones" data-lenis-prevent>{notices.notifications.map(n => <li key={n.id} data-read={notices.read.includes(n.id)}><BellRing size={16} aria-hidden="true" /><div><strong>{n.title}</strong><p>{n.message}</p><time dateTime={n.event.at}>{orderDate(n.event.at)}</time><Link to={`/pedido/${n.orderId}/seguimiento`} onClick={() => notices.markRead(n.id)}>Ver pedido {n.orderId}</Link></div>{!notices.read.includes(n.id) && <Button variant="ghost" aria-label={`Marcar como leída ${n.title}`} onClick={() => notices.markRead(n.id)}>Leída</Button>}</li>)}</ol> : <p>No tienes notificaciones de pedidos.</p>}
      <div className="browser-notification-settings"><p>Los avisos del navegador solo funcionan mientras Rosita esté abierta. No se envían mensajes externos ni avisos push.</p>{notices.permission === "unsupported" ? <p>Este navegador no permite estos avisos. Puedes consultar el historial aquí.</p> : notices.browserEnabled ? <Button variant="outline" onClick={notices.disableBrowser}>Desactivar avisos del navegador</Button> : notices.permission === "denied" ? <p>Los avisos del navegador están bloqueados. El historial y los avisos dentro de Rosita siguen disponibles.</p> : <Button variant="outline" onClick={() => void notices.enableBrowser()}>Habilitar avisos del navegador</Button>}</div>
    </div>
  </details>;
}
