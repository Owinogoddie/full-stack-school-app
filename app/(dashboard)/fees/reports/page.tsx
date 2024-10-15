export default function Reports() {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Fee Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReportCard title="Collection Summary" description="Overview of fee collection for all classes" />
          <ReportCard title="Outstanding Fees" description="List of students with pending fee payments" />
          <ReportCard title="Payment Trends" description="Analysis of fee payment patterns over time" />
          <ReportCard title="Fee Type Breakdown" description="Distribution of collected fees by fee type" />
          <ReportCard title="Class-wise Collection" description="Comparison of fee collection across different classes" />
          <ReportCard title="Yearly Comparison" description="Year-over-year comparison of fee collection" />
        </div>
      </div>
    )
  }
  
  function ReportCard({ title, description }: { title: string; description: string }) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Generate Report</button>
      </div>
    )
  }