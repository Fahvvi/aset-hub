import React from 'react';
import { 
  Box, CheckCircle, Wrench, XCircle, 
  Calendar, MoreVertical, Laptop, Armchair, Car
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import useAuthStore from '../../store/authStore';

// --- DUMMY DATA ---
const lineChartData = [
  { name: 'Jan', aktif: 780, baru: 250, nonaktif: 40 },
  { name: 'Feb', aktif: 850, baru: 300, nonaktif: 45 },
  { name: 'Mar', aktif: 950, baru: 350, nonaktif: 50 },
  { name: 'Apr', aktif: 970, baru: 360, nonaktif: 60 },
  { name: 'Mei', aktif: 1050, baru: 380, nonaktif: 70 },
  { name: 'Jun', aktif: 1100, baru: 450, nonaktif: 100 },
];

const pieChartData = [
  { name: 'Perangkat IT', value: 562, color: '#4F46E5' },
  { name: 'Perabot', value: 312, color: '#10B981' },
  { name: 'Kendaraan', value: 187, color: '#F59E0B' },
  { name: 'Mesin', value: 125, color: '#8B5CF6' },
  { name: 'Lainnya', value: 62, color: '#94A3B8' },
];

const maintenanceAlerts = [
  { id: 1, name: 'Laptop Dell Latitude 5420', code: 'IT-2023-0128', daysLeft: 7, icon: Laptop },
  { id: 2, name: 'AC Daikin 2 PK', code: 'AC-2022-0045', daysLeft: 10, icon: Box },
  { id: 3, name: 'Mobil Toyota Avanza', code: 'KB-2021-0003', daysLeft: 15, icon: Car },
];

const recentAssets = [
  { id: 1, name: 'MacBook Air M2', code: 'IT-2024-0156', category: 'Perangkat IT', loc: 'Kantor Pusat', status: 'Aktif', date: '15 Mei 2024', icon: Laptop },
  { id: 2, name: 'Kursi Kantor Ergonomic', code: 'INV-2024-0098', category: 'Perabot', loc: 'Kantor Pusat', status: 'Aktif', date: '14 Mei 2024', icon: Armchair },
  { id: 3, name: 'Printer HP LaserJet Pro', code: 'IT-2024-0155', category: 'Perangkat IT', loc: 'Kantor Cabang', status: 'Aktif', date: '14 Mei 2024', icon: Box },
  { id: 4, name: 'Mobil Mitsubishi Xpander', code: 'KB-2024-0007', category: 'Kendaraan', loc: 'Kantor Pusat', status: 'Aktif', date: '13 Mei 2024', icon: Car },
  { id: 5, name: 'Mesin Generator 5000W', code: 'MSN-2024-0012', category: 'Mesin & Peralatan', loc: 'Gudang', status: 'Pemeliharaan', date: '12 Mei 2024', icon: Wrench },
];

const activeLoans = [
  { id: 1, user: 'Budi Santoso', asset: 'Laptop Lenovo ThinkPad', returnDate: '20 Mei 2024', initials: 'BS', bg: 'bg-blue-100 text-blue-700' },
  { id: 2, user: 'Siti Aisyah', asset: 'Proyektor Epson X12', returnDate: '22 Mei 2024', initials: 'SA', bg: 'bg-pink-100 text-pink-700' },
  { id: 3, user: 'Rizky Pratama', asset: 'Kursi Kantor Ergonomic', returnDate: '25 Mei 2024', initials: 'RP', bg: 'bg-green-100 text-green-700' },
];

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 break-words">
          Selamat datang, {user?.nama?.split(' ')[0] || 'Admin'}.
        </h1>
        <p className="text-sm md:text-base text-gray-500">Kelola dan pantau aset perusahaan dengan mudah.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-2">
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 md:gap-4">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-50 text-primary flex items-center justify-center shrink-0">
            <Box className="fill-blue-100 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Total Aset</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">1.248</h3>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 truncate">Semua aset terdaftar</p>
          </div>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 md:gap-4">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-green-50 text-success flex items-center justify-center shrink-0">
            <CheckCircle className="fill-green-100 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Aset Aktif</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">1.028</h3>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 truncate">82.4% dari total aset</p>
          </div>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 md:gap-4">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-yellow-50 text-warning flex items-center justify-center shrink-0">
            <Wrench className="fill-yellow-100 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Dalam Pemeliharaan</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">145</h3>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 truncate">11.6% dari total aset</p>
          </div>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 md:gap-4">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-red-50 text-danger flex items-center justify-center shrink-0">
            <XCircle className="fill-red-100 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Tidak Aktif</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">75</h3>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 truncate">6.0% dari total aset</p>
          </div>
        </div>
      </div>

      {/* Charts & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Line Chart */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm lg:col-span-2 w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 md:mb-6">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">Ringkasan Aset</h3>
            <select className="text-xs md:text-sm border border-gray-200 rounded-md text-gray-500 py-1.5 pl-2 pr-6 outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto">
              <option>6 Bulan Terakhir</option>
              <option>Tahun Ini</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 text-[10px] md:text-xs font-medium">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-1 md:w-3 md:h-1 rounded-full bg-primary"></div><span className="text-gray-500">Aset Aktif</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-1 md:w-3 md:h-1 rounded-full bg-success"></div><span className="text-gray-500">Aset Baru</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-1 md:w-3 md:h-1 rounded-full bg-danger"></div><span className="text-gray-500">Aset Nonaktif</span></div>
          </div>
          <div className="h-56 md:h-64 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                <Line type="monotone" dataKey="aktif" stroke="#4F46E5" strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="baru" stroke="#10B981" strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="nonaktif" stroke="#F43F5E" strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm lg:col-span-1 flex flex-col">
          <h3 className="font-semibold text-gray-800 text-sm md:text-base mb-2">Aset Berdasarkan Kategori</h3>
          <div className="h-40 md:h-48 w-full relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieChartData} innerRadius="60%" outerRadius="90%" paddingAngle={2} dataKey="value" stroke="none">
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 md:gap-2 mt-2 flex-1">
            {pieChartData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] md:text-xs">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600 font-medium truncate">{item.name}</span>
                </div>
                <span className="text-gray-400 font-medium shrink-0">{item.value}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-xs font-medium text-primary bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            Lihat Semua Kategori
          </button>
        </div>

        {/* Maintenance Alerts */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm lg:col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-4 md:mb-5">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">Mendekati Pemeliharaan</h3>
            <Calendar size={16} className="text-success shrink-0" />
          </div>
          <div className="flex flex-col gap-3 md:gap-4 flex-1">
            {maintenanceAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2.5 md:gap-3 min-w-0 pr-2">
                  <div className="h-8 w-8 md:h-10 md:w-10 shrink-0 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                    <alert.icon className="text-gray-500 w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-semibold text-gray-800 truncate">{alert.name}</p>
                    <p className="text-[10px] md:text-xs text-gray-400 truncate">{alert.code}</p>
                  </div>
                </div>
                <div className="bg-orange-50 text-warning px-2 py-1 md:px-2.5 rounded-md text-[10px] md:text-xs font-medium whitespace-nowrap shrink-0">
                  {alert.daysLeft} hari
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-auto pt-4 text-xs font-medium text-success bg-green-50 hover:bg-green-100 rounded-lg transition-colors py-2">
            Lihat Semua
          </button>
        </div>

      </div>

      {/* Bottom Section: Tables & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 pb-6">
        
        {/* Recent Assets Table */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm lg:col-span-3 w-full overflow-hidden">
          <div className="flex justify-between items-center mb-4 md:mb-5">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">Aset Terbaru</h3>
            <button className="text-xs md:text-sm text-primary font-medium hover:underline">Lihat Semua</button>
          </div>
          <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
            <table className="w-full text-left text-xs md:text-sm text-gray-600 min-w-[700px]">
              <thead className="text-[11px] md:text-xs text-gray-400 bg-gray-50/50">
                <tr>
                  <th className="font-medium px-4 py-2.5 md:py-3 rounded-l-lg whitespace-nowrap">Nama Aset</th>
                  <th className="font-medium px-4 py-2.5 md:py-3 whitespace-nowrap">Kode Aset</th>
                  <th className="font-medium px-4 py-2.5 md:py-3 whitespace-nowrap">Kategori</th>
                  <th className="font-medium px-4 py-2.5 md:py-3 whitespace-nowrap">Lokasi</th>
                  <th className="font-medium px-4 py-2.5 md:py-3 whitespace-nowrap">Status</th>
                  <th className="font-medium px-4 py-2.5 md:py-3 whitespace-nowrap">Tanggal</th>
                  <th className="font-medium px-4 py-2.5 md:py-3 rounded-r-lg"></th>
                </tr>
              </thead>
              <tbody>
                {recentAssets.map((asset) => (
                  <tr key={asset.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5 md:py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 md:gap-3">
                        <asset.icon size={14} className="text-gray-500 md:w-4 md:h-4" />
                        <span className="font-medium text-gray-800">{asset.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 md:py-3 whitespace-nowrap">{asset.code}</td>
                    <td className="px-4 py-2.5 md:py-3 whitespace-nowrap">{asset.category}</td>
                    <td className="px-4 py-2.5 md:py-3 whitespace-nowrap">{asset.loc}</td>
                    <td className="px-4 py-2.5 md:py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                        asset.status === 'Aktif' ? 'bg-green-50 text-success' : 'bg-yellow-50 text-warning'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 md:py-3 whitespace-nowrap text-xs">{asset.date}</td>
                    <td className="px-4 py-2.5 md:py-3 text-right">
                      <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={14} className="md:w-4 md:h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Loans / Transfers */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm lg:col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-4 md:mb-5">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">Peminjaman Aktif</h3>
            <div className="bg-purple-100 text-purple-600 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full shrink-0">12</div>
          </div>
          <div className="flex flex-col gap-3 md:gap-4 flex-1">
            {activeLoans.map((loan) => (
              <div key={loan.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 md:gap-3 min-w-0 pr-2">
                  <div className={`h-8 w-8 md:h-10 md:w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${loan.bg}`}>
                    {loan.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-semibold text-gray-800 truncate">{loan.user}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 truncate">{loan.asset}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-1">
                  <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-semibold">Kembali</p>
                  <p className="text-[10px] md:text-xs text-gray-700 font-medium">{loan.returnDate.split(' ')[0]} {loan.returnDate.split(' ')[1]}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-auto pt-4 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors py-2">
            Lihat Semua Peminjaman
          </button>
        </div>

      </div>
    </div>
  );
}