import { Button } from "@/components/ui/button";
import { DataTable } from "@/data/data-table";
import { columns } from "@/data/users.columns";
import useStoredUser from "@/hooks/useStoredUser";
import { UserTable } from "@/interfaces/user.interface";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import AddUser from "@/pages/users/add.users";
import EditUser from "@/pages/users/edit.users";
import ViewUser from "@/pages/users/view.users";
import { useUser } from "@/providers/users.provider";
import { AnimatePresence } from "framer-motion";
import { CirclePlus } from "lucide-react";
import { useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link, Route, Routes } from "react-router-dom";

const Users = () => {
  return (
    <Container title="Users">
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/add" element={<AddUser />} />
        <Route path="/:id" element={<ViewUser />} />
        <Route path="/:id/edit" element={<EditUser />} />
      </Routes>
    </Container>
  );
};

const Main = () => {
  const { users } = useUser();
  const { user } = useStoredUser();

  const usersData: UserTable[] = useMemo(() => {
    if (!users || !user) return [];

    if (users.length < 0) return [];
    
    return users.map((user) => {
      const full_name = [user.first_name, user.last_name].join(" ");

      return {
        ID: Number(user.ID),
        user: full_name,
        company: user.company?.name || null,
        sales_unit: user.sales_unit?.unit_name || null,
        role: user.role.name,
        status: user.status ? user.status : "active",
      };
    });
  }, [user, users]);

  return (
    <>
      <Helmet>
        <title>Users | Sales CRM</title>
      </Helmet>
      <header className="flex items-center justify-between">
        <Button
          asChild
          variant="outline"
          className="flex items-center gap-1.5 pl-2"
        >
          <Link to="./add">
            <CirclePlus size={16} />
            Add User
          </Link>
        </Button>
      </header>
      <AnimatePresence>
        <Page className="w-full">
          <DataTable columns={columns} data={usersData} />
        </Page>
      </AnimatePresence>
    </>
  );
};

export default Users;
