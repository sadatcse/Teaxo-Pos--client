import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaFilter, FaSearch, FaEye, FaTimesCircle, FaTrash, FaStar, FaRegStar } from 'react-icons/fa';

import Mtitle from '../../components library/Mtitle';
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from '../../providers/AuthProvider';
import CookingAnimation from '../../components/CookingAnimation';

// Custom hook for debouncing input
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

// Helper component to display star ratings
const StarRating = ({ rating }) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating);
    return (
        <div className="flex items-center text-yellow-500">
            {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} />)}
            {[...Array(totalStars - fullStars)].map((_, i) => <FaRegStar key={`empty-${i}`} />)}
        </div>
    );
};

const ViewReview = () => {
    const axiosSecure = UseAxiosSecure();
    const { user, branch } = useContext(AuthContext);

    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState({});

    // State for modals
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    // State for filters & search
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [ratingFilter, setRatingFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Effect to reset the page to 1 whenever a filter changes.
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, startDate, endDate, ratingFilter]);

    // Main data fetching effect
    useEffect(() => {
        const fetchReviews = async () => {
            if (!branch) return;
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('page', currentPage);
                params.append('limit', 10);
                if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
                if (startDate) params.append('startDate', startDate.toISOString());
                if (endDate) params.append('endDate', endDate.toISOString());
                if (ratingFilter) params.append('rating', ratingFilter);
                
                const response = await axiosSecure.get(`/review/branch/${branch}?${params.toString()}`);
                
                // --- FIX: Access the 'data' property for the reviews array ---
                setReviews(response.data.data || []);
                setPagination(response.data.pagination || {});

            } catch (error) {
                console.error("Error fetching reviews:", error);
                Swal.fire("Error!", "Failed to fetch reviews.", "error");
                setReviews([]);
            }
            setIsLoading(false);
        };

        fetchReviews();
    }, [axiosSecure, branch, debouncedSearchTerm, startDate, endDate, ratingFilter, currentPage]);

    const clearFilters = () => {
        setRatingFilter('');
        setSearchTerm('');
        setDateRange([null, null]);
        setIsFilterOpen(false);
    };

    const handleViewReview = (review) => {
        setSelectedReview(review);
        setIsViewModalOpen(true);
    };

    const handleDeleteReview = (reviewId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axiosSecure.delete(`/review/${reviewId}`);
                    if (response.status === 200) {
                        Swal.fire('Deleted!', 'The review has been deleted.', 'success');
                        setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
                    } else {
                        Swal.fire('Error!', response.data.message || 'Failed to delete the review.', 'error');
                    }
                } catch (error) {
                    console.error("Error deleting review:", error);
                    const errorMessage = error.response?.data?.message || 'An error occurred.';
                    Swal.fire('Error!', errorMessage, 'error');
                }
            }
        });
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && (!pagination.totalPages || newPage <= pagination.totalPages)) {
            setCurrentPage(newPage);
        }
    };
    
    const renderTableBody = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan="6" className="text-center py-10">
                        <CookingAnimation />
                    </td>
                </tr>
            );
        }

        if (!Array.isArray(reviews) || reviews.length === 0) {
            return (
                <tr>
                    <td colSpan="6" className="text-center py-16 text-gray-500">
                        <p className="text-lg font-medium">No Reviews Found</p>
                        <p className="text-sm">Try adjusting your search or filter criteria.</p>
                    </td>
                </tr>
            );
        }

        return reviews.map((review) => (
            <tr key={review._id} className="hover:bg-gray-50 border-t">
                <td className="p-3 text-sm text-gray-800">{new Date(review.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-sm text-gray-800 font-medium">{review.customerName}</td>
                <td className="p-3 text-sm"><StarRating rating={review.rating} /></td>
                <td className="p-3 text-sm text-gray-600 max-w-xs truncate">{review.comment || 'N/A'}</td>
                <td className="p-3 text-sm text-gray-700 font-semibold">{review.bestFoodName || 'N/A'}</td>
                <td className="p-3">
                    <div className="flex justify-center items-center gap-4">
                        <button onClick={() => handleViewReview(review)} className="text-blue-600 hover:text-blue-800 transition" title="View Review"><FaEye size={18} /></button>
                        {user && user.role === 'admin' && (
                            <button onClick={() => handleDeleteReview(review._id)} className="text-red-600 hover:text-red-800 transition" title="Delete Review"><FaTrash size={16} /></button>
                        )}
                    </div>
                </td>
            </tr>
        ));
    };

    return (
        <div className="p-4 md:p-6 min-h-screen bg-gray-50">
            <Mtitle title="Customer Reviews" />

            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => setDateRange(update)}
                        isClearable={true}
                        placeholderText="Filter by submission date"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="relative w-full">
                        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by customer, mobile, comment..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-10 border rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative w-full">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="w-full flex items-center justify-center gap-2 p-2 border rounded-md bg-white hover:bg-gray-100 transition"
                        >
                            <FaFilter className="text-gray-600" />
                            <span>Filter by Rating</span>
                        </button>
                        {isFilterOpen && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white border rounded-lg shadow-xl z-20 p-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating</label>
                                        <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="w-full p-2 border rounded-md">
                                            <option value="">All Ratings</option>
                                            <option value="5">5 Stars</option>
                                            <option value="4">4 Stars</option>
                                            <option value="3">3 Stars</option>
                                            <option value="2">2 Stars</option>
                                            <option value="1">1 Star</option>
                                        </select>
                                    </div>
                                    <button onClick={clearFilters} className="w-full p-2 mt-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <section className="overflow-x-auto bg-white border shadow-sm rounded-lg">
                <table className="table w-full">
                    <thead className="bg-blue-600">
                        <tr className="text-sm font-semibold text-white uppercase tracking-wider text-left">
                            <th className="p-3">Date</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Rating</th>
                            <th className="p-3">Comment</th>
                            <th className="p-3">Favorite Food</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderTableBody()}
                    </tbody>
                </table>
            </section>
            
            {reviews && reviews.length > 0 && pagination && pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 p-2 bg-white rounded-md shadow-sm border">
                    <span className="text-sm text-gray-700">
                        Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong>
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages} className="px-4 py-2 text-sm bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                    </div>
                </div>
            )}

            {isViewModalOpen && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center p-5 border-b">
                            <h2 className="text-xl font-bold text-gray-800">Review Details</h2>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-red-500">
                                <FaTimesCircle size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-700">Rating:</span>
                                <StarRating rating={selectedReview.rating} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-700">Customer:</span>
                                <span>{selectedReview.customerName} ({selectedReview.customerMobile})</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-700">Date:</span>
                                <span>{new Date(selectedReview.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-700">Favorite Food:</span>
                                <span>{selectedReview.bestFoodName || 'Not specified'}</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Comment:</h4>
                                <p className="text-gray-600 bg-gray-100 p-3 rounded-md min-h-[80px]">
                                    {selectedReview.comment || 'No comment was left.'}
                                </p>
                            </div>
                            <div className='text-sm text-gray-500 border-t pt-2'>
                                <p>Invoice ID: {selectedReview.invoiceId?.invoiceSerial || 'N/A'}</p>
                                <p>Table: {selectedReview.tableName}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewReview;
