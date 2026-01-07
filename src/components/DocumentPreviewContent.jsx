import { Button } from "./ui/button";

export default function DocumentPreviewContent({ selectedDoc }) {
  if (!selectedDoc) return null;

  const url = selectedDoc.document_url;
  const cleanURL = url?.split("?")[0];
  const ext = cleanURL?.split(".").pop()?.toLowerCase();

  const isPDF = ext === "pdf";
  const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);

  return (
    <div className="space-y-6 text-white">
      {/* Document Information */}
      <div className="space-y-4 p-4 rounded-lg border border-gray-700 bg-[#161b22]">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Uploaded By
            </span>
            <p className="text-sm font-semibold text-white">
              {selectedDoc.driver_name || "Unknown"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Date
            </span>
            <p className="text-sm font-semibold text-white">
              {new Date(selectedDoc.date).toLocaleDateString()}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Type
            </span>
            <p className="text-sm font-semibold text-white">
              {selectedDoc.type || "—"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Category
            </span>
            <p className="text-sm font-semibold text-white">
              {selectedDoc.feature || "—"}
            </p>
          </div>
        </div>
        {selectedDoc.note && (
          <div className="pt-4 border-t border-gray-700">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-2">
              Note
            </span>
            <p className="text-sm text-gray-300">{selectedDoc.note}</p>
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div className="w-full rounded-lg overflow-hidden bg-black/20 border border-gray-700 min-h-[500px] flex items-center justify-center">
        {isImage && (
          <img
            src={url}
            alt="Document Preview"
            className="max-h-full max-w-full object-contain"
          />
        )}

        {isPDF && (
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(
              url
            )}&embedded=true`}
            className="w-full h-[600px] rounded"
            title="PDF Preview"
          />
        )}

        {!isImage && !isPDF && (
          <div className="text-center p-8 space-y-4">
            <p className="text-sm text-gray-400">
              Unable to preview this file type.
            </p>
            <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open File
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

