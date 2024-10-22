// app/fees/reports/collection-summary/page.tsx
"use client";

import { useCallback, useState } from "react";
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
} from "@/actions/fee/reports/actions";
import { StatCard } from "../components/StatCard";
import { Filters } from "./Filters";
import { LoadingSkeleton } from "../_components/LoadingSkeleton";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function CollectionSummaryPage() {
//   const [filters, setFilters] = useState<CollectionFilters>({});
  const [data, setData] = useState<CollectionSummary | null>(null);
  const [loading, setLoading] = useState(true);

//   const fetchData = useCallback(async (currentFilters: CollectionFilters) => {
//     try {
//       setLoading(true);
//       const result = await getCollectionSummary(currentFilters);
//       setData(result);
//     } catch (error) {
//       console.error("Error fetching collection summary:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

  const handleFilterChange = useCallback(async (newFilters: CollectionFilters) => {
    try {
      setLoading(true);
      const result = await getCollectionSummary(newFilters);
      // Transform the result to match the expected type
      const transformedResult: CollectionSummary = {
        ...result,
        collectionByClass: result.collectionByClass || [],  // Provide empty array if undefined
        collectionByGrade: result.collectionByGrade || [],  // Provide empty array if undefined
      };
      setData(transformedResult);
    } catch (error) {
      console.error('Error fetching collection summary:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
            <StatCard
              title="Total Collected"
              value={`KES ${data.totalCollected.toLocaleString()}`}
              icon={CurrencyDollarIcon}
              colorClass="bg-green-500"
            />
            <StatCard
              title="Pending Collection"
              value={`KES ${data.totalPending.toLocaleString()}`}
              icon={ExclamationCircleIcon}
              colorClass="bg-yellow-500"
            />
            <StatCard
              title="Overdue Amount"
              value={`KES ${data.totalOverdue.toLocaleString()}`}
              icon={ClockIcon}
              colorClass="bg-red-500"
            />
          </div>

          {/* Monthly Collection Trend */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Monthly Collection Trend
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.collectionByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="collected" fill="#0088FE" name="Collected" />
                  <Bar dataKey="pending" fill="#FF8042" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Collection by Fee Type */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Collection by Fee Type
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.collectionByFeeType}
                      dataKey="amount"
                      nameKey="feeType"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {data.collectionByFeeType.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Collection by Class */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Collection by Class
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.collectionByClass}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="className" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="collected" fill="#0088FE" name="Collected" />
                    <Bar dataKey="pending" fill="#FF8042" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No data available for the selected filters
          </p>
        </div>
      )}
    </div>
  );
}
