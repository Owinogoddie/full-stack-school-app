// app/fees/reports/collection-summary/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  CollectionFilters,
  CollectionSummary,
  getCollectionSummary,
} from "@/actions/fees/reports/actions";
import { StatCard } from "../components/StatCard";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { Filters } from "./Filters";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function CollectionSummaryPage() {
  const [data, setData] = useState<CollectionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const currentData = await getCollectionSummary({});
        setData(currentData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);
  const handleFilterChange = useCallback(async (newFilters: CollectionFilters) => {
    try {
      setLoading(true);
      const result = await getCollectionSummary(newFilters);
      setData(result);
    } catch (error) {
      console.error('Error fetching collection summary:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Collection Summary</h1>
        <p className="mt-2 text-sm text-gray-600">
          Comprehensive overview of fee collection status
        </p>
      </div>

      <Filters onFilterChange={handleFilterChange} />

      {loading ? (
        <>
          <LoadingSkeleton type="stats" />
          <LoadingSkeleton type="chart" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LoadingSkeleton type="chart" />
            <LoadingSkeleton type="chart" />
          </div>
        </>
      ) : data ? (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Total Collected"
              value={`KES ${data.totalCollected.toLocaleString()}`}
              change={data.collectedChange}
              icon={CurrencyDollarIcon}
              colorClass="bg-green-500"
            />
            <StatCard
              title="Pending Collection"
              value={`KES ${data.totalPending.toLocaleString()}`}
              change={data.pendingChange}
              icon={ExclamationCircleIcon}
              colorClass="bg-yellow-500"
            />
            <StatCard
              title="Overdue Amount"
              value={`KES ${data.totalOverdue.toLocaleString()}`}
              change={data.overdueChange}
              icon={ClockIcon}
              colorClass="bg-red-500"
            />
            <StatCard
              title="Collection Rate"
              value={`${data.collectionRate.toFixed(1)}%`}
              icon={CurrencyDollarIcon}
              colorClass="bg-blue-500"
            />
          </div>

          {/* Monthly Collection Trend */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Collection Trend</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.collectionByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280' }}
                    tickFormatter={(value) => `KES ${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`KES ${value.toLocaleString()}`, '']}
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.375rem',
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="collected" 
                    name="Collected" 
                    fill="#0088FE"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="pending" 
                    name="Pending" 
                    fill="#FF8042"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Collection by Fee Type */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Collection by Fee Type</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.collectionByFeeType}
                      dataKey="amount"
                      nameKey="feeType"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {data.collectionByFeeType.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `KES ${value.toLocaleString()}`}
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0.375rem',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Collection by Class */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Collection by Class</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.collectionByClass} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280' }}
                      tickFormatter={(value) => `KES ${value.toLocaleString()}`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="className"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280' }}
                    />
                    <Tooltip 
                      formatter={(value: number) => `KES ${value.toLocaleString()}`}
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0.375rem',
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="collected" 
                      name="Collected" 
                      fill="#0088FE"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar 
                      dataKey="pending" 
                      name="Pending" 
                      fill="#FF8042"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No data available for the selected filters</p>
        </div>
      )}
    </div>
  );
}