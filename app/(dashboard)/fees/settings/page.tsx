export default function FeeSettings() {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Fee Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingCard title="Payment Methods" description="Configure accepted payment methods" />
          <SettingCard title="Late Fee Rules" description="Set up rules for late fee calculation" />
          <SettingCard title="Discount Policies" description="Define discount policies for different scenarios" />
          <SettingCard title="Invoice Templates" description="Customize fee invoice templates" />
          <SettingCard title="Notification Settings" description="Configure fee reminder notifications" />
          <SettingCard title="Academic Year Setup" description="Set up academic years and terms" />
        </div>
      </div>
    )
  }
  
  function SettingCard({ title, description }: { title: string; description: string }) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Configure</button>
      </div>
    )
  }