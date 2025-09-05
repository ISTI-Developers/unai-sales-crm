import { Button } from "@/components/ui/button";
import { DataTable } from "@/data/data-table";
import { columns } from "@/data/users.columns";
import { useUsers } from "@/hooks/useUsers";
import { UserTable } from "@/interfaces/user.interface";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import AddUser from "@/pages/users/add.users";
import EditUser from "@/pages/users/edit.users";
import ViewUser from "@/pages/users/view.users";
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
  const { data: users, isLoading } = useUsers();

  const usersData: UserTable[] = useMemo(() => {
    if (!users) return [];

    if (users.length < 0) return [];

    return users.map((user) => {
      const full_name = `${user.first_name} ${user.last_name}`;

      return {
        ID: Number(user.ID),
        user: full_name,
        company: user.company?.name || null,
        sales_unit: user.sales_unit?.unit_name || null,
        role: user.role.name,
        status: user.status ? user.status : "active",
      };
    });
  }, [users]);

  if (isLoading) return <>fetching...</>;

  return (
    <>
      <Helmet>
        <title>Users | Sales Platform</title>
      </Helmet>
      <AnimatePresence>
        <Page className="w-full">
          <DataTable columns={columns} data={usersData} size={50}>
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
          </DataTable>
        </Page>
      </AnimatePresence>
    </>
  );
};

export default Users;
