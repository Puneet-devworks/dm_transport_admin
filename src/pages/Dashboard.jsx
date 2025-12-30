import DocumentCard from "../components/DocumentCard";

const summaryStats = [
  { label: "Active Chats", value: "148", trend: "+12% vs last week" },
  { label: "Pending Documents", value: "1,294", trend: "324 need review" },
  { label: "Open Tasks", value: "37", trend: "8 high priority" },
  { label: "Response Time", value: "4m 12s", trend: "Within SLA" },
];

const analyticsInsights = [
  {
    title: "Chat Intelligence",
    description: "Analyze chat messages across the panel in real time.",
    tag: "AI Analytics",
  },
  {
    title: "Tone & Language Review",
    description:
      "Evaluate tone and language used by drivers and employees.",
    tag: "Quality",
  },
  {
    title: "Response Risk Detection",
    description:
      "Detect delayed responses and inappropriate or unprofessional language.",
    tag: "Compliance",
  },
  {
    title: "Operational Reports",
    description:
      "Generate driver responsiveness and communication quality reports.",
    tag: "Reporting",
  },
];

const documents = [
  { title: "Pickup Docs", count: 2, priority: "High" },
  { title: "Delivery Proofs", count: 1, priority: "Normal" },
  { title: "Load Images", count: 141, priority: "High" },
  { title: "Fuel Receipts", count: 65, priority: "Normal" },
  { title: "Stamp Papers", count: 744, priority: "High" },
  { title: "Driver Expenses", count: 56, priority: "Normal" },
  { title: "Trip Envelopes", count: 170, priority: "Normal" },
  { title: "City Worksheets", count: 126, priority: "Normal" },
  { title: "Trip Envelopes (DM Trans)", count: 0, priority: "Low" },
  { title: "Repair & Maintenance", count: 69, priority: "Normal" },
  { title: "CTPAT", count: 61, priority: "Normal" },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-8">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">
            DM Transport Admin Panel
          </p>
          <h2 className="text-3xl font-semibold text-gray-100">
            Dashboard Overview
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xl">
            Track the rebuild milestones, monitor chat responsiveness, and stay
            ahead of document compliance with a responsive, modernized control
            center.
          </p>
        </div>
        <div className="bg-[#11161c] border border-gray-700 rounded-2xl p-4 w-full lg:w-[340px]">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>System status</span>
            <span className="text-emerald-400 font-medium">Operational</span>
          </div>
          <div className="mt-4 space-y-3 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>Chat latency</span>
              <span className="text-gray-100">1.4s avg</span>
            </div>
            <div className="flex justify-between">
              <span>Sync refresh</span>
              <span className="text-gray-100">Every 30s</span>
            </div>
            <div className="flex justify-between">
              <span>Last update</span>
              <span className="text-gray-100">2 minutes ago</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#161b22] border border-gray-700 rounded-2xl p-5"
          >
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className="text-2xl font-semibold text-gray-100 mt-2">
              {stat.value}
            </p>
            <p className="text-xs text-emerald-400 mt-2">{stat.trend}</p>
          </div>
        ))}
      </section>

      <section className="bg-[#11161c] border border-gray-700 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              AI Analytics Readiness
            </h3>
            <p className="text-sm text-gray-400">
              Panel-specific intelligence cards aligned with the agreement.
            </p>
          </div>
          <span className="text-xs text-emerald-400 font-medium">
            Milestone 4 preview
          </span>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {analyticsInsights.map((insight) => (
            <div
              key={insight.title}
              className="bg-[#161b22] border border-gray-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-100">
                  {insight.title}
                </p>
                <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300">
                  {insight.tag}
                </span>
              </div>
              <p className="text-xs text-gray-400">{insight.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-100">
              Unseen Documents
            </h3>
            <p className="text-sm text-gray-400">
              Prioritized queues aligned to compliance objectives.
            </p>
          </div>
          <span className="bg-red-600 text-xs px-3 py-1 rounded-full text-white">
            999+ pending
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {documents.map((doc) => (
            <div key={doc.title} className="relative">
              <DocumentCard title={doc.title} count={doc.count} />
              <span
                className={`absolute top-4 right-4 text-[10px] uppercase tracking-wide px-2 py-1 rounded-full ${
                  doc.priority === "High"
                    ? "bg-red-500/20 text-red-300"
                    : doc.priority === "Low"
                    ? "bg-gray-500/20 text-gray-300"
                    : "bg-amber-500/20 text-amber-200"
                }`}
              >
                {doc.priority}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
