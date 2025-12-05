// import DocumentRow from "./DocumentRow";
// import Loader from "./Loader";

// export default function DocumentTable({ documents, loading, setSelectedDoc }) {
//   return (
//     <>
//       {/* SEARCH BAR & FILTERS */}
//       <div className="flex items-center gap-3 mb-4">
//         <input type="checkbox" className="w-4 h-4 cursor-pointer" />
//         <span>Select All</span>

//         <input
//           type="text"
//           placeholder="Search..."
//           className="bg-[#1d232a] px-3 py-2 rounded w-60 outline-none"
//         />
//       </div>

//       {/* DOCUMENT TABLE */}
//       <table className="w-full text-left">
//         <thead>
//           <tr className="border-b border-gray-700 text-gray-400">
//             <th className="p-3">Select</th>
//             <th className="p-3">Status</th>
//             <th className="p-3">Uploaded By</th>
//             <th className="p-3">Date</th>
//             <th className="p-3">Type</th>
//             <th className="p-3">Category</th>
//           </tr>
//         </thead>

//         <tbody>
//           {loading ? (
//             <tr>
//               <td colSpan="6">
//                 <Loader />
//               </td>
//             </tr>
//           ) : documents.length === 0 ? (
//             <tr>
//               <td colSpan="6" className="text-center py-6 text-gray-400">
//                 No Documents Found
//               </td>
//             </tr>
//           ) : (
//             documents.map((doc) => (
//               <DocumentRow
//                 key={doc._id}
//                 item={doc}
//                 onClick={() => setSelectedDoc(doc)}
//               />
//             ))
//           )}
//         </tbody>
//       </table>

//       <p className="mt-5 text-sm text-gray-400">
//         Total Documents: {documents.length}
//       </p>
//     </>
//   );
// }

import DocumentRow from "./DocumentRow";
import Loader from "./Loader";

export default function DocumentTable({ documents, loading, setSelectedDoc }) {
  return (
    <>
      {/* SEARCH BAR */}
      <div className="flex items-center gap-3 mb-4">
        <input type="checkbox" className="w-4 h-4 cursor-pointer" />
        <span>Select All</span>

        <input
          type="text"
          placeholder="Search..."
          className="bg-[#1d232a] px-3 py-2 rounded w-60 outline-none"
        />
      </div>

      {/* TABLE */}
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400">
            <th className="p-3">Select</th>
            <th className="p-3">Status</th>
            <th className="p-3">Uploaded By</th>
            <th className="p-3">Date</th>
            <th className="p-3">Type</th>
            <th className="p-3">Category</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6">
                <Loader />
              </td>
            </tr>
          ) : documents.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-6 text-gray-400">
                No Documents Found
              </td>
            </tr>
          ) : (
            documents.map((doc) => (
              <DocumentRow
                key={doc._id}
                item={doc}
                onClick={() => setSelectedDoc(doc)}
              />
            ))
          )}
        </tbody>
      </table>

      <p className="mt-5 text-sm text-gray-400">
        Total Documents: {documents.length}
      </p>
    </>
  );
}
