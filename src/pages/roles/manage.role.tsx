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
import { DefaultResponse } from "@/interfaces";
import { Permissions, Role } from "@/interfaces/user.interface";
import { capitalize } from "@/lib/utils";
import Page from "@/misc/Page";
import { useRole } from "@/providers/role.provider";
import classNames from "classnames";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { FormEvent, Fragment, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from "react-router-dom";

const ManageRole = () => {
  const { pathname } = useLocation();
  const {
    role: data,
    modules,
    updateRolePermissions,
    forceReload,
    insertRole,
  } = useRole();
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
    if (!localStorage.getItem("role") && title !== "Add Role") {
      navigate("/roles");
    }
    if (data) {
      setRole(data[0]);
    } else if (title === "Add Role") {
      if (modules) {
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
      }
    }
  }, [data, title, modules]);

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

    let toastTitle = "Role Created!";
    let errorTitle = "Creation Error";
    let action = "added";
    let response: DefaultResponse = {
      acknowledged: false,
    };

    if (title === "Add Role") {
      response = await insertRole(role);
    } else {
      response = await updateRolePermissions(role);
      toastTitle = "Role Updated!";
      errorTitle = "Update Error";
      action = "updated";
    }
    if (response.acknowledged) {
      toast({
        title: toastTitle,
        description: `${capitalize(
          role.name
        )} has been ${action} successfully.`,
        variant: "success",
      });
      forceReload();
      navigate(`/roles`);
    }

    if (response.error) {
      toast({
        title: errorTitle,
        description: `ERROR: ${
          response.error ||
          "An error has occured. Please contact the developer."
        }`,
        variant: "destructive",
      });
      setLoading((prev) => !prev);
    }
  };

  const isReady = useMemo(() => {
    if (!role) return false;

    return role.name !== "" && role.description !== "";
  }, [role]);

  const isEditable = useMemo(() => {
    return Boolean(title.toLowerCase().match(/add|edit/));
  }, [title]);

  return (
    <Page className="flex flex-col gap-4">
      <Helmet>
        <title>{title} | Roles | Sales CRM</title>
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
                      className={classNames(
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
