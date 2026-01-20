import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useModules } from "@/hooks/useModules";
import {
  useInsertRole,
  useRole,
  useUpdaterolePermissions,
} from "@/hooks/useRoles";
import { Modules, Role } from "@/interfaces/user.interface";
import { capitalize } from "@/lib/utils";
import Page from "@/misc/Page";
import { permissionMap } from "@/misc/permissionMap";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { Dispatch, FormEvent, SetStateAction, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from "react-router-dom";

const ManageRole = () => {
  const roleID = localStorage.getItem("role");
  const { pathname } = useLocation();
  const { data: modules, isLoading: isModuleLoading } = useModules();
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
    } else {
      return capitalize(path, "_");
    }
  }, [pathname]);

  useEffect(() => {
    if ((!roleID && title !== "Add Role") || !modules || modules.length === 0) {
      navigate("/roles");
      return;
    }

    if (title === "Add Role") {
      setRole({
        role_id: 1,
        name: "",
        description: "",
        status: "active",
        permissions: []
      });
      return;
    }

    if (data) {
      setRole(prev => ({
        ...prev,
        ...data, // merge instead of overwrite, so defaults stay intact
      }));
    }
  }, [data, roleID, title, modules]);


  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!role) return;
    // console.log(role);
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
          // console.log(response);
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

    return role.name !== "" && role.description !== "" && role.permissions.length > 0;
  }, [role]);

  return (
    <Page className="flex flex-col gap-4">
      <Helmet>
        <title>{title} | Roles | Sales Platform</title>
      </Helmet>
      <header className="flex items-center justify-between border-b pb-1.5">
        <h1 className="text-blue-500 font-bold uppercase">Manage Role</h1>
        <Button variant="link" type="button" asChild>
          <Link to="/roles" onClick={() => localStorage.removeItem("role")}>
            <ChevronLeft /> Back
          </Link>
        </Button>
      </header>
      {role &&
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-4 h-full max-h-[68vh] overflow-y-auto">
            <div className="flex flex-col gap-4">
              <div>
                <Label>Name</Label>
                <Input value={role.name} onChange={(e) => setRole(prev => {
                  if (!prev) return prev;

                  return {
                    ...prev,
                    name: e.target.value
                  }
                })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={role.description} onChange={(e) => setRole(prev => {
                  if (!prev) return prev;

                  return {
                    ...prev,
                    description: e.target.value
                  }
                })} />
              </div>
            </div>
            <ModuleContainer modules={modules} isLoading={isModuleLoading} permissions={role.permissions} setRole={setRole} />
          </div>
          <Button
            type="submit"
            variant="ghost"
            disabled={!isReady || loading}
            className="w-fit bg-main-100 hover:bg-main-700 text-white hover:text-white flex gap-4 ml-auto disabled:cursor-not-allowed"
          >
            {loading && <LoaderCircle className="animate-spin" />}
            <span>Save Changes</span>
          </Button>
        </form>
      }
    </Page>
  );
};

const ModuleContainer = ({ modules, isLoading, permissions, setRole }: {
  modules?: Modules[];
  isLoading: boolean;
  permissions: string[];
  setRole: Dispatch<SetStateAction<Role | null>>
}) => {
  if (!modules || isLoading) return <div>Loading...</div>


  return <div className="grid grid-cols-2 gap-4">
    {modules.filter(module => module.status !== "deleted").map(module => {
      const modulePermissions = permissions.length > 0 ? permissions.filter(perm => {
        const [mod] = perm.split(".");

        return mod.toLowerCase() === module.name.toLowerCase();
      }) : [];
      return <ModuleCard key={module.m_id} module={module} userPermissions={modulePermissions} setRole={setRole} />
    })}
  </div>

}

const ModuleCard = ({ module, userPermissions, setRole }: { module: Modules; userPermissions: string[]; setRole: Dispatch<SetStateAction<Role | null>> }) => {

  const togglePermission = (perm: string, checked: boolean) => {
    setRole(prev => {
      if (!prev) return prev;
      let newPermissions = [...prev.permissions];

      if (checked) {
        // add if not already in
        if (!newPermissions.includes(perm)) {
          newPermissions.push(perm);
        }
      } else {
        // remove
        newPermissions = newPermissions.filter(p => p !== perm);
      }

      return { ...prev, permissions: newPermissions };
    });
  };

  const toggleAll = (checked: boolean) => {
    setRole(prev => {
      if (!prev) return prev;
      let newPermissions = [...prev.permissions];

      if (checked) {
        // add all module permissions
        options.forEach(opt => {
          if (!newPermissions.includes(opt.value)) {
            newPermissions.push(opt.value);
          }
        });
      } else {
        // remove all module permissions
        newPermissions = newPermissions.filter(
          p => !options.find(opt => opt.value === p)
        );
      }

      return { ...prev, permissions: newPermissions };
    });
  };
  const options = useMemo(() => {
    const currentPermissions = [...permissionMap.keys()].filter(key => key.toLowerCase().startsWith(module.name.toLowerCase()))
    return currentPermissions.map(permission => ({
      value: permission,
      label: permissionMap.get(permission)
    }))
  }, [module.name])

  // Select all toggle
  const allSelected = options.every(opt =>
    userPermissions.includes(opt.value)
  );

  return <div className="flex flex-col gap-2 bg-zinc-100 rounded-lg">
    <header className="flex justify-between p-4">
      <span className="font-semibold">{module.name}</span>
      <div className="flex items-center gap-2">
        <Checkbox
          id={`${module.name}_select-all`}
          checked={allSelected}
          onCheckedChange={(checked) => toggleAll(!!checked)}
        />
        <Label htmlFor={`${module.name}_select-all`}>Select All</Label>
      </div>
    </header>
    <main className="p-4 pt-0 grid grid-cols-2 gap-4">
      {options.map(({ value, label }) => (
        <div key={value} className="flex items-center gap-2">
          <Checkbox
            id={value}
            checked={userPermissions.includes(value)}
            onCheckedChange={(checked) => togglePermission(value, !!checked)}
          />
          <Label htmlFor={value}>{label}</Label>
        </div>
      ))}
    </main>
  </div>
}


export default ManageRole;
