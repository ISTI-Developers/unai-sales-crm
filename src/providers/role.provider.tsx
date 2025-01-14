import { DefaultResponse, List, ProviderProps } from "@/interfaces";
import { Modules, Role, RoleTypes, User } from "@/interfaces/user.interface";
import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useProvider } from "./provider";
import { useLog } from "./log.provider";
import { useAuth } from "./auth.provider";

const RolesProviderContext = createContext<RoleTypes | null>(null);

export const useRole = (): RoleTypes => {
  const context = useContext(RolesProviderContext);
  if (context === null || context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};

export function RoleProvider({ children }: ProviderProps) {
  const { logoutUser } = useAuth();
  const { authHeader, handleError, handleSessionExpiration } = useProvider();
  const url = import.meta.env.VITE_LOCAL_SERVER;
  const roleURL = `${url}roles`;
  const location = useLocation();
  const { logActivity } = useLog();
  const currentUser = localStorage.getItem("currentUser");

  const [rawRoles, setRawData] = useState<Role[] | null>(null);
  const [role, setRole] = useState<Role[] | null>(null);
  const [modules, setModules] = useState<Modules[] | null>(null);
  const [reload, doReload] = useState<number>(0);

  const [currentUserRole, setCurrentUserRole] = useState<Role | null>(null);

  const getModules = async () => {
    try {
      const response = await axios.get(`${roleURL}?modules`, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  };
  const insertModule = async (module_name: string) => {
    try {
      const formdata = new FormData();
      formdata.append("name", module_name);
      const response = await axios.post(`${roleURL}?type=module`, formdata, {
        headers: authHeader(),
      });
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            10,
            "modules",
            response.data.id,
            module_name
          );
        }
      }
    } catch (error) {
      return handleError(error);
    }
  };

  const toggleModule = async (module: Modules, status: number) => {
    try {
      const response = await axios.put(
        roleURL,
        { type: "toggle", id: module.m_id, status },
        { headers: authHeader() }
      );
      if (response.data) {
        const t_id = status === 1 ? 14 : 13;

        if (response.data.id) {
          return await logActivity(
            t_id,
            "modules",
            response.data.id,
            module.name
          );
        }
      }
    } catch (error) {
      return handleError(error);
    }
  };

  const insertRole = async (role: Role) => {
    try {
      const formdata = new FormData();
      formdata.append("role", JSON.stringify(role));
      const response = await axios.post(`${roleURL}?type=role`, formdata, {
        headers: authHeader(),
      });
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            9,
            "user_roles",
            response.data.id,
            role.name
          );
        }
      }
    } catch (error) {
      return handleError(error);
    }
  };

  const updateRolePermissions = async (role: Role) => {
    try {
      const response = await axios.put(
        roleURL,
        { type: "update", ...role },
        {
          headers: authHeader(),
        }
      );
      if (response.data) {
        if (response.data.id) {
          return await logActivity(
            15,
            "user_roles",
            response.data.id,
            role.name
          );
        }
      }
    } catch (error) {
      return handleError(error);
    }
  };

  const manageRole = async (role: Role, status: number) => {
    try {
      const response = await axios.put(
        roleURL,
        { type: "manage", id: role.role_id, status: status },
        {
          headers: authHeader(),
        }
      );
      if (response.data) {
        const t_id = status === 1 ? 12 : status === 2 ? 11 : 16;
        if (response.data.id) {
          return await logActivity(
            t_id,
            "user_roles",
            response.data.id,
            role.name
          );
        }
      }
    } catch (error) {
      return handleError(error);
    }
  };

  const getRoles = async () => {
    try {
      const response = await axios.get(roleURL, { headers: authHeader() });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  };

  const forceReload = () => doReload((prev) => prev + 1);

  const [roles, roleOptions]: [Role[], List[]] = useMemo(() => {
    if (!rawRoles) return [[], []];

    if (rawRoles.error) {
      logoutUser();
      return [[], []];
    }

    const list = rawRoles.map(
      ({ role_id, name, description, status, status_id }) => ({
        role_id,
        name,
        description,
        status,
        status_id,
      })
    );

    const options = rawRoles.map(({ role_id, name }) => ({
      id: String(role_id),
      value: name,
      label: name,
    }));

    return [list, options];
  }, [rawRoles]);

  // const roles: Role[] = useMemo(() => {
  //   if (!rawRoles) return [];
  //   return rawRoles
  //     ? rawRoles.map(({ role_id, name, description, status, status_id }) => ({
  //         role_id,
  //         name,
  //         description,
  //         status,
  //         status_id,
  //       }))
  //     : [];
  // }, [rawRoles]);

  // const roleOptions: List[] = useMemo(() => {
  //   if (rawRoles.error) return [];

  //   return rawRoles
  //     ? rawRoles.map(({ role_id, name }) => ({
  //         id: String(role_id),
  //         value: name,
  //         label: name,
  //       }))
  //     : [];
  // }, [rawRoles]);

  const getRolesWithId = async (id: string) => {
    try {
      const response = await axios.get(`${roleURL}?id=${id}`, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  };

  useEffect(() => {
    const fetchRolesAndModules = async () => {
      if (!location.pathname.match("login")) {
        if (!currentUser) {
          forceReload();
          return;
        }

        try {
          const [roleResponse, moduleResponse] = await Promise.all([
            getRoles(),
            getModules(),
          ]);
          setRawData(roleResponse);
          setModules(moduleResponse);
        } catch (error) {
          console.error("Error in setup:", handleError(error));
        }
      }
    };
    fetchRolesAndModules();
  }, [reload, roleURL, location, currentUser]);

  useEffect(() => {
    const fetchAndUpdateRole = async () => {
      if (!location.pathname.match("login")) {
        if (!currentUser) {
          forceReload();
          return;
        }

        const role_id = localStorage.getItem("role");
        if (!role_id) {
          setRole(null);
          return;
        }

        if (location.pathname.split("/").length === 2) {
          localStorage.removeItem("role");
          setRole(null);
          return;
        }

        const roleResponse = await getRolesWithId(role_id);
        if (roleResponse && modules) {
          const updatedRoles = roleResponse.map((item: Role) => ({
            ...item,
            access: modules.map((module) => ({
              m_id: module.m_id,
              name: module.name,
              permissions: item.access?.find(
                (perm) => perm.m_id === module.m_id
              )?.permissions || [0, 0, 0, 0],
              status: module.status,
            })),
          }));
          setRole(updatedRoles);
        }
      }
    };

    fetchAndUpdateRole();
  }, [location, modules, roleURL, reload, currentUser]);

  useEffect(() => {
    const getUserRole = async (id: string) => {
      try {
        const response = await axios.get(`${roleURL}?user_id=${id}`, {
          headers: authHeader(),
        });
        return response.data;
      } catch (error) {
        return handleError(error);
      }
    };

    const getCurrentUserRole = async () => {
      if (!location.pathname.match("login")) {
        if (!currentUser) {
          forceReload();
          return;
        }

        const user: User = JSON.parse(currentUser);
        let response: Role[] | DefaultResponse = await getUserRole(
          String(user.ID)
        );

        response = handleSessionExpiration(response);

        if (response.length === 1) {
          // Check if the currentUserRole is different from the fetched response
          const newRole = response[0];

          if (JSON.stringify(currentUserRole) !== JSON.stringify(newRole)) {
            setCurrentUserRole(newRole);

            // Update localStorage if the user role has changed
            if (user.role.role_id !== newRole.role_id) {
              user.role = newRole;
              localStorage.setItem("currentUser", JSON.stringify(user));
            }
          }
        }
      }
    };

    getCurrentUserRole();
    const interval = setInterval(getCurrentUserRole, 1500);

    return () => clearInterval(interval);
  }, [currentUserRole, reload, location, currentUser, roleURL]);

  const value = {
    role,
    roles,
    modules,
    roleOptions,
    currentUserRole,
    setRole,
    insertRole,
    forceReload,
    insertModule,
    toggleModule,
    manageRole,
    updateRolePermissions,
  };

  return (
    <RolesProviderContext.Provider value={value}>
      {children}
    </RolesProviderContext.Provider>
  );
}
