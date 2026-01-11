import React from "react";
import { FiDownload, FiUpload, FiSearch, FiMap, FiLayers, FiBook, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function HomePageDocumentation() {
    const sampleMappingCSV = `order_id,style_number,size,color,rackspace\n133126,19626,XL,Red,RK-A1\n133127,19627,M,Blue,RK-B2`;
    const sampleInventoryUpdateCSV = `sku,order_id,quantity\nSKU-19626-XL-RED,133126,10\nSKU-19627-M-BLUE,133127,5`;
    const sampleRackspaceCSV = `Rack Space\nRK-A1\nRK-B2\nRK-C3`;

    const download = (filename, content) => {
        const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="mb-8 text-center">
                    <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-sm border border-blue-100/50 mb-4">
                        <FiBook className="text-2xl text-blue-600" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            App Documentation
                        </h1>
                    </div>
                    <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Complete reference for order scanning, mapping, and inventory management workflows.
                        Designed for developers and operations teams.
                    </p>
                </header>

                {/* Main Content Grid */}
                <section className="grid gap-8 lg:grid-cols-2">
                    {/* Order ID Scan Flow */}
                    <article className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-blue-100/50 hover:shadow-md transition-all duration-300 hover:border-blue-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                <FiSearch className="text-2xl text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Order ID Scan Flow</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Primary Workflow</span>
                                </div>
                            </div>
                        </div>

                        <ol className="space-y-4">
                            {[
                                'From the Home page click "Order ID Scan"',
                                'Enter rackspace to enable Order ID scan field',
                                'Scan order IDs one-by-one — records append to session list',
                                'Download generated CSV files after completion'
                            ].map((step, index) => (
                                <li key={index} className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                    </div>
                                    <span className="text-gray-700 leading-relaxed">{step}</span>
                                </li>
                            ))}
                        </ol>


                    </article>

                    {/* Bulk Update */}
                    <article className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-blue-100/50 hover:shadow-md transition-all duration-300 hover:border-blue-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                                <FiUpload className="text-2xl text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Bulk Update Order ID</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Batch Processing</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-4 leading-relaxed">
                            Upload the mapping CSV (produced by scanning) to map SKUs to order IDs in bulk.
                        </p>

                        <div className="space-y-4">
                            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                    <FiAlertCircle className="text-amber-600" />
                                    Validation Rules
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <FiCheckCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                                        CSV must contain: order_id, style_number, size, color, rackspace
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FiCheckCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                                        Rows with missing fields are rejected with detailed errors
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FiCheckCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                                        Summary report shows: processed / mapped / failed counts
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sample Format</label>
                                <pre className="p-4 bg-gray-50 rounded-lg text-sm overflow-auto border font-mono text-gray-600 leading-relaxed">
                                    {sampleMappingCSV}
                                </pre>
                            </div>
                        </div>
                    </article>

                    {/* View Mapped SKUs */}
                    <article className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-blue-100/50 hover:shadow-md transition-all duration-300 hover:border-blue-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                                <FiMap className="text-2xl text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">View Mapped SKUs</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Read-only</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-4 leading-relaxed">
                            Inspect all mapped SKUs with comprehensive search and filtering capabilities.
                        </p>

                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-800">Displayed Information:</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {['SKU', 'Order ID', 'Style Number', 'Size', 'Color', 'Rackspace', 'Mapping Timestamp', 'User'].map((item) => (
                                    <div key={item} className="flex items-center gap-2 text-gray-600">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-green-50/50 rounded-lg border border-green-100">
                            <p className="text-sm text-green-700 flex items-center gap-2">
                                <FiCheckCircle className="text-green-600" />
                                Features: Quick search, rackspace filters, CSV export of filtered results
                            </p>
                        </div>
                    </article>

                    {/* Zero Inventory Flow */}
                    <article className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-blue-100/50 hover:shadow-md transition-all duration-300 hover:border-blue-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                                <FiLayers className="text-2xl text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Zero Inventory Flow</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">OMS Integration</span>
                                </div>
                            </div>
                        </div>

                        <ol className="space-y-3 mb-6">
                            {[
                                'Download rackspace file from OMS',
                                'Use template to enter rackspaces',
                                'Upload to match SKUs with rackspaces',
                                'Generate CSV to zero inventory in OMS'
                            ].map((step, index) => (
                                <li key={index} className="flex gap-3 text-gray-700">
                                    <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                    </div>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rackspace Template</label>
                            <pre className="p-4 bg-gray-50 rounded-lg text-sm overflow-auto border font-mono text-gray-600 mb-4">
                                {sampleRackspaceCSV}
                            </pre>
                            <button
                                onClick={() => download("rackspace-sample.csv", sampleRackspaceCSV)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 border border-red-200 text-red-700 font-medium transition-all duration-200 hover:shadow-sm"
                            >
                                <FiDownload className="text-lg" />
                                Download Rackspace Sample
                            </button>
                        </div>
                    </article>
                </section>

                {/* File Specifications */}
                <section className="mt-8 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-blue-100/50">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <FiBook className="text-gray-600" />
                        </div>
                        File Format Specifications
                    </h3>

                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            {
                                title: "Mapping CSV",
                                description: "Output from scanner",
                                columns: ["order_id", "style_number", "size", "color", "rack_space"],
                                color: "blue"
                            },
                            {
                                title: "Inventory Update CSV",
                                description: "OMS bulk update format",
                                columns: ["DropshipWarehouseId", "Item SkuCode", "InventoryAction", "QtyIncludesBlocked", "Qty", "RackSpace", "Last Purchase Price", "Notes"],
                                color: "green"
                            },
                            {
                                title: "Rackspace Template",
                                description: "Single column format",
                                columns: ["Rack Space"],
                                color: "red"
                            }
                        ].map((spec, index) => (
                            <div key={index} className="p-4 bg-gray-50/50 rounded-xl border">
                                <h4 className={`font-semibold text-${spec.color}-700 mb-2`}>{spec.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">{spec.description}</p>
                                <div className="space-y-1">
                                    {spec.columns.map((col, colIndex) => (
                                        <div key={colIndex} className="flex items-center gap-2 text-sm text-gray-700">
                                            <div className={`w-2 h-2 bg-${spec.color}-400 rounded-full`}></div>
                                            <code className="bg-white px-2 py-1 rounded border text-xs">{col}</code>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Developer Notes */}
                <section className="mt-8 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-blue-100/50">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Developer Notes & Best Practices</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {[
                            "Validate CSV columns client-side before backend calls",
                            "Use optimistic UI for scanning with local record batching",
                            "Maintain server-side audit logs for mapping changes",
                            "Implement chunked processing with progress indicators for large uploads",
                            "Provide clear error messages with actionable feedback",
                            "Use consistent API response formats across all endpoints"
                        ].map((note, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50/30 rounded-lg border border-blue-100">
                                <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 text-sm leading-relaxed">{note}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <footer className="mt-8 text-center text-sm text-gray-500 py-4 border-t border-gray-200/50">
                    Generated documentation — Integrate into your Home page or use as a developer help panel
                </footer>
            </div>
        </div>
    );
}