import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Role, User } from "@/interfaces/user.interface";
import Page from "@/misc/Page";
import { useCompany } from "@/providers/company.provider";
import { useUser } from "@/providers/users.provider";
import { ChevronLeft } from "lucide-react";

import { ReactNode, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useParams } from "react-router-dom";

const ViewUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);

  const { users } = useUser();
  const { companies } = useCompany();
  const navigate = useNavigate();

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

    setup();
  }, [companies, id, navigate, users]);
  return (
    id && (
      <Page className="flex flex-col gap-4">
        <Helmet>
          <title>
            {id
              .split("_")
              .map((w) => w.substring(0, 1).toUpperCase() + w.slice(1))
              .join(" ")}{" "}
            | User
          </title>
        </Helmet>
        <header className="flex items-center justify-between border-b pb-1.5">
          <h1 className="text-blue-500 font-bold uppercase">User Profile</h1>
          <Button variant="link" type="button" asChild>
            <Link to="/users">
              <ChevronLeft /> Back
            </Link>
          </Button>
        </header>
        {user && (
          <div className="space-y-4">
            <section className="rounded-md border p-4">
              <header className="font-bold pb-1 mb-1 border-b">
                Personal Information
              </header>
              <div className="flex flex-col gap-4 pt-2">
                {[
                  "first_name",
                  "middle_name",
                  "last_name",
                  "email_address",
                ].map((key) => {
                  return (
                    <UserDetail
                      key={key}
                      id={key}
                      value={user[key]}
                      role={user.role}
                    />
                  );
                })}
                <UserDetail
                  id="company"
                  value={user.company?.name}
                  role={user.role}
                />
                <UserDetail
                  id="sales_unit"
                  value={user.sales_unit?.unit_name}
                  role={user.role}
                />
              </div>
            </section>
            <section className="rounded-md border p-4">
              <header className="font-bold pb-1 mb-1 border-b">
                Account Information
              </header>
              <div className="flex flex-col gap-4 pt-2">
                <UserDetail
                  id="username"
                  value={user.username}
                  role={user.role}
                />
                <UserDetail
                  id="password"
                  content={
                    <Button variant="outline" className="w-fit">
                      Change Password
                    </Button>
                  }
                  role={user.role}
                />
                <UserDetail id="role" value={user.role.name} role={user.role} />
              </div>
            </section>
            <Button
              asChild
              type="submit"
              variant="ghost"
              className="w-fit bg-main-100 hover:bg-main-700 text-white hover:text-white float-right flex gap-4 disabled:cursor-not-allowed"
            >
              <Link to="./edit">Edit</Link>
            </Button>
          </div>
        )}
      </Page>
    )
  );
};

const UserDetail = ({
  id,
  value,
  content,
  role,
}: {
  id: string;
  value?: string | number | null;
  content?: ReactNode;
  role: Role;
}) => {
  const capitalizedEntries = [
    "first_name",
    "middle_name",
    "last_name",
    "company",
    "role",
  ];
  const badgeInfo =
    Number(role.role_id) <= 2
      ? ["text-gray-400 bg-gray-50", "N/A"]
      : ["text-yellow-500 bg-yellow-100", "TBD"];
  return (
    <div className="grid grid-cols-[20%_80%] items-center">
      <Label htmlFor={id} className="capitalize">
        {id.replace(/_/g, " ")}
      </Label>
      {content !== null && content}
      {!content && (
        <div className={capitalizedEntries.includes(id) ? "capitalize" : ""}>
          {id === "middle_name" && (!value || value.toString().length === 0)
            ? "---"
            : value || <Badge className={badgeInfo[0]}>{badgeInfo[1]}</Badge>}
        </div>
      )}
    </div>
  );
};

export default ViewUser;
