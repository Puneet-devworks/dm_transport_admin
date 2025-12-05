import DocumentCard from "../components/DocumentCard";

const documents = [
  { title: "Pickup Doc", count: 2 },
  { title: "Delivery Proof", count: 1 },
  { title: "Load Image", count: 141 },
  { title: "Fuel Receipt", count: 65 },
  { title: "Stamp Paper", count: 744 },
  { title: "Driver Expense", count: 56 },
  { title: "DM Transport Trip Envelope", count: 170 },
  { title: "DM Transport City Worksheet", count: 126 },
  { title: "DM Trans Inc Trip Envelope", count: 0 },
  { title: "Repair and Maintenance", count: 69 },
  { title: "CTPAT", count: 61 },
];

export default function Dashboard() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        Unseen Documents
        <span className="bg-red-600 text-xs px-2 py-1 rounded-full">999+</span>
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {documents.map((doc, index) => (
          <DocumentCard key={index} title={doc.title} count={doc.count} />
        ))}
      </div>
    </div>
  );
}
