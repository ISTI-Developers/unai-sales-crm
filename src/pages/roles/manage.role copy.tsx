import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useModules } from "@/hooks/useModules";
import {
  useInsertRole,
  useRole,
  useUpdaterolePermissions,
} from "@/hooks/useRoles";
import { Permissions, Role } from "@/interfaces/user.interface";
import { capitalize } from "@/lib/utils";
import Page from "@/misc/Page";
import { cn } from "@/lib/utils";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { FormEvent, Fragment, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

const ManageRole = () => {
  const roleID = localStorage.getItem("role");
  const { pathname } = useLocation();
  const { data: modules } = useModules();
  const { data } = useRole(roleID);
  const { mutate: insertRole } = useInsertRole();
  const { mutate: updateRolePermissions } = useUpdaterolePermissions();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => {
    const pathStrip = pathname.split("/");
    const path = pathStrip[pathStrip.length - 1];
    if (path === "add") {
      return "Add Role";
    } else if (path === "edit") {
      return "Edit " + capitalize(pathStrip[pathStrip.length - 2], "_");
    } else {
      return capitalize(path, "_");
    }
  }, [pathname]);

  // Sync role state with the provider when it changes
  useEffect(() => {
    if ((!roleID && title !== "Add Role") || !modules) {
      navigate("/roles");
      return;
    }
    if (title === "Add Role") {
      setRole({
        role_id: 1,
        name: "",
        description: "",
        access: [
          ...modules.map((module) => {
            return {
              m_id: module.m_id,
              name: module.name,
              permissions: [0, 0, 0, 0],
              status: module.status,
            };
          }),
        ],
      });
    } else if (data) {
      const updatedRoles = data.map((item: Role) => ({
        ...item,
        access: modules.map((module) => ({
          m_id: module.m_id,
          name: module.name,
          permissions: item.access?.find((perm) => perm.m_id === module.m_id)
            ?.permissions || [0, 0, 0, 0],
          status: module.status,
        })),
      }));
      setRole(updatedRoles[0]);
    }
  }, [data, title, modules, roleID]);

  const updatePermission = (
    moduleID: number,
    permissionIndex: number,
    state: number
  ) => {
    setRole((current) => {
      if (current) {
        if (current.role_id) {
          return {
            ...current,
            access: [
              ...current.access.map((module) => {
                if (module.m_id === moduleID) {
                  return {
                    ...module,
                    permissions: [
                      ...module.permissions.map((perm, index) => {
                        if (index === permissionIndex) {
                          return state;
                        } else {
                          return perm;
                        }
                      }),
                    ],
                  };
                } else {
                  return module;
                }
              }),
            ],
          };
        } else {
          return current;
        }
      } else {
        return current;
      }
    });
  };

  const updateAllSelectedPermission = (
    permissionIndex: number,
    state: number
  ) => {
    setRole((current) => {
      if (current) {
        if (current.role_id) {
          return {
            ...current,
            access: [
              ...current.access.map((module) => {
                return {
                  ...module,
                  permissions: [
                    ...module.permissions.map((perm, index) => {
                      if (
                        index === permissionIndex &&
                        module.status === "active"
                      ) {
                        return state;
                      } else {
                        return perm;
                      }
                    }),
                  ],
                };
              }),
            ],
          };
        } else {
          return current;
        }
      } else {
        return current;
      }
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!role) return;
    setLoading((prev) => !prev);

    if (title === "Add Role") {
      insertRole(role, {
        onSuccess: (response) => {
          if (!response) return;
          toast({
            title: "Role Created!",
            description: `${capitalize(
              role.name
            )} has been added successfully.`,
            variant: "success",
          });
          navigate(`/roles`);
        },
      });
    } else {
      updateRolePermissions(role, {
        onSuccess: (response) => {
          if (!response) return;
          toast({
            title: "Role Updated!",
            description: `${capitalize(
              role.name
            )} has been updated successfully.`,
            variant: "success",
          });
          navigate(`/roles`);
        },
      });
    }
  };

  const isReady = useMemo(() => {
    if (!role) return false;

    return role.name !== "" && role.description !== "";
  }, [role]);

  const isEditable = useMemo(() => {
    return Boolean(title.toLowerCase().match(/add|edit/));
  }, [title]);

  if (!roleID) {
    return <Navigate to="/roles" />;
  }

  return (
    <Page className="flex flex-col gap-4">
      <Helmet>
        <title>{title} | Roles | Sales Platform</title>
      </Helmet>
      <header className="flex items-center justify-between border-b pb-1.5">
        <h1 className="text-blue-500 font-bold uppercase">{title}</h1>
        <Button variant="link" type="button" asChild>
          <Link to="/roles" onClick={() => localStorage.removeItem("role")}>
            <ChevronLeft /> Back
          </Link>
        </Button>
      </header>
      {role && (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <section className="bg-slate-100 p-4 rounded-md flex flex-col gap-4">
            {isEditable && (
              <div className="flex gap-4">
                <Label htmlFor="name" className="w-[150px] pt-1">
                  Role Name
                </Label>
                <Input
                  id="name"
                  name="role_name"
                  className="bg-white"
                  value={role.name}
                  onChange={(e) =>
                    setRole((prev) => {
                      if (!prev) return prev;

                      return {
                        ...prev,
                        name: e.target.value,
                      };
                    })
                  }
                />
              </div>
            )}
            <div className="flex gap-4">
              <Label htmlFor="description" className="w-[150px] pt-1">
                Role Description
              </Label>
              {isEditable ? (
                <Textarea
                  className="bg-white resize-none"
                  value={role.description}
                  onChange={(e) =>
                    setRole((prev) => {
                      if (!prev) return prev;

                      return {
                        ...prev,
                        description: e.target.value,
                      };
                    })
                  }
                ></Textarea>
              ) : (
                <p>{role.description}</p>
              )}
            </div>
          </section>
          {role.access && (
            <RoleAccesses
              isEditable={isEditable}
              accesses={role.access}
              updatePermission={updatePermission}
              updateAllSelectedPermission={updateAllSelectedPermission}
            />
          )}
          {isEditable ? (
            <Button
              type="submit"
              variant="ghost"
              disabled={!isReady || loading}
              className="w-fit bg-main-100 hover:bg-main-700 text-white hover:text-white flex gap-4 ml-auto disabled:cursor-not-allowed"
            >
              {loading && <LoaderCircle className="animate-spin" />}
              {title === "Add Role" ? "Create Role" : "Save Changes"}
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              className="w-fit bg-main-100 hover:bg-main-700 text-white hover:text-white flex gap-4 ml-auto disabled:cursor-not-allowed"
            >
              <Link to={`/roles/${role.name.replace(/ /, "_")}/edit`}>
                Edit
              </Link>
            </Button>
          )}
        </form>
      )}
    </Page>
  );
};

const RoleAccesses = ({
  accesses,
  updatePermission,
  updateAllSelectedPermission,
  isEditable,
}: {
  isEditable: boolean;
  accesses: Permissions[];
  updatePermission: (
    moduleID: number,
    permissionIndex: number,
    state: number
  ) => void;
  updateAllSelectedPermission: (permissionIndex: number, state: number) => void;
}) => {
  const accessKeys = ["view", "add", "update", "delete"];

  return (
    <section className="px-1 flex flex-col gap-2">
      <h3 className="font-semibold">Permissions</h3>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-5 place-items-center">
          <div className="capitalize w-full pl-4">Module</div>
          {accessKeys.map((key) => {
            return (
              <div key={key} className="capitalize">
                <p>{key}</p>
              </div>
            );
          })}
        </div>
        {isEditable && (
          <div className="grid grid-cols-5 place-items-center gap-4">
            <h4 className="text-start w-full pl-4">All</h4>
            {accessKeys.map((key, index) => {
              return (
                <Checkbox
                  key={key + "chkbox"}
                  className="data-[state=unchecked]:border-gray-500 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
                  onCheckedChange={(state) =>
                    updateAllSelectedPermission(index, Number(state))
                  }
                />
              );
            })}
          </div>
        )}
        <hr />
        <div className="grid grid-cols-5 place-items-center gap-4">
          {accesses.map((access) => {
            return (
              <Fragment key={`access-${access.m_id}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h4
                      className={cn(
                        "text-start w-full pl-4",
                        access.status === "inactive"
                          ? "text-slate-300 select-none cursor-not-allowed"
                          : ""
                      )}
                    >
                      {access.name}
                    </h4>
                  </TooltipTrigger>
                  {access.status === "inactive" && (
                    <TooltipContent>
                      Enable this module in the Modules tab to modify its
                      permissions.
                    </TooltipContent>
                  )}
                </Tooltip>

                {access.permissions.map((permission, index) => {
                  return (
                    <Checkbox
                      key={index}
                      checked={Boolean(permission)}
                      disabled={access.status === "inactive" || !isEditable}
                      onCheckedChange={(state) =>
                        updatePermission(access.m_id, index, Number(state))
                      }
                      className="data-[state=unchecked]:border-gray-500 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
                    />
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ManageRole;
