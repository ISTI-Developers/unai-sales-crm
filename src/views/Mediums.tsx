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
import { MediumCompany } from "@/interfaces/mediums.interface";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import { useCompany } from "@/providers/company.provider";
import { useMedium } from "@/providers/mediums.provider";
import { AnimatePresence } from "framer-motion";
import { CirclePlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { Helmet } from "react-helmet";

const Mediums = () => {
  const { mediumsOfCompanies, insertMediums, setReload } = useMedium();
  const { companies } = useCompany();
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
    const response = await insertMediums(data);
    if (response.acknowledged) {
      toast({
        variant: "success",
        description: "New medium added.",
      });
      setReload((prev) => (prev = prev + 1));
    } else {
      console.log(response);
      toast({
        variant: "destructive",
        title: "An Error Occured",
        description: response.error ?? "Please contact the IT team.",
      });
    }
  };

  // const isExistingMedium: string[] = useMemo(() => {
  //   if (name.length === 0 || !mediumsOfCompanies) return [];

  //   const fuse = new Fuse(mediumsOfCompanies, {
  //     threshold: 0.3,
  //     keys: ["name"],
  //   });

  //   const messages: string[] = [];
  //   const results = fuse.search(name);
  //   if (results.length > 0) {
  //     results.forEach((result) => {
  //       messages.push(result.item.name);
  //     });
  //   }

  //   return messages;
  // }, [mediumsOfCompanies, mediums]);
  return (
    <Container title="Mediums">
      <Helmet>
        <title>Mediums | Sales CRM</title>
      </Helmet>
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
      <AnimatePresence>
        <Page className="w-full">
          {mediumsOfCompanies && (
            <DataTable columns={columns} data={mediumsOfCompanies} />
          )}
        </Page>
      </AnimatePresence>
    </Container>
  );
};

export default Mediums;
