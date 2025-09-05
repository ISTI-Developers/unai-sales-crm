import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Container from "@/misc/Container";
import { CirclePlus, Pen, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Page from "@/misc/Page";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import AddCompany from "@/pages/companies/add.company";
import { Company } from "@/interfaces/company.interface";
import { SalesGroup } from "@/interfaces/user.interface";
import { Helmet } from "react-helmet";
import EditCompany from "@/pages/companies/edit.company";
import { useCompanies, useSalesUnits } from "@/hooks/useCompanies";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
const Companies = () => {
  return (
    <Container title="Companies">
      <Helmet>
        <title>Companies | Sales Platform</title>
      </Helmet>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/:id" element={<Navigate to="/companies" replace />} />
        <Route path="/add" element={<AddCompany />} />
        <Route path="/:id/edit" element={<EditCompany />} />
      </Routes>
    </Container>
  );
};

const Main = () => {
  const { data: companies } = useCompanies();

  return (
    <>
      <header className="flex items-center justify-between">
        <Button
          asChild
          variant="outline"
          className="flex items-center gap-1.5 pl-2"
        >
          <Link to="./add">
            <CirclePlus size={16} />
            Add Company
          </Link>
        </Button>
      </header>
      <AnimatePresence>
        <Page className="w-full">
          {!companies ? (
            <>No companies found</>
          ) : companies.length === 0 ? (
            <>Loading companies...</>
          ) : (
            <CompanyTabs list={companies} />
          )}
        </Page>
      </AnimatePresence>
    </>
  );
};

const CompanyTabs = ({ list }: { list: Company[] }) => {
  const lastOpenedTab = localStorage.getItem("lastCompanyTab");
  const [currentTab, setCurrentTab] = useState(list[0].code);

  const onDelete = () => {
    toast({
      description: "ONGOING",
    });
  };

  useEffect(() => {
    if (lastOpenedTab) {
      setCurrentTab(lastOpenedTab);
    }
  }, [lastOpenedTab]);
  const currentCompany = useMemo(() => {
    return list.find((item) => item.code === currentTab);
  }, [list, currentTab]);
  return (
    <Tabs
      defaultValue={list[0].code}
      value={currentTab}
      className="bg-zinc-100 rounded-md p-2 flex flex-col items-start"
      onValueChange={(value) => {
        localStorage.setItem("lastCompanyTab", value);
        setCurrentTab(value);
      }}
    >
      <TabsList className="w-full">
        {list.map((company) => {
          return (
            <TabsTrigger
              key={company.ID}
              value={company.code}
              className="overflow-hidden uppercase"
            >
              <motion.p
                key={currentTab === company.code ? "name" : "code"}
                initial={{
                  y: currentTab !== company.code ? 0 : 20,
                }}
                animate={{ y: 0 }}
                exit={{ y: 20 }}
                transition={{
                  ease: "easeInOut",
                  duration: 0.2,
                  type: "spring",
                }}
              >
                {currentTab === company.code ? company.name : company.code}
              </motion.p>
            </TabsTrigger>
          );
        })}
        {currentCompany && (
          <div className="ml-auto flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  key="edit_button"
                  type="button"
                  variant="ghost"
                  className=" text-amber-400 hover:bg-amber-400 hover:text-white p-0 px-2.5"
                  onClick={() =>
                    localStorage.setItem("company", String(currentCompany.ID))
                  }
                >
                  <Link
                    to={`/companies/${currentCompany.name.replace(
                      / /g,
                      "_"
                    )}/edit`}
                  >
                    <Pen size={20} />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Company</TooltipContent>
            </Tooltip>
            <Dialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      key="delete_button"
                      type="button"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-400 hover:text-white p-0 px-2.5"
                    >
                      <Trash2 size={20} />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Delete Company</TooltipContent>
              </Tooltip>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Deleting{" "}
                    <span className="font-semibold">{currentCompany.name}</span>{" "}
                    will also permanently remove its associated sales units and
                    unlink it from all users. Are you sure you want to continue?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive" onClick={onDelete}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </TabsList>
      {list.map((company) => {
        return (
          <TabsContent
            key={company.code}
            value={company.code}
            className="bg-white p-2 rounded-md w-full"
          >
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                ease: "easeInOut",
                duration: 0.5,
                type: "spring",
              }}
            >
              <CompanyTabContent company_id={company.ID} />
            </motion.div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

const CompanyTabContent = ({ company_id }: { company_id: number }) => {
  const { data: salesUnits } = useSalesUnits();

  const units: SalesGroup[] | [] = useMemo(() => {
    if (!company_id || !salesUnits) return [];

    return salesUnits.filter((item) => item.company_id === company_id);
  }, [company_id, salesUnits]);

  return units.length > 0 ? (
    <div className="flex flex-wrap w-full gap-4">
      {units.map((unit) => {
        return (
          <Card
            key={unit.sales_unit_id}
            className="w-full min-w-[280px] max-w-full sm:max-w-[300px] lg:max-w-[450px] flex-1"
          >
            <CardHeader className="text-center p-2 py-4">
              {unit.sales_unit_name}
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center justify-between capitalize">
                <p>{unit.sales_unit_head?.full_name}</p>
                <Label>Head</Label>
              </div>
              {unit.sales_unit_members &&
                unit.sales_unit_members.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label>Member/s</Label>
                      {unit.sales_unit_members.map((member) => {
                        return (
                          <div key={member.full_name} className="capitalize">
                            <p>{member.full_name}</p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  ) : (
    // <Accordion type="single" collapsible>
    //   {companySalesGroups.map((group) => {
    //     return (
    //       <AccordionItem value={group.sales_unit_name}>
    //         <AccordionTrigger>{group.sales_unit_name}</AccordionTrigger>
    //         <AccordionContent>
    //           <div>
    //             <p>
    //               <span className="font-semibold">Sales Unit Head:</span>{" "}
    //               {group.sales_unit_head?.full_name || "N/A"}
    //             </p>
    //             <p className="font-semibold capitalize">Sales Unit Members:</p>
    //             {group.sales_unit_members?.map((member) => {
    //               return <p key={v4()} className="capitalize">{member?.full_name}</p>;
    //             }) || "N/A"}
    //           </div>
    //         </AccordionContent>
    //       </AccordionItem>
    //     );
    //   })}
    // </Accordion>
    <span className="text-slate-400 text-center w-full">
      No Sales Group found in this company. Click the Edit Company button to add
      now!
    </span>
  );
};

export default Companies;
