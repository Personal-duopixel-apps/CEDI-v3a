import { UserRole } from "@/types";

export const ROLE_LABELS: Record<UserRole, string> = {
    superadmin: "Super Administrador",
    admin: "Administrador",
    "scheduling-admin": "Admin de Citas",
    "catalog-admin": "Admin de Catálogo",
    "supplier-admin": "Admin de Proveedor",
    "supplier-user": "Usuario Proveedor",
    security: "Seguridad",
    guest: "Invitado",
};
