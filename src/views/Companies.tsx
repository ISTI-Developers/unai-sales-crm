import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Container from "@/misc/Container";
import { useCompany } from "@/providers/company.provider";
import { CirclePlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { v4 } from "uuid";
import { AnimatePresence, motion } from "framer-motion";
import Page from "@/misc/Page";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import AddCompany from "@/pages/companies/add.companies";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Company } from "@/interfaces/company.interface";
import { SalesGroup } from "@/interfaces/user.interface";
import { Helmet } from "react-helmet";
import EditCompany from "@/pages/companies/edit.companies";

const Companies = () => {
  return (
    <Container title="Companies">
      <Helmet>
        <title>Companies | Sales CRM Dashboard</title>
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
  const { companies } = useCompany();

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

  useEffect(() => {
    if (lastOpenedTab) {
      setCurrentTab(lastOpenedTab);
    }
  }, [lastOpenedTab]);
  return (
    <Tabs
      defaultValue={list[0].code}
      value={currentTab}
      className="bg-slate-100 rounded-md p-2 flex flex-col items-start"
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
        <Button
          asChild
          key="edit_button"
          type="button"
          variant="ghost"
          className="ml-auto bg-main-100 hover:bg-main-700 text-white"
          onClick={() =>
            localStorage.setItem(
              "company",
              list.find((item) => item.code === currentTab)?.ID
            )
          }
        >
          <Link to={`/companies/${currentTab}/edit`}>Edit Company</Link>
        </Button>
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
  const { salesGroupCompanies } = useCompany();

  const companySalesGroups: SalesGroup[] | [] = useMemo(() => {
    if (!company_id || !salesGroupCompanies) return [];

    if (salesGroupCompanies.length > 0) {
      return salesGroupCompanies.filter(
        (item) => item.company_id === company_id
      );
    } else {
      return [];
    }
  }, [company_id, salesGroupCompanies]);
  return companySalesGroups.length > 0 ? (
    <Accordion type="single" collapsible>
      {companySalesGroups.map((group) => {
        return (
          <AccordionItem value={group.sales_unit_name}>
            <AccordionTrigger>{group.sales_unit_name}</AccordionTrigger>
            <AccordionContent>
              <div>
                <p>
                  <span className="font-semibold">Sales Unit Head:</span>{" "}
                  {group.sales_unit_head?.full_name || "N/A"}
                </p>
                <p className="font-semibold">Sales Unit Members:</p>
                {group.sales_unit_members?.map((member) => {
                  return <p key={v4()}>{member?.full_name}</p>;
                }) || "N/A"}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  ) : (
    <span className="text-slate-400 text-center w-full">
      No Sales Group found in this company. Click the Edit Company button to add
      now!
    </span>
  );
};
export default Companies;
