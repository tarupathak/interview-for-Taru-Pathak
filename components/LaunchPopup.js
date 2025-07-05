"use client";
import React from "react";
import Image from "next/image";
import icon from "@/public/icons.svg";
import cross from "@/public/cross.svg";

const LaunchPopup = ({ launch, onClose }) => {
  if (!launch) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.1)] flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative shadow-xl">
        <button
          className="absolute top-8 right-8 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
          <Image src={cross} alt="cross" />
        </button>
        <div className="flex items-center gap-4 mb-4">
          <img
            src={launch.links.patch.small}
            alt="patch"
            className="w-12 h-12 object-contain"
          />
          <div className="flex-1">
            <h2 className="text-base font-semibold">
              {launch.name}{" "}
              <span
                className={`text-xs px-2 py-1 rounded-full  font-semibold ${
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
            </h2>
            <p className="text-sm text-gray-500">{launch.rocketName}</p>
            <Image src={icon} alt="icons" />
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          {launch.details || "No details available."}
        </p>
        <div className="text-sm text-gray-700 space-y-2">
          {[
            ["Flight Number", launch.flight_number],
            ["Rocket Type", launch.rocketType],
            ["Rocket Name", launch.rocketName],
            ["Manufacturer", launch.manufacturer],
            ["Launchpad", launch.launchpadName],
            ["Payload Type", launch.payloadType],
            ["Orbit", launch.orbit],
            ["Launch Time", new Date(launch.date_utc).toUTCString()],
            ["Launch Site", launch.launchpadName],
          ].map(([label, value], i) => (
            <div
              key={i}
              className="flex justify-between  border-t border-gray-200 pt-2 mt-2"
            >
              <span className="font-medium">{label}</span>
              <span className="absolute right-24 justify-start flex">{value ?? "N/A"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LaunchPopup;
