import React from 'react';
import '../../styles/common/Pagination.css';

const Pagination = ({
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    totalItems = 0,
    itemsPerPage = 10,
    onItemsPerPageChange,
    loading = false
}) => {
    // Ensure all inputs are numbers to prevent NaN
    const safeCurrentPage = Number(currentPage) || 1;
    const safeItemsPerPage = Number(itemsPerPage) || 10;
    const safeTotalItems = Number(totalItems) || 0;
    const safeTotalPages = Number(totalPages) || 1;

    // Generate array of page numbers to display
    const getPageNumbers = () => {
        const delta = 2; // Number of pages to show around current page
        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= safeTotalPages; i++) {
            if (i === 1 || i === safeTotalPages || (i >= safeCurrentPage - delta && i <= safeCurrentPage + delta)) {
                range.push(i);
            }
        }

        let l;
        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    if (safeTotalItems === 0) return null;

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                <span className="info-text">
                    Mostrando <strong>{Math.min((safeCurrentPage - 1) * safeItemsPerPage + 1, safeTotalItems)}</strong> - <strong>{Math.min(safeCurrentPage * safeItemsPerPage, safeTotalItems)}</strong> de <strong>{safeTotalItems}</strong> resultados
                </span>

                {onItemsPerPageChange && (
                    <div className="items-per-page-selector">
                        <label>Mostrar</label>
                        <select
                            value={safeItemsPerPage}
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                            disabled={loading}
                        >
                            <option value="3">3</option>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="pagination-controls">
                <button
                    className="page-btn prev"
                    onClick={() => onPageChange(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1 || loading}
                    title="Anterior"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                <div className="page-numbers">
                    {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={`dots-${index}`} className="dots">...</span>
                        ) : (
                            <button
                                key={page}
                                className={`page-number ${safeCurrentPage === page ? 'active' : ''}`}
                                onClick={() => onPageChange(page)}
                                disabled={loading}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>

                <button
                    className="page-btn next"
                    onClick={() => onPageChange(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === safeTotalPages || loading}
                    title="Siguiente"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Pagination;
