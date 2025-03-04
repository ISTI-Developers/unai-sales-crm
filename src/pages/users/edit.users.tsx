import { ComboBox } from "@/components/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/interfaces/user.interface";
import Page from "@/misc/Page";
import { useRole } from "@/providers/role.provider";
import { useUser } from "@/providers/users.provider";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useParams } from "react-router-dom";
import { v4 } from "uuid";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, getResponseFromUserParamType, updateUser } = useUser();
  const { roleOptions } = useRole();

  const { toast } = useToast();
  const [user, setUser] = useState<User>({
    ID: v4(),
    first_name: "",
    middle_name: "",
    last_name: "",
    email_address: "",
    company: null,
    sales_unit: null,
    username: "",
    role: {
      role_id: 4,
      name: "Account Executive",
    },
  });
  const [loading, setLoading] = useState<boolean>(false);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading((prev) => !prev);

    if (!user.ID) {
      toast({
        title: "Account Update Error",
        description: `ERROR: An error has occured. Send a ticket to the developer.`,
        variant: "destructive",
      });
      return;
    }

    delete user.role.access;
    const response = await updateUser(String(user.ID), user);

    console.log(response);

    if (response.acknowledged) {
      toast({
        description: `Account update success! The user is advised to relogin for the changes to apply.`,
        variant: "success",
      });
      navigate(`/users`);
    } else {
      toast({
        title: "Account Creation Error",
        description: `ERROR: ${
          response.error ||
          "An error has occured. Send a ticket to the developer."
        }`,
        variant: "destructive",
      });
      setLoading((prev) => !prev);
    }
  };

  const isReady = useMemo(() => {
    return Object.entries(user).some(([key, value]) => {
      if (key !== "company" && key !== "sales_unit" && key !== "middle_name") {
        return value === "";
      }
    });
  }, [user]);

  useEffect(() => {
    if (!id) {
      navigate("/users");
      return;
    }

    const setup = async () => {
      if (users) {
        const paramName = id.replace(/_/g, " ");
        const viewedUser = users.find((u) => {
          const full_name = [u.first_name, u.last_name].join(" ");
          return paramName.toLowerCase() === full_name.toLowerCase();
        });

        if (viewedUser) {
          setUser(viewedUser);
        } else {
          navigate("/users");
          return;
        }
      }
    };

    console.log("refreshing");
    setup();
  }, [id, users]);
  return (
    id && (
      <Page className="flex flex-col gap-4">
        <Helmet>
          <title>
            {id
              .split("_")
              .map((w) => w.substring(0, 1).toUpperCase() + w.slice(1))
              .join(" ")}{" "}
            | Edit User
          </title>
        </Helmet>
        <header className="flex items-center justify-between border-b pb-1.5">
          <h1 className="text-blue-500 font-bold uppercase">
            Edit User Profile
          </h1>
          <Button variant="link" type="button" asChild>
            <Link to={`/users/${id}`}>
              <ChevronLeft /> Back
            </Link>
          </Button>
        </header>
        <form className="space-y-4" onSubmit={onSubmit}>
          <section className="rounded-md border p-4">
            <header className="font-bold pb-1 mb-1 border-b">
              Personal Information
            </header>
            <div className="flex flex-col gap-4 pt-2">
              {Object.keys(user)
                .slice(1, 5)
                .map((key) => {
                  return (
                    <div
                      key={key}
                      className="grid grid-cols-[20%_80%] items-center"
                    >
                      <Label htmlFor={key} className="capitalize">
                        {key.replace(/_/g, " ")}
                      </Label>
                      <Input
                        id={key}
                        type={key.includes("email") ? "email" : "text"}
                        name={key}
                        value={user[key]}
                        onChange={onInputChange}
                        required={key === "middle_name" ? false : true}
                        disabled={loading}
                      />
                    </div>
                  );
                })}
            </div>
          </section>
          <section className="rounded-md border p-4">
            <header className="font-bold pb-1 mb-1 border-b">
              Account Information
            </header>
            <div className="flex flex-col gap-4 pt-2">
              <div className="grid grid-cols-[20%_80%] items-center">
                <Label htmlFor="username" className="capitalize">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  value={user.username}
                  onChange={onInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-[20%_80%] items-center">
                <Label htmlFor="role" className="capitalize">
                  Role
                </Label>
                <ComboBox
                  title="role"
                  list={roleOptions}
                  value={user.role.name}
                  setValue={(id, value) => {
                    setUser((prev) => {
                      return {
                        ...prev,
                        role: {
                          role_id: Number(id),
                          name: value,
                        },
                      };
                    });
                  }}
                  disabled={loading}
                />
              </div>
            </div>
          </section>
          <Button
            type="submit"
            variant="ghost"
            disabled={isReady || loading}
            className="w-fit bg-main-100 hover:bg-main-700 text-white hover:text-white float-right flex gap-4 disabled:cursor-not-allowed"
          >
            {loading && <LoaderCircle className="animate-spin" />}
            Save Changes
          </Button>
        </form>
      </Page>
    )
  );
};

export default EditUser;
