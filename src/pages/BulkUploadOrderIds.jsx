import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { useDispatch, useSelector } from "react-redux";
import { upsertRackSpace } from "../redux/store/productSlice";

const BulkUploadOrderIds = () => {
    const [csvFile, setCsvFile] = useState(null);
    const [data, setData] = useState([]);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const dispatch = useDispatch();
    const { upsertStatus, upsertMessage } = useSelector((state) => state.products);

    // Show Redux message from async thunk
    useEffect(() => {
        if (upsertStatus === "succeeded") {
            setMessage(upsertMessage || "Upload successful!");
            setMessageType("success");
            setData([]);
            setCsvFile(null);
            document.getElementById("csv-file-input").value = "";
        } else if (upsertStatus === "failed") {
            setMessage(upsertMessage || "Upload failed.");
            setMessageType("error");
        }
    }, [upsertStatus, upsertMessage]);

    // Handle CSV file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const validFile = file.name?.split("-")[0];
        if (file && file.type !== "text/csv" && !file.name.endsWith(".csv") || validFile !== "scanned_orders") {
            setMessage("Please select a valid CSV file.");
            setMessageType("error");
            return;
        }
        setCsvFile(file);
        setData([]);
        setMessage("");
        setMessageType("");
    };

    // Parse CSV file
    const handleParse = () => {
        if (!csvFile) {
            setMessage("Please select a CSV file first.");
            setMessageType("error");
            return;
        }

        Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const validData = results.data.filter(
                    (row) =>
                        row.order_id &&
                        row.style_number &&
                        row.size &&
                        row.color &&
                        row.rack_space
                );

                const invalidCount = results.data.length - validData.length;

                if (validData.length === 0) {
                    setMessage("No valid data found in CSV. Please check the file format.");
                    setMessageType("error");
                    return;
                }

                setData(validData);
                setMessage(
                    `Successfully parsed ${validData.length} valid rows${invalidCount > 0 ? ` (${invalidCount} invalid rows skipped)` : ""
                    }.`
                );
                setMessageType("success");
            },
            error: function (error) {
                setMessage(`Error parsing CSV: ${error.message}`);
                setMessageType("error");
            },
        });
    };

    // Upload parsed CSV data to API via Redux thunk
    const handleSubmit = () => {
        if (data.length === 0) {
            setMessage("No data to upload. Please parse CSV first.");
            setMessageType("error");
            return;
        }
        dispatch(upsertRackSpace(data));
        setTimeout(() => {
            window.location.reload();
        }, 2000)
    };

    const getMessageClass = () => {
        switch (messageType) {
            case "success":
                return "bg-green-50 border border-green-200 text-green-800";
            case "error":
                return "bg-red-50 border border-red-200 text-red-800";
            case "info":
                return "bg-blue-50 border border-blue-200 text-blue-800";
            default:
                return "bg-gray-50 border border-gray-200 text-gray-800";
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Upload Order IDs</h2>
                <p className="text-gray-600">Upload CSV files containing order information for bulk processing</p>
            </div>

            {/* File Upload Card */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
                <input
                    id="csv-file-input"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <label
                    htmlFor="csv-file-input"
                    className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                >
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">CSV files only</p>
                    </div>
                </label>

                {csvFile && (
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md mt-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{csvFile.name}</p>
                                <p className="text-xs text-gray-500">{(csvFile.size / 1024).toFixed(2)} KB</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setCsvFile(null);
                                setData([]);
                                document.getElementById("csv-file-input").value = "";
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mb-6">
                <button
                    onClick={handleParse}
                    disabled={!csvFile}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${!csvFile
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        }`}
                >
                    Parse CSV
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={data.length === 0 || upsertStatus === "pending"}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${data.length === 0 || upsertStatus === "pending"
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                        }`}
                >
                    {upsertStatus === "pending" ? "Uploading..." : "Upload to Database"}
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-lg mb-6  ${getMessageClass()}`}>
                    {message}
                </div>
            )}

            {/* Preview Table */}
            {data.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
                        <p className="text-sm text-gray-600 mt-1">{data.length} rows ready for upload</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">#</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Order ID</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Style Number</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Size</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Color</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Rack Space</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{i + 1}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{row.order_id}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{row.style_number}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{row.size}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{row.color}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{row.rack_space}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkUploadOrderIds;
