import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className = ''
}) => {
  // Calcular las páginas visibles
  const getVisiblePages = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajustar si no hay suficientes páginas al final
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  const visiblePages = getVisiblePages();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };
  
  const buttonBaseClasses = "flex items-center justify-center px-3 py-2 text-sm font-medium transition-all duration-200 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2";
  const activeButtonClasses = "bg-primary-600 text-white border-primary-600 hover:bg-primary-700";
  const disabledButtonClasses = "opacity-50 cursor-not-allowed hover:bg-transparent";
  
  if (totalPages <= 1) return null;
  
  return (
    <nav className={`flex items-center justify-center space-x-1 ${className}`}>
      {/* First Page */}
      {showFirstLast && !isFirstPage && visiblePages[0] > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePageChange(1)}
            className={`${buttonBaseClasses} rounded-l-lg`}
          >
            1
          </motion.button>
          {visiblePages[0] > 2 && (
            <span className="px-2 py-2 text-gray-500">...</span>
          )}
        </>
      )}
      
      {/* Previous Page */}
      {showPrevNext && (
        <motion.button
          whileHover={!isFirstPage ? { scale: 1.05 } : {}}
          whileTap={!isFirstPage ? { scale: 0.95 } : {}}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isFirstPage}
          className={`
            ${buttonBaseClasses}
            ${isFirstPage ? disabledButtonClasses : ''}
            ${!showFirstLast || (showFirstLast && isFirstPage) ? 'rounded-l-lg' : ''}
          `}
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="ml-1 hidden sm:inline">Anterior</span>
        </motion.button>
      )}
      
      {/* Page Numbers */}
      {visiblePages.map((page) => (
        <motion.button
          key={page}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(page)}
          className={`
            ${buttonBaseClasses}
            ${page === currentPage ? activeButtonClasses : ''}
          `}
        >
          {page}
        </motion.button>
      ))}
      
      {/* Next Page */}
      {showPrevNext && (
        <motion.button
          whileHover={!isLastPage ? { scale: 1.05 } : {}}
          whileTap={!isLastPage ? { scale: 0.95 } : {}}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isLastPage}
          className={`
            ${buttonBaseClasses}
            ${isLastPage ? disabledButtonClasses : ''}
            ${!showFirstLast || (showFirstLast && isLastPage) ? 'rounded-r-lg' : ''}
          `}
        >
          <span className="mr-1 hidden sm:inline">Siguiente</span>
          <ChevronRightIcon className="w-4 h-4" />
        </motion.button>
      )}
      
      {/* Last Page */}
      {showFirstLast && !isLastPage && visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 py-2 text-gray-500">...</span>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePageChange(totalPages)}
            className={`${buttonBaseClasses} rounded-r-lg`}
          >
            {totalPages}
          </motion.button>
        </>
      )}
    </nav>
  );
};

// Componente de información de paginación
export const PaginationInfo = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className = ''
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  return (
    <div className={`text-sm text-gray-700 ${className}`}>
      Mostrando <span className="font-medium">{startItem}</span> a{' '}
      <span className="font-medium">{endItem}</span> de{' '}
      <span className="font-medium">{totalItems}</span> resultados
    </div>
  );
};

// Componente de paginación simple (solo anterior/siguiente)
export const SimplePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <motion.button
        whileHover={!isFirstPage ? { scale: 1.05 } : {}}
        whileTap={!isFirstPage ? { scale: 0.95 } : {}}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        className={`
          flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors
          ${isFirstPage ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <ChevronLeftIcon className="w-4 h-4 mr-2" />
        Anterior
      </motion.button>
      
      <span className="text-sm text-gray-700">
        Página <span className="font-medium">{currentPage}</span> de{' '}
        <span className="font-medium">{totalPages}</span>
      </span>
      
      <motion.button
        whileHover={!isLastPage ? { scale: 1.05 } : {}}
        whileTap={!isLastPage ? { scale: 0.95 } : {}}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        className={`
          flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors
          ${isLastPage ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        Siguiente
        <ChevronRightIcon className="w-4 h-4 ml-2" />
      </motion.button>
    </div>
  );
};

// Componente de selector de elementos por página
export const ItemsPerPageSelector = ({
  itemsPerPage,
  onItemsPerPageChange,
  options = [10, 25, 50, 100],
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label className="text-sm text-gray-700">Mostrar:</label>
      <select
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-sm text-gray-700">por página</span>
    </div>
  );
};

export default Pagination;