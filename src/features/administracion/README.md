# Administración 0.4.0

AdminLayout, AdminTable, ProductEditor y StockAdjustment componen las cuatro páginas de pages/admin. Permisos, validación e idempotencia en lib/admin-operations.ts. El catálogo reside en state.products y precios/stock en state.inventory, compartidos con tienda. No hay seguridad de servidor. ConfirmAction se comparte desde components/operation-confirmation.tsx.
