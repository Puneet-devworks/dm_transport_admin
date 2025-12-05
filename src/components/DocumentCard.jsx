export default function DocumentCard({ title, count }) {
  return (
    <div className="bg-[#161b22] p-6 rounded-xl border border-gray-700 hover:bg-[#1f242b] transition">
      <h3 className="text-md font-medium text-gray-300">{title}</h3>
      <p className="text-3xl font-semibold mt-2">{count}</p>
    </div>
  );
}
