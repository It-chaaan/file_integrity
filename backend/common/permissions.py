from rest_framework.permissions import BasePermission


def _has_role(request, roles):
    return bool(request.user and request.user.is_authenticated and request.user.role in roles)


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, {"super_admin"})


class IsAdminOrSuper(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, {"admin", "super_admin"})


class IsStaffOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, {"staff", "admin", "super_admin"})


class IsVerifier(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, {"verifier"})


class IsVerifierOrStaffOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, {"verifier", "staff", "admin", "super_admin"})


class IsStaffOrAdminOrClient(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, {"staff", "admin", "super_admin", "client"})


class IsStaffOrAdminOrVerifierOrClient(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, {"staff", "admin", "super_admin", "verifier", "client"})
