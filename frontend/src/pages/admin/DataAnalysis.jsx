import { IndianRupee, TrendingUp, MapPin, BarChart3 } from 'lucide-react';

const DataAnalysis = () => {
  const regionalData = [
    { state: 'Maharashtra', trend: 'High', growth: '+25%', cities: 'Mumbai, Pune' },
    { state: 'Gujarat', trend: 'High', growth: '+18%', cities: 'Ahmedabad, Surat' },
    { state: 'Rajasthan', trend: 'Medium', growth: '+12%', cities: 'Jaipur, Udaipur' },
    { state: 'Karnataka', trend: 'High', growth: '+22%', cities: 'Bangalore, Mysore' },
    { state: 'Tamil Nadu', trend: 'Medium', growth: '+15%', cities: 'Chennai, Coimbatore' },
    { state: 'Uttar Pradesh', trend: 'Low', growth: '+8%', cities: 'Lucknow, Kanpur' },
    { state: 'West Bengal', trend: 'Medium', growth: '+14%', cities: 'Kolkata, Siliguri' },
    { state: 'Delhi', trend: 'High', growth: '+28%', cities: 'Delhi NCR' }
  ];

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Data Analysis</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* India Map */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MapPin className="mr-2 text-primary" />
            Regional Trends - India Map
          </h2>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg h-96 flex items-center justify-center relative">
            <div className="text-center">
              <div className="text-8xl mb-4">🗺️</div>
              <p className="text-gray-600 font-medium">Interactive India Map</p>
              <p className="text-sm text-gray-500">Click on states to view detailed analytics</p>
            </div>
            {/* Trend indicators on map */}
            <div className="absolute top-10 left-20 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-16 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute bottom-32 left-32 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-24 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Regional Stats Sidebar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="mr-2 text-primary" />
            Regional Performance
          </h3>
          <div className="space-y-3">
            {regionalData.slice(0, 6).map((region, index) => (
              <div key={index} className="border-l-4 border-primary pl-3 py-2">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-gray-900">{region.state}</h4>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTrendColor(region.trend)}`}>
                    {region.trend}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{region.cities}</p>
                <p className="text-sm font-medium text-green-600">{region.growth} growth</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Analysis Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Detailed Regional Analysis</h3>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600 transition-colors">
            Export Report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Major Cities</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {regionalData.map((region, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {region.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTrendColor(region.trend)}`}>
                      {region.trend}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="text-green-600 font-medium">{region.growth}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {region.cities}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{(Math.random() * 1000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataAnalysis;
