
import ContractList from "../components/ContractsAndPayments/ContractList.tsx";

export default function ContractsPage() {
  return (
    <div className="space-y-4" style={{ direction: "rtl" }}>
      <ContractList type="client" />
    </div>
  );
}
