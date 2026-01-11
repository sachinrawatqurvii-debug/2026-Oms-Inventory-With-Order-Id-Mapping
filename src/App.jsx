import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import OrderScan from "./pages/OrderIdScanner";
import BulkUpdate from "./pages/BulkUploadOrderIds";
import MappedSKU from "./pages/MappedSKU";
import Footer from "./components/Footer";
import ZeroRack from "./pages/ZeroRack";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <main className="flex-grow p-4">
          <Routes>
            <Route path="/order-scan" element={<OrderScan />} />
            <Route path="/bulk-update" element={<BulkUpdate />} />
            <Route path="/mapped-sku" element={<MappedSKU />} />
            <Route path="/zero-rack" element={<ZeroRack />} />
            <Route path="/" element={<Home />} />

          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
