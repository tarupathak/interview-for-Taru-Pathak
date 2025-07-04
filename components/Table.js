import React, { useEffect, useState } from "react";
import axios from "axios";
import LaunchPopup from "@/components/LaunchPopup";
import { FormControl, Select, MenuItem, Box } from "@mui/material";
import DateFilterDropdown from "./DateFilterDropdown";
import filter from "@/public/filter.svg";
import Image from "next/image";
import loaderImg from "@/public/loader.svg";
import Pagination from "@mui/material/Pagination";

const Table = () => {
  const [launches, setLaunches] = useState([]);
  const [selectedLaunch, setSelectedLaunch] = useState(null);
  const [timeRange, setTimeRange] = useState("last6Months");
  const [launchStatus, setLaunchStatus] = useState("allLaunches");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(launches.length / itemsPerPage);
  const currentItems = launches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchLaunches = async () => {
      setLoading(true); // ✅ Start loader
      try {
        const { data } = await axios.get(
          "https://api.spacexdata.com/v5/launches"
        );

        let filteredData = data;

        if (customStartDate && customEndDate) {
          filteredData = filteredData.filter((launch) => {
            const date = new Date(launch.date_utc);
            return date >= customStartDate && date <= customEndDate;
          });
        }

        if (launchStatus === "upcomingLaunches") {
          filteredData = filteredData.filter((launch) => launch.upcoming);
        } else if (launchStatus === "successfulLaunches") {
          filteredData = filteredData.filter(
            (launch) => !launch.upcoming && launch.success
          );
        } else if (launchStatus === "failedLaunches") {
          filteredData = filteredData.filter(
            (launch) => !launch.upcoming && launch.success === false
          );
        }

        const recent = filteredData.slice(0, 12);

        const resolved = await Promise.all(
          recent.map(async (launch) => {
            const [rocketRes, launchpadRes, payloadRes] = await Promise.all([
              axios.get(
                `https://api.spacexdata.com/v4/rockets/${launch.rocket}`
              ),
              axios.get(
                `https://api.spacexdata.com/v4/launchpads/${launch.launchpad}`
              ),
              axios.get(
                `https://api.spacexdata.com/v4/payloads/${launch.payloads[0]}`
              ),
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
      } finally {
        setLoading(false);
      }
    };

    fetchLaunches();
  }, [timeRange, launchStatus, customStartDate, customEndDate]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleLaunchStatusChange = (event) => {
    setLaunchStatus(event.target.value);
  };

  return (
    <div className="p-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 sm:gap-0">
        <FormControl
          size="small"
          sx={{
            "& .MuiInputLabel-root": {
              color: "#4B5563",
            },
            "& .MuiSelect-select": {
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              fontSize: "0.875rem",
            },
            "& .MuiSvgIcon-root": {
              color: "#4B5563",
            },
          }}
        >
          <DateFilterDropdown
            onRangeChange={(startDate, endDate) => {
              setCustomStartDate(startDate);
              setCustomEndDate(endDate);
              setTimeRange("custom");
            }}
          />
        </FormControl>

        <div className="flex items-center gap-1">
          <Image src={filter} alt="filter" />
          <Select
            value={launchStatus}
            onChange={handleLaunchStatusChange}
            variant="standard"
            disableUnderline
            className="text-gray-700 font-medium"
            sx={{
              "& .MuiSelect-select": {
                padding: 0,
                fontSize: "1rem",
              },
              "& svg": {
                marginLeft: "0.25rem",
              },
            }}
          >
            <MenuItem value="allLaunches">All Launches</MenuItem>
            <MenuItem value="upcomingLaunches">Upcoming Launches</MenuItem>
            <MenuItem value="successfulLaunches">Successful Launches</MenuItem>
            <MenuItem value="failedLaunches">Failed Launches</MenuItem>
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full  divide-y divide-gray-200 text-sm text-left">
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
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  <Image
                    src={loaderImg}
                    alt="Loading"
                    width={180}
                    height={180}
                    className="mx-auto animate-spin"
                    unoptimized
                  />
                </td>
              </tr>
            ) : launches.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-800 font-semibold"
                >
                  No results found for the specified filter
                </td>
              </tr>
            ) : (
              currentItems.map((launch, index) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-4">
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(event, value) => setCurrentPage(value)}
          color="primary"
          variant="outlined"
          shape="rounded"
        />
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
