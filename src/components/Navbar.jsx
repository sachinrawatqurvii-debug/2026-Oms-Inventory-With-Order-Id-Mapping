// components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="bg-blue-500 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo / Brand */}
                    <div className="flex-shrink-0 text-xl font-bold">
                        <Link to="/">
                            Inventory Mapping
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex space-x-6">
                        <Link
                            to="/order-scan"
                            className="hover:bg-blue-600 px-3 py-2 rounded-md transition"
                        >
                            Order ID Scan
                        </Link>
                        <Link
                            to="/bulk-update"
                            className="hover:bg-blue-600 px-3 py-2 rounded-md transition"
                        >
                            Bulk Update OrderID
                        </Link>
                        <Link
                            to="/mapped-sku"
                            className="hover:bg-blue-600 px-3 py-2 rounded-md transition"
                        >
                            Mapped SKU
                        </Link>
                        <Link
                            to="/zero-rack"
                            className="hover:bg-blue-600 px-3 py-2 rounded-md transition"
                        >
                            Zero Rack
                        </Link>
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;
