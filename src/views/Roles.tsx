import { Button } from "@/components/ui/button";
import { DataTable } from "@/data/data-table";
import { columns } from "@/data/roles.columns";
import { columns as moduleColumns } from "@/data/modules.columns";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import { AnimatePresence } from "framer-motion";
import { CirclePlus } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link, Route, Routes } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManageRole from "@/pages/roles/manage.role";
import { useRoles } from "@/hooks/useRoles";
import { useInsertModule, useModules } from "@/hooks/useModules";

const Roles = () => {
  return (
    <Container title="Roles and Modules">
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/add" element={<ManageRole />} />
        <Route path="/:id" element={<ManageRole />} />
        <Route path="/:id/edit" element={<ManageRole />} />
      </Routes>
    </Container>
  );
};

const Main = () => {
  const { toast } = useToast();
  const { data: roles } = useRoles();
  const { data: modules } = useModules();
  const { mutate: insertModule } = useInsertModule();

  const [module, setModule] = useState("");
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("roles");

  const createModule = async () => {
    insertModule(module, {
      onSuccess: (response) => {
        if (!response) return;
        if (response.acknowledged) {
          toast({
            title: "Creation Success",
            description: "Successfully added a new module.",
            variant: "success",
          });
          setOpen(false);
        }
      },
    });
  };

  return (
    <>
      <AnimatePresence>
        <Page className="w-full">
          <Tabs
            defaultValue={tab}
            className="w-full bg-slate-100 rounded-md p-2 flex flex-col items-start"
            onValueChange={(value) => setTab(value)}
          >
            <TabsList className="w-full justify-start">
              <TabsTrigger value="roles" className="font-semibold">
                Roles
              </TabsTrigger>
              <TabsTrigger value="modules" className="font-semibold">
                Permission Modules
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="roles"
              className="bg-white p-2 rounded-md w-full"
            >
              <Helmet>
                <title>Roles | Sales Platform</title>
              </Helmet>
              <div className="flex flex-col gap-2">
                <header className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Roles</h3>
                  <Button
                    asChild
                    variant="outline"
                    className="flex items-center gap-1.5 pl-2"
                  >
                    <Link to="./add">
                      <CirclePlus size={16} />
                      Add Role
                    </Link>
                  </Button>
                </header>
                <AnimatePresence>
                  <Page>
                    {roles && <DataTable columns={columns} data={roles} />}
                  </Page>
                </AnimatePresence>
              </div>
            </TabsContent>
            <TabsContent
              value="modules"
              className="bg-white p-2 rounded-md w-full"
            >
              <Helmet>
                <title>Modules | Sales Platform</title>
              </Helmet>
              <div className="flex flex-col gap-2">
                <header className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Modules</h3>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-1.5 pl-2"
                      >
                        <CirclePlus size={16} />
                        Add Module
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Module</DialogTitle>
                        <DialogDescription>
                          Enter the name of the new module below.
                        </DialogDescription>
                      </DialogHeader>
                      <Input
                        placeholder="Module name"
                        onChange={(e) => setModule(e.target.value)}
                      />
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={module.length === 0}
                          className="bg-main-100 hover:bg-main-400 text-white hover:text-white"
                          onClick={createModule}
                        >
                          Save
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </header>
                <AnimatePresence>
                  <Page>
                    {modules && (
                      <DataTable columns={moduleColumns} data={modules} />
                    )}
                  </Page>
                </AnimatePresence>
              </div>
            </TabsContent>
          </Tabs>
        </Page>
      </AnimatePresence>
    </>
  );
};

export default Roles;
