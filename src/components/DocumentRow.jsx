export default function DocumentRow({ item, onClick }) {
  return (
    <tr
      className="border-b border-gray-800 hover:bg-[#1b222c] cursor-pointer"
      onClick={onClick}
    >
      <td className="p-3">
        <input type="checkbox" className="w-4 h-4" />
      </td>

      {/* STATUS DOT */}
      <td className="p-3">
        <span
          className={`w-3 h-3 inline-block rounded-full ${
            item.status === "approved"
              ? "bg-green-500"
              : item.status === "pending"
              ? "bg-blue-500"
              : "bg-gray-500"
          }`}
        ></span>
      </td>

      <td className="p-3 flex items-center gap-2">
        <img src={item.userImage} alt="User" className="w-8 h-8 rounded-full" />
        {item.uploadedBy}
      </td>

      <td className="p-3">{item.date}</td>

      <td className="p-3">{item.type}</td>

      <td className="p-3">{item.category}</td>
    </tr>
  );
}
