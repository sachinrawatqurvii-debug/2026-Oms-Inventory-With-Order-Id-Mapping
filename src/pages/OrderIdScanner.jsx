import React, { useEffect, useRef, useState } from "react";
import nocoDBService from "../services/nocoDB.service.js";
import storage from "../services/localstorage.service.js";
import color from "../services/color.service.js";

const OrderIdScanner = () => {
    const [records, setRecords] = useState([]);
    const [order_id, setOrder_id] = useState("");
    const [globalRackSpace, setGlobalRackSpace] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [scanStatus, setScanStatus] = useState({ message: "", type: "" });
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showExactStyle, setShowExactStyle] = useState(false);
    const orderidRef = useRef(null);


    // ***************** exact inventory styles *******************

    const styleNumbers = [
        // 30031, 30021, 30020, 24034, 24027, 24023, 24022, 19181, 19151, 19150,
        // 19107, 19079, 19077, 19076, 19073, 19056, 19031, 19030, 19029, 19004,
        // 18098, 18097, 18092, 18068, 18063, 18062, 18046, 18036, 18027, 18022,
        // 18020, 18019, 18006, 18005, 18004, 17086, 17086, 17077, 17053, 17043,
        // 17037, 17036, 17035, 17030, 17028, 17021, 17016, 17015, 17011, 17010,
        // 17007, 17005, 16091, 16085, 16084, 16082, 16077, 16074, 16055, 16055,
        // 16054, 16047, 16040, 16036, 16032, 16027, 16025, 16024, 16021, 16019,
        // 16013, 15095, 15090, 15087, 15084, 15077, 15068, 15066, 15065, 15064,
        // 15059, 15055, 15052, 15041, 15026, 15024, 15022, 15011, 14098, 14096,
        // 14076, 14074, 14073, 14071, 14071, 14068, 14067, 14066, 14065, 14060,
        // 14059, 14058, 14052, 14050, 14045, 14044, 14023, 14017, 14014, 14013,
        // 14012, 13084, 13080, 13078, 13075, 13068, 13067, 13066, 13064, 13063,
        // 13053, 13052, 13046, 13042, 13036, 13023, 13017, 13009, 12089, 12088,
        // 12086, 12082, 12080, 12050, 12041, 12037
    ];

    // Show status message
    const showStatus = (message, type = "info") => {
        setScanStatus({ message, type });
        setTimeout(() => setScanStatus({ message: "", type: "" }), 3000);
    };

    // Fetch record from NoCoDB and save to localStorage
    const fetchNodbRecords = async (id) => {
        if (!id || id.toString().length < 5) return;

        setIsLoading(true);
        setScanStatus({ message: "Scanning order ID...", type: "info" });

        try {

            const response = await nocoDBService.getNocoDbRecords(id);
            console.log(response)
            if (response?.order_id) {
                const matchingColor = colors.find((color) => color.style_code === Number(response?.style_number))?.color;
                const responseStyle = response?.style_number;
                if (styleNumbers.includes(responseStyle)) {
                    alert("Exact inventory styles should not be scanned.");
                    return
                }
                const data = {
                    style_number: response?.style_number,
                    size: response?.size,
                    color: matchingColor,
                    order_id: id,
                    rack_space: globalRackSpace || "",
                };

                storage.addToLocalStorage(data);
                setRecords(storage.getRecords());
                setOrder_id(""); // reset input

                showStatus(`Successfully scanned order #${id}`, "success");

                // Auto-focus and select order ID input after record is saved
                setTimeout(() => {
                    if (orderidRef.current) {
                        orderidRef.current.focus();
                        orderidRef.current.select();
                    }
                }, 100);
            } else {
                showStatus("Order ID not found", "error");
                // Focus even on error to allow retry
                setTimeout(() => {
                    if (orderidRef.current) {
                        orderidRef.current.focus();
                        orderidRef.current.select();
                    }
                }, 100);
            }
        } catch (error) {
            console.log("Failed to fetch nocodb records", error);
            showStatus("Failed to fetch order details", "error");
            // Focus even on error to allow retry
            setTimeout(() => {
                if (orderidRef.current) {
                    orderidRef.current.focus();
                    orderidRef.current.select();
                }
            }, 100);
        } finally {
            setIsLoading(false);
        }
    };

    // fetch colors 

    const fetchColors = async () => {
        setLoading(true);
        try {
            const response = await color.getColors();
            setColors(response.data);
        } catch (error) {
            console.log("Failed to fetch color error :: ", error);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchColors();
    }, [])

    // Manual scan function for button click
    const handleManualScan = () => {
        // if (order_id && order_id.toString().length >= 5) 
        if (order_id) {
            fetchNodbRecords(order_id);
        }
    };

    // Export records to CSV
    const exportToCSV = () => {
        if (records.length === 0) {
            showStatus("No records to export!", "error");
            return;
        }

        const headers = ["order_id", "style_number", "size", "color", "rack_space"];
        const csvData = records.map(record => [
            record.order_id,
            record.style_number,
            record.size,
            record.color,
            record.rack_space || ""
        ]);

        const csvContent = [headers.join(","), ...csvData.map(row => row.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `scanned_orders-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showStatus(`Exported ${records.length} records to CSV`, "success");

        // Re-focus after export
        setTimeout(() => {
            if (orderidRef.current) {
                orderidRef.current.focus();
            }
        }, 100);
    };

    // Export barcode CSV
    const exportBarcode = () => {
        if (records.length === 0) {
            showStatus("No records to export!", "error");
            return;
        }

        const headers = ["SKU", "COLOR", "RACK SPACE", "Qty", "ORDER ID"];
        const csvData = records.map(record => [
            `${record.style_number}-${record.size}`,
            record.color,
            record.rack_space,
            1,
            ""
        ]);

        const csvContent = [headers.join(","), ...csvData.map(row => row.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `BARCODE CSV-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showStatus(`Exported ${records.length} records to CSV`, "success");

        // Re-focus after export
        setTimeout(() => {
            if (orderidRef.current) {
                orderidRef.current.focus();
            }
        }, 100);
    };



    // Export oms format inventory file to CSV
    const exportOmsFormatInventoryFile = () => {
        if (records.length === 0) {
            showStatus("No records to export!", "error");
            return;
        }

        const headers = ["DropshipWarehouseId", "Item SkuCode", "InventoryAction", "QtyIncludesBlocked", "Qty", "RackSpace", "Last Purchase Price", "Notes"];
        const csvData = records.map(record => [
            22784,
            `${record.style_number}-${record.color}-${record.size}`,
            "ADD",
            "",
            1,
            record.rack_space || "",
            "",
            ""
        ]);

        const csvContent = [headers.join(","), ...csvData.map(row => row.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `UpdateInStockQtyAnd_orLastPurchasePrice - ${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showStatus(`Exported ${records.length} records to CSV`, "success");

        // Re-focus after export
        setTimeout(() => {
            if (orderidRef.current) {
                orderidRef.current.focus();
            }
        }, 100);
    };

    // Clear all records
    const clearAllRecords = () => {
        if (window.confirm("Are you sure you want to clear all records?")) {
            storage.clearAll();
            setRecords([]);
            showStatus("All records cleared", "info");

            // Focus after clear
            setTimeout(() => {
                if (orderidRef.current) {
                    orderidRef.current.focus();
                }
            }, 100);
        }
    };

    // Handle Enter key press in order ID field
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && order_id && order_id.toString().length >= 5 && !isLoading) {
            fetchNodbRecords(order_id);
        }

    }


    // Load saved records on first render
    useEffect(() => {
        const savedRecords = storage.getRecords();
        setRecords(savedRecords);

        // Auto-focus on component mount
        setTimeout(() => {
            if (orderidRef.current) {
                orderidRef.current.focus();
            }
        }, 500);
    }, []);

    // *********************** delete records *************************************

    const deleteRecord = (orderId) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            storage.deleteRecord(orderId); // Yeh service method call karo
            setRecords(storage.getRecords()); // Records update karo

            showStatus(`Record #${orderId} deleted`, "info");

            // Auto-focus after delete
            setTimeout(() => {
                if (orderidRef.current) {
                    orderidRef.current.focus();
                }
            }, 100);
        }
    };


    if (loading) {
        return <p className="text-center">loading...</p>
    }

    return (
        <div className="min-h-screen bg-gray-50  px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Order ID Scanner</h1>

                </div>

                {/* Status */}
                {scanStatus.message && (
                    <div className={`mb-6 p-4 rounded-lg border ${scanStatus.type === "success"
                        ? "bg-green-50 border-green-200 text-green-800"
                        : scanStatus.type === "error"
                            ? "bg-red-50 border-red-200 text-red-800"
                            : "bg-blue-50 border-blue-200 text-blue-800"
                        }`}>
                        <div className="flex items-center">
                            <span className="flex-1">{scanStatus.message}</span>
                        </div>
                    </div>
                )}
                <div>
                    <div>
                        <button onClick={() => setShowExactStyle((prev) => !prev)} className="bg-blue-500 text-white py-2 px-4 rounded-md cursor-pointer mb-3 hover:bg-blue-600 ease-in duration-75"> Show Exact Inventory Styles</button>
                    </div>
                    {showExactStyle && (
                        <div className="grid grid-cols-12 gap-2 p-2">
                            {styleNumbers.map((s, i) => (<span className="bg-gray-100 p-2   rounded-md" key={`${s}-${i}`}> {s} </span>))}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Global Rack Space</label>
                            <input
                                type="text"
                                placeholder="e.g., A-12, B-05, etc."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-blue-500 transition-colors"
                                value={globalRackSpace}
                                onChange={(e) => setGlobalRackSpace(e.target.value)}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Order ID Scanner</label>
                            <div className="flex gap-3">
                                <input
                                    ref={orderidRef}
                                    type="number"
                                    placeholder="Enter order ID (min. 5 digits) then press Enter..."
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg outline-blue-500 transition-colors"
                                    value={order_id}
                                    onChange={(e) => setOrder_id(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isLoading || !globalRackSpace}
                                    autoFocus
                                />
                                <button
                                    onClick={handleManualScan}
                                    disabled={isLoading || order_id.toString().length < 5}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Scanning...
                                        </div>
                                    ) : (
                                        "Scan"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 justify-between items-center pt-4 border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                            <strong style={{ fontSize: "20px" }}> {records.length} </strong>  record{records.length !== 1 ? 's' : ''} scanned
                        </span>
                        <div className="flex gap-3">
                            {records.length > 0 && (
                                <>
                                    <button
                                        onClick={clearAllRecords}
                                        className="px-4 py-2 bg-red-500 text-white border border-gray-300 rounded-lg hover:bg-red-600 cursor-pointer transition-colors font-medium"
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        onClick={exportToCSV}
                                        className="px-6 py-2 bg-yellow-600 cursor-pointer text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download Mapping File
                                    </button>
                                    <button
                                        onClick={exportOmsFormatInventoryFile}
                                        className="px-6 py-2 bg-green-600 cursor-pointer text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Inventory File
                                    </button>
                                    <button
                                        onClick={exportBarcode}
                                        className="px-6 py-2 bg-orange-600 cursor-pointer text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Barcode File
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Records List */}
                {records.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div>Order ID</div>
                            <div>Style Number</div>
                            <div>Size</div>
                            <div>Color</div>
                            <div>Rack Space</div>
                            <div>Action</div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {records.map((record, index) => (
                                <div
                                    key={`${record.order_id}-${index}`}
                                    className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="font-mono text-sm font-medium text-blue-600">{record.order_id}</div>
                                    <div className="text-sm text-gray-900">{record.style_number}</div>
                                    <div className="text-sm text-gray-900">{record.size}</div>
                                    <div className="text-sm text-gray-900">{record.color}</div>
                                    <div className={`text-sm font-medium ${record.rack_space ? "text-green-600" : "text-gray-400 italic"}`}>
                                        {record.rack_space || "Not assigned"}
                                    </div>
                                    <div className="text-sm text-gray-900"><button
                                        onClick={() => deleteRecord(record.order_id)}
                                        className="bg-red-400 text-white rounded-md py-2 px-4 cursor-pointer hover:bg-red-500 duration-75 ease-in">Delete</button> </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders scanned yet</h3>
                        <p className="text-gray-500 mb-6">Start by entering a rack space and scanning your first order ID.</p>
                        <p className="text-sm text-gray-400">The input field will automatically focus for continuous scanning</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderIdScanner;