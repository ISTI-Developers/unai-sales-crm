import { columns } from "@/data/contracts.columns";
import { DataTable } from "@/data/data-table";
import Container from "@/misc/Container";
import { useContract } from "@/providers/contract.provider";
import { Helmet } from "react-helmet";

const Contracts = () => {
  const { contracts } = useContract();

  return (
    <Container title="Contracts">
      <Helmet>
        <title>Contracts | Sales CRM</title>
      </Helmet>
      {contracts && <DataTable columns={columns} data={contracts} size={10} />}
    </Container>
  );
};

export default Contracts;
