import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { ComboBox } from "@/components/combobox";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/interfaces/user.interface";
import Page from "@/misc/Page";
import { useAuth } from "@/providers/auth.provider";
import { useUser } from "@/providers/users.provider";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { useRole } from "@/providers/role.provider";

const AddUser = () => {
  const { generatePassword } = useAuth();
  const { insertUser } = useUser();
  const [user, setUser] = useState<User>({
    ID: v4(),
    first_name: "",
    middle_name: "",
    last_name: "",
    email_address: "",
    company: null,
    sales_unit: null,
    username: "",
    password: generatePassword(),
    role: {
      role_id: 5,
      name: "account executive",
    },
    status: "new",
  });
  const { roleOptions } = useRole();
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading((prev) => !prev);

    const response = await insertUser(user);

    if (response.acknowledged) {
      toast({
        description: `Account creation success! Credentials have been sent to ${user.email_address}.`,
        variant: "success",
      });
      navigate("/users");
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

  return (
    <Page className="flex flex-col gap-4">
      <Helmet>
        <title>Add User | Sales CRM</title>
      </Helmet>
      <header className="flex items-center justify-between border-b pb-1.5">
        <h1 className="text-blue-500 font-bold uppercase">New User</h1>
        <Button variant="link" type="button" asChild>
          <Link to="/users">
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
                    {key.includes("email") ? (
                      <Label htmlFor={key} className=" flex gap-1 items-center">
                        <span className="capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        {key.includes("email") && (
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <QuestionMarkCircledIcon />
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="bg-opacity-60"
                            >
                              Provide an active email address. The generated
                              password will be sent there.
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </Label>
                    ) : (
                      <Label htmlFor={key} className="capitalize">
                        {key.replace(/_/g, " ")}
                      </Label>
                    )}
                    <Input
                      id={key}
                      type={key.includes("email") ? "email" : "text"}
                      name={key}
                      value={user[key]}
                      onChange={onInputChange}
                      required={key !== "middle_name"}
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
              <Label htmlFor="password" className="capitalize">
                Pasword
              </Label>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    disabled
                    value={user.password}
                    onChange={onInputChange}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-opacity-60">
                  Password is auto-generated. Password must be changed on the
                  user's first login
                </TooltipContent>
              </Tooltip>
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
          Submit
        </Button>
      </form>
    </Page>
  );
};

export default AddUser;
