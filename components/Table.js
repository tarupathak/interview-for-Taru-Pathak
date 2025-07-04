import React, { useEffect, useState } from "react";
import axios from "axios";
import LaunchPopup from "@/components/LaunchPopup"; 

const Table = () => {
  const [launches, setLaunches] = useState([]);
  const [selectedLaunch, setSelectedLaunch] = useState(null);

  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        const { data } = await axios.get(
          "https://api.spacexdata.com/v5/launches"
        );
        const recent = data.slice(0, 12);

        const resolved = await Promise.all(
          recent.map(async (launch) => {
            const [rocketRes, launchpadRes, payloadRes] = await Promise.all([
              axios.get(`https://api.spacexdata.com/v4/rockets/${launch.rocket}`),
              axios.get(`https://api.spacexdata.com/v4/launchpads/${launch.launchpad}`),
              axios.get(`https://api.spacexdata.com/v4/payloads/${launch.payloads[0]}`),
            ]);

            return {
              ...launch,
              rocketName: rocketRes.data.name,
              rocketType: rocketRes.data.type,
              launchpadName: launchpadRes.data.name,
              orbit: payloadRes.data.orbit,
              manufacturer: payloadRes.data.manufacturers?.[0] || "N/A",
              payloadType: payloadRes.data.payload_type,
              payloadMassKg: payloadRes.data.mass_kg,
              payloadId: payloadRes.data.name,
            };
          })
        );

        setLaunches(resolved);
      } catch (err) {
        console.error("Failed to fetch launch data", err);
      }
    };

    fetchLaunches();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <button className="px-4 py-2 border rounded bg-white shadow-sm">
            Last 6 Months ▾
          </button>
        </div>
        <button className="px-4 py-2 border rounded bg-white shadow-sm">
          All Launches ▾
        </button>
      </div>
      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-6 py-3">No.</th>
              <th className="px-6 py-3">Launched (UTC)</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Mission</th>
              <th className="px-6 py-3">Orbit</th>
              <th className="px-6 py-3">Launch Status</th>
              <th className="px-6 py-3">Rocket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {launches.map((launch, index) => (
              <tr
                key={launch.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedLaunch(launch)}
              >
                <td className="px-6 py-3 font-medium">{index + 1}</td>
                <td className="px-6 py-3">
                  {new Date(launch.date_utc).toUTCString()}
                </td>
                <td className="px-6 py-3">{launch.launchpadName}</td>
                <td className="px-6 py-3">{launch.name}</td>
                <td className="px-6 py-3">{launch.orbit}</td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full 
                      ${
                        launch.upcoming
                          ? "bg-[#FEF3C7] text-[#92400F]"
                          : launch.success
                          ? "bg-[#DEF7EC] text-[#03543F]"
                          : "bg-[#FDE2E1] text-[#981B1C]"
                      }`}
                  >
                    {launch.upcoming
                      ? "Upcoming"
                      : launch.success
                      ? "Success"
                      : "Failed"}
                  </span>
                </td>
                <td className="px-6 py-3">{launch.rocketName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedLaunch && (
        <LaunchPopup
          launch={selectedLaunch}
          onClose={() => setSelectedLaunch(null)}
        />
      )}
    </div>
  );
};

export default Table;
