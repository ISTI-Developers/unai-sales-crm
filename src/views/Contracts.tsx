import { columns } from "@/data/contracts.columns";
import { DataTable } from "@/data/data-table";
import Container from "@/misc/Container";
import { ContractProvider, useContract } from "@/providers/contract.provider";
import { Helmet } from "react-helmet";

const Contracts = () => {
  return (
    <ContractProvider>
      <Main />
    </ContractProvider>
  );
};

const Main = () => {
  const { contracts } = useContract();

  return (
    <Container title="Contracts">
      <Helmet>
        <title>Contracts | Sales Platform</title>
      </Helmet>
      {contracts && <DataTable columns={columns} data={contracts} />}
    </Container>
  );
};
export default Contracts;
