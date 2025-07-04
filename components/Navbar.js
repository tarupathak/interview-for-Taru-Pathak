import React from "react";
import logo from '@/public/logo.svg'
import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md py-4 rounded-b-lg">
      <div className="container mx-auto flex justify-center items-center">
        <Image
          src={logo}
          alt="SpaceX Logo"
          className="h-10 w-auto object-contain"
        />
      </div>
    </nav>
  );
};

export default Navbar;
