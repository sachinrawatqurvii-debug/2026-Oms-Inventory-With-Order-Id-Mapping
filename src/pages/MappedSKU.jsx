import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, clearError, clearSearch } from "../redux/store/productSlice"; // ✅ सही imports

const MappedSKU = () => {
    const dispatch = useDispatch();
    const {
        products,
        filteredProducts,
        loading,
        error,
        searchMessage,
        pagination,
        currentSearchParams
    } = useSelector((state) => state.products);

    const [styleNumber, setStyleNumber] = useState("");
    const [rackSpace, setRackSpace] = useState("");
    const [searchType, setSearchType] = useState("style_number");

    // Initial load
    useEffect(() => {
        dispatch(fetchProducts({}));
    }, [dispatch]);

    // Clear error when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleSearch = () => {
        // Clear previous errors/messages
        dispatch(clearError());

        if (searchType === "style_number" && styleNumber.trim()) {
            dispatch(fetchProducts({
                styleNumber: styleNumber.trim(),
                rackSpace: "",
                page: 1,
                limit: pagination.limit
            }));
        } else if (searchType === "rack_space" && rackSpace.trim()) {
            dispatch(fetchProducts({
                styleNumber: "",
                rackSpace: rackSpace.trim(),
                page: 1,
                limit: pagination.limit
            }));
        } else {
            // If empty, fetch all
            dispatch(fetchProducts({
                page: 1,
                limit: pagination.limit
            }));
        }
    };

    const handleClearSearch = () => {
        setStyleNumber("");
        setRackSpace("");
        dispatch(clearSearch()); // ✅ Redux action use करें
        dispatch(fetchProducts({
            page: 1,
            limit: pagination.limit
        }));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handlePageChange = (page) => {
        dispatch(fetchProducts({
            ...currentSearchParams,
            page,
            limit: pagination.limit
        }));
    };

    // Display products - error handling
    let displayProducts = [];
    let showTable = false;

    if (loading) {
        // Loading state
    } else if (error) {
        // Error state
    } else if (searchMessage) {
        // No data found message
    } else {
        // Data available
        displayProducts = filteredProducts.length > 0 ? filteredProducts : products;
        showTable = displayProducts.length > 0;
    }

    const totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

    // Pagination buttons
    const maxPageButtons = 5;
    let startPage = Math.max(pagination.currentPage - Math.floor(maxPageButtons / 2), 1);
    let endPage = Math.min(startPage + maxPageButtons - 1, totalPages);

    if (endPage - startPage < maxPageButtons - 1) {
        startPage = Math.max(endPage - maxPageButtons + 1, 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-4">
                Mapped SKU ({pagination.totalRecords || 0} {pagination.totalRecords !== 1 ? "Skus" : "Sku"})
            </h2>

            {/* Search Controls */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Search Type Selector */}
                    <div className="flex items-center space-x-4">
                        <label className="text-gray-700 font-medium">Search By:</label>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchType("style_number");
                                    setRackSpace("");
                                }}
                                className={`px-4 py-2 rounded-md transition-colors ${searchType === "style_number" ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Style Number
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchType("rack_space");
                                    setStyleNumber("");
                                }}
                                className={`px-4 py-2 rounded-md transition-colors ${searchType === "rack_space" ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Rack Space
                            </button>
                        </div>
                    </div>

                    {/* Search Inputs */}
                    <div className="flex-1 flex gap-2">
                        {searchType === "style_number" ? (
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Enter Style Number..."
                                    value={styleNumber}
                                    onChange={(e) => setStyleNumber(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ) : (
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Enter Rack Space..."
                                    value={rackSpace}
                                    onChange={(e) => setRackSpace(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>

                        {/* Clear Button */}
                        {(styleNumber || rackSpace) && (
                            <button
                                onClick={handleClearSearch}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p className="font-bold">Error!</p>
                    <p>{error}</p>
                    <button
                        onClick={() => dispatch(clearError())}
                        className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Search Message (No data found) */}
            {searchMessage && (
                <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <p className="font-bold">Info</p>
                    <p>{searchMessage}</p>
                    <button
                        onClick={handleClearSearch}
                        className="mt-2 px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                        Show All Products
                    </button>
                </div>
            )}

            {/* Loading Spinner */}
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Products Table */}
            {!loading && showTable && (
                <>
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="py-4 px-4 font-medium text-left">#</th>
                                    <th className="py-4 px-4 font-medium text-left">Order Id</th>
                                    <th className="py-4 px-4 font-medium text-left">Style Number</th>
                                    <th className="py-4 px-4 font-medium text-left">Size</th>
                                    <th className="py-4 px-4 font-medium text-left">Color</th>
                                    <th className="py-4 px-4 font-medium text-left">Rack Space</th>
                                    <th className="py-4 px-4 font-medium text-left">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayProducts.map((p, i) => (
                                    <tr
                                        key={p._id}
                                        className="border-b border-gray-200 hover:bg-gray-50"
                                    >
                                        <td className="py-4 px-4">{(pagination.currentPage - 1) * pagination.limit + i + 1}</td>
                                        <td className="py-4 px-4">{p.order_id}</td>
                                        <td className="py-4 px-4">{p.style_number}</td>
                                        <td className="py-4 px-4">{p.size}</td>
                                        <td className="py-4 px-4">
                                            <span
                                                className="inline-block rounded-full text-xs py-1 px-4 text-white font-medium"
                                                style={{
                                                    backgroundColor: p?.color?.toLowerCase() === 'white' ? '#666' : p?.color?.toLowerCase(),
                                                }}
                                            >
                                                {p.color}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="inline-block bg-orange-500 text-white text-xs font-bold py-1 px-4 rounded-full">
                                                {p.rack_space}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">{p.inStock}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-4 md:space-y-0">
                            <div className="text-sm text-gray-600">
                                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{" "}
                                {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of{" "}
                                {pagination.totalRecords} products
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                    className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300"
                                >
                                    Previous
                                </button>

                                {pageNumbers.map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handlePageChange(num)}
                                        className={`px-3 py-1 rounded-md ${pagination.currentPage === num
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === totalPages}
                                    className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* No products message when not loading and no search message */}
            {!loading && !searchMessage && !showTable && (
                <div className="text-center py-8 bg-white rounded-lg shadow">
                    <p className="text-gray-500 text-lg">No products available</p>
                    <button
                        onClick={handleClearSearch}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Refresh Products
                    </button>
                </div>
            )}
        </div>
    );
};

export default MappedSKU;