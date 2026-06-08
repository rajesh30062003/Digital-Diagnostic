import React from "react";
import { Redirect, Route } from "wouter";
import { useAuthStore } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  allowedRoles: string[];
}

export function ProtectedRoute({ path, component: Component, allowedRoles }: ProtectedRouteProps) {
  const { token, role } = useAuthStore();

  return (
    <Route path={path}>
      {!token ? (
        <Redirect to="/login" />
      ) : role && !allowedRoles.includes(role) ? (
        <Redirect to={`/${role}`} />
      ) : (
        <Component />
      )}
    </Route>
  );
}
