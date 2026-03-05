import React from "react";
 type Status = "notFixed" | "in-progress" | "fixed";


interface Customer {
  id: number;
  name: string;
  priority: string;
  status: Status;
  createdAt: number;  
}
 
interface KpiSectionProps {
  queue: Customer[];
}
export default function KpiSection({ queue }:KpiSectionProps) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Total Bugs</p>
          <h2 className="text-2xl font-semibold mt-2">{queue.length}</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500"> not fixed</p>
          <h2 className="text-2xl font-semibold mt-2 text-yellow-600">
            {/* {queue.filter((q) => q.status === "notFixed").length} */}
            {queue.filter((q) => q.status === "notFixed").length}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Fixed</p>
          <h2 className="text-2xl font-semibold mt-2 text-green-600">
            {queue.filter((q) => q.status === "fixed").length}
          </h2>
        </div>
      </div>
    </div>
  );
}
