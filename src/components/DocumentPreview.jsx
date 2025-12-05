export default function DocumentPreview({ selectedDoc }) {
  if (!selectedDoc)
    return <h2 className="text-gray-400 text-lg">No Document Selected</h2>;

  return (
    <div className="text-left w-full">
      <h2 className="text-xl font-semibold mb-4">Document Details</h2>

      <p>
        <b>Uploaded By:</b> {selectedDoc.uploadedBy}
      </p>
      <p>
        <b>Date:</b> {selectedDoc.date}
      </p>
      <p>
        <b>Type:</b> {selectedDoc.type}
      </p>
      <p>
        <b>Category:</b> {selectedDoc.category}
      </p>

      <img
        src={selectedDoc.image}
        alt="Preview"
        className="mt-4 w-full rounded"
      />
    </div>
  );
}
