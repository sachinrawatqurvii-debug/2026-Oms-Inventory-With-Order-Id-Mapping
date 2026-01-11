import React, { useState } from "react";
import Papa from "papaparse";

const ZeroRack = () => {
    const [csvFile, setCsvFile] = useState(null);
    const [rackCsvFile, setRackCsvFile] = useState(null);
    const [data, setData] = useState([]);
    const [message, setMessage] = useState("");
    const [rackSpaceData, setRackSpaceData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Clean rack space - remove special characters
    const cleanRackSpace = (rackSpace) => {
        if (!rackSpace) return "";

        return rackSpace
            .replace(/['"`]/g, '')
            .trim()
            .toUpperCase();
    };

    // Handle main file
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file || (file.type !== "text/csv" && !file.name.endsWith(".csv"))) {
            setMessage("Please select a valid CSV file");
            return;
        }
        setCsvFile(file);
        setData([]);
        setMessage("");
    };

    const handleFileUpload = () => {
        if (!csvFile) {
            setMessage("Please select a CSV file first.");
            return;
        }

        setLoading(true);
        Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const validData = results.data
                    .filter((row) => row["Rack Space"] && row["Item SkuCode"])
                    .map((row) => ({
                        originalRackSpace: row["Rack Space"].trim(),
                        rackSpace: cleanRackSpace(row["Rack Space"]),
                        skuCode: row["Item SkuCode"].trim(),
                    }));
                setData(validData);
                setLoading(false);
                setMessage(`✅ Successfully parsed ${validData.length} rows from main file`);
            },
            error: function (error) {
                setMessage(`❌ Error parsing CSV: ${error.message}`);
                setLoading(false);
            },
        });
    };

    // Handle rack sample file
    const handleRackSpaceFileChange = (e) => {
        const file = e.target.files[0];
        if (!file || (file.type !== "text/csv" && !file.name.endsWith(".csv"))) {
            setMessage("Please select a valid CSV file");
            return;
        }
        setRackCsvFile(file);
        setRackSpaceData([]);
        setMessage("");
    };

    const handleUploadRackSpaceSample = () => {
        if (!rackCsvFile) {
            setMessage("Please upload rack sample file first");
            return;
        }

        setLoading(true);
        Papa.parse(rackCsvFile, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const data = results.data
                    .filter((row) => row["Rack Space"])
                    .map((row) => ({
                        originalRackSpace: row["Rack Space"].trim(),
                        rackSpace: cleanRackSpace(row["Rack Space"]),
                    }));
                setRackSpaceData(data);
                setLoading(false);
                setMessage(`✅ Successfully parsed ${data.length} rack spaces from sample file`);
            },
            error: function (error) {
                setMessage(`❌ Error parsing CSV: ${error.message}`);
                setLoading(false);
            },
        });
    };

    const handleExportMatchedData = () => {
        if (data.length === 0 || rackSpaceData.length === 0) {
            setMessage("Please upload and parse both CSV files first.");
            return;
        }

        // Function to generate rack spaces from pattern (AA1 to AA20)
        const generateRackSpacesFromPattern = (pattern) => {
            const rackSpaces = [];
            for (let i = 1; i <= 20; i++) {
                rackSpaces.push(`${pattern}${i}`);
            }
            return rackSpaces;
        };

        // Check if any rack space data contains patterns (like AA, BB, etc.)
        const rackSpacePatterns = rackSpaceData
            .map(r => r.rackSpace)
            .filter(space => /^[A-Za-z]+$/.test(space))
            .filter((pattern, index, self) => self.indexOf(pattern) === index);

        let allRackSpacesToMatch = new Set(rackSpaceData.map((r) => r.rackSpace));

        // If patterns found, generate rack spaces for them
        if (rackSpacePatterns.length > 0) {
            rackSpacePatterns.forEach(pattern => {
                const generatedSpaces = generateRackSpacesFromPattern(pattern);
                generatedSpaces.forEach(space => allRackSpacesToMatch.add(space));
            });
        }

        const matched = data.filter((d) => allRackSpacesToMatch.has(d.rackSpace));

        if (matched.length === 0) {
            const mainRackSpaces = data.map(d => d.rackSpace).slice(0, 5);
            const sampleRackSpaces = Array.from(allRackSpacesToMatch).slice(0, 10);

            setMessage(`❌ No matching Rack Spaces found! 
                Sample Main: ${mainRackSpaces.join(', ')} 
                Looking for: ${sampleRackSpaces.join(', ')}`);
            return;
        }

        // Create CSV with cleaned rackSpace and skuCode
        const exportData = matched.map(item => ({
            "DropshipWarehouseId": 22784,
            "Item SkuCode": item.skuCode,
            "InventoryAction": "RESET",
            "QtyIncludesBlocked": "",
            "Qty": 0,
            "RackSpace": `${item.rackSpace}`,
            "Last Purchase Price": "",
            "Notes": ""
        }));

        const csv = Papa.unparse(exportData, {
            columns: ["DropshipWarehouseId", "Item SkuCode", "InventoryAction", "QtyIncludesBlocked", "Qty", "RackSpace", "Last Purchase Price", "Notes"]
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `UpdateInStockQtyAnd_orLastPurchasePrice - ${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setMessage(`✅ Downloaded ${matched.length} matched rows. Generated patterns: ${rackSpacePatterns.join(', ')}`);
    };

    // Show matched data in table
    const getMatchedData = () => {
        if (data.length === 0 || rackSpaceData.length === 0) return [];

        const rackSpacesSet = new Set(rackSpaceData.map((r) => r.rackSpace));
        return data.filter((d) => rackSpacesSet.has(d.rackSpace));
    };

    const matchedData = getMatchedData();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">Rack Space Matcher</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Upload your inventory data and rack space patterns to automatically match and export SKU codes
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Main Data</p>
                                <p className="text-2xl font-bold text-gray-800">{data.length} rows</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-green-100 text-green-600 mr-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rack Spaces</p>
                                <p className="text-2xl font-bold text-gray-800">{rackSpaceData.length} patterns</p>
                            </div>
                        </div>
                    </div>


                </div>

                {/* File Upload Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Main File Upload */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Main Inventory Data</h3>
                                <p className="text-sm text-gray-600">Upload CSV with Rack Space and SKU Codes</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                <input
                                    type="file"
                                    className="hidden"
                                    id="mainFile"
                                    onChange={handleFileChange}
                                    accept=".csv"
                                />
                                <label htmlFor="mainFile" className="cursor-pointer">
                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-sm text-gray-600">
                                        {csvFile ? csvFile.name : "Click to upload main CSV file"}
                                    </p>
                                </label>
                            </div>

                            <button
                                onClick={handleFileUpload}
                                disabled={!csvFile || loading}
                                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    "Parse Main File"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Rack Space File Upload */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-800 w-full">Rack Space Patterns</h3>
                                <p className="text-sm text-gray-600 w-full">Upload CSV with rack space patterns (AA, BB, etc.)</p>

                            </div>
                            <div className="relative  top-2 w-full flex flex-row-reverse">
                                <a
                                    className="bg-green-400 py-2 px-4 rounded-md cursor-pointer hover:bg-green-500 text-white ease-in duration-75"
                                    href="/RackSample.csv">Download Sample</a>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                                <input
                                    type="file"
                                    className="hidden"
                                    id="rackFile"
                                    onChange={handleRackSpaceFileChange}
                                    accept=".csv"
                                />
                                <label htmlFor="rackFile" className="cursor-pointer">
                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-sm text-gray-600">
                                        {rackCsvFile ? rackCsvFile.name : "Click to upload rack space CSV"}
                                    </p>
                                </label>
                            </div>

                            <button
                                onClick={handleUploadRackSpaceSample}
                                disabled={!rackCsvFile || loading}
                                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    "Parse Rack Spaces"
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="text-center mb-8">
                    <button
                        onClick={handleExportMatchedData}
                        disabled={data.length === 0 || rackSpaceData.length === 0 || loading}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        <div className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Matched Data
                        </div>
                    </button>
                </div>

                {/* Messages */}
                {message && (
                    <div className={`mb-8 p-4 rounded-xl border ${message.includes("❌") || message.includes("Error") || message.includes("Please") || message.includes("No matching")
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-green-50 border-green-200 text-green-700"
                        }`}>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3">
                                {message.includes("❌") ? (
                                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div className="text-sm">
                                {message.split('\n').map((line, idx) => (
                                    <div key={idx}>{line}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Data Preview Tables */}
                {(data.length > 0 || rackSpaceData.length > 0) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Main Data Preview */}
                        {data.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Main Data Preview ({data.length} rows)
                                </h3>
                                <div className="overflow-x-auto max-h-80 border border-gray-200 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cleaned</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU Code</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {data.slice(0, 10).map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{row.originalRackSpace}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-800 font-semibold font-mono">{row.rackSpace}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{row.skuCode}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {data.length > 10 && (
                                    <p className="text-xs text-gray-500 mt-2">Showing first 10 of {data.length} rows</p>
                                )}
                            </div>
                        )}

                        {/* Rack Space Data Preview */}
                        {rackSpaceData.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    Rack Space Patterns ({rackSpaceData.length} patterns)
                                </h3>
                                <div className="overflow-x-auto max-h-80 border border-gray-200 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cleaned</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {rackSpaceData.slice(0, 10).map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{row.originalRackSpace}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-800 font-semibold font-mono">{row.rackSpace}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {rackSpaceData.length > 10 && (
                                    <p className="text-xs text-gray-500 mt-2">Showing first 10 of {rackSpaceData.length} patterns</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Matched Data Table */}
                {matchedData.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Matched Results ({matchedData.length} items)
                            </h3>
                            <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                                Ready for Export
                            </span>
                        </div>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-purple-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Rack Space</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">SKU Code</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {matchedData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-purple-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 font-mono">{row.rackSpace}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{row.skuCode}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZeroRack;