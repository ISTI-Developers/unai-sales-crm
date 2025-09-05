import AddMedium from "@/components/mediums/add.mediums";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/data/data-table";
import { columns } from "@/data/medium.columns";
import { useToast } from "@/hooks/use-toast";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyMediums, useInsertMedium } from "@/hooks/useMediums";
import { MediumCompany } from "@/interfaces/mediums.interface";
import Container from "@/misc/Container";
import Page from "@/misc/Page";

import { AnimatePresence } from "framer-motion";
import { CirclePlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { Helmet } from "react-helmet";

const Mediums = () => {
  const { data: companyMediums } = useCompanyMediums();
  const { mutate: insertMediums } = useInsertMedium();
  const { data: companies } = useCompanies();
  const { toast } = useToast();

  const [mediums, setMediums] = useState<MediumCompany[]>([
    { name: "", company: undefined },
  ]);

  const setMedium = (value: string, index: number, id: string) => {
    setMediums((prev) => {
      const updatedMediums = [...prev];

      updatedMediums[index] = {
        ...updatedMediums[index],
        [id]: value,
      };

      return updatedMediums;
    });
  };

  const addRow = () => {
    setMediums((prev) => {
      return [...prev, { name: "", company: undefined }];
    });
  };
  const removeRow = (index: number) => {
    setMediums((prev) => {
      const updatedMediums = [...prev];

      return updatedMediums.filter((_, i) => i !== index);
    });
  };

  const onSubmitNewMedium = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!companies) return;

    const data = [
      ...mediums.map((medium) => {
        const company = companies.find((comp) => comp.code === medium.company);
        return {
          ...medium,
          company: String(company?.ID),
        };
      }),
    ];
    insertMediums(data, {
      onSuccess: (data) => {
        if (data.acknowledged) {
          toast({
            variant: "success",
            description: "New medium added.",
          });
        }
      },
    });
  };
  return (
    <Container title="Mediums">
      <Helmet>
        <title>Mediums | Sales Platform</title>
      </Helmet>
      <AnimatePresence>
        <Page className="w-full">
          {companyMediums && (
            <DataTable columns={columns} data={companyMediums} size={100}>
              <header className="flex items-center gap-4">
                <Dialog
                  onOpenChange={() => {
                    setMediums([{ name: "", company: undefined }]);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-1.5 pl-2"
                    >
                      <CirclePlus size={16} />
                      New Medium
                    </Button>
                  </DialogTrigger>
                  <DialogContent aria-describedby="Form for adding mediums">
                    <DialogHeader>
                      <DialogTitle>Add New Medium</DialogTitle>
                    </DialogHeader>

                    <form className="flex flex-col gap-4">
                      <AddMedium
                        mediums={mediums}
                        setMedium={setMedium}
                        addRow={addRow}
                        removeRow={removeRow}
                        onSubmit={onSubmitNewMedium}
                      />
                    </form>
                  </DialogContent>
                </Dialog>
              </header>
            </DataTable>
          )}
        </Page>
      </AnimatePresence>
    </Container>
  );
};

export default Mediums;
