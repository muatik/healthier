from rest_framework import permissions
from rest_framework.exceptions import NotAuthenticated


class IsNotAnonymous(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_authenticated:
            return True
        raise NotAuthenticated("please login to perform this action")


class IsOwner(IsNotAnonymous):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Write permissions are only allowed to the owner of the given object.
        return obj.user.id == request.user.id


class IsSelf(IsNotAnonymous):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Write permissions are only allowed to the owner of the user object.
        return obj.id == request.user.id