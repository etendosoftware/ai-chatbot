'use client';
import React, {useEffect, useState} from "react"

export const DataGrid = ({
                           args
                         }: {
  args?: {
    columns?: string[];
    criteria?: string[];
    sortBy?: string;
  };
}) => {
  const [dat, setDat] = useState<any[]>([]);
  const [cols, setCols] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: '', direction: null }); // Sorting state
  const rowsPerPage = 5; // Number of rows per page

  const _selectedProperties = args?.columns?.join("%2C")

  let _criteria = '&';
  args?.criteria?.forEach((c) => {
    _criteria += 'criteria=' + encodeURIComponent(c) + '&';
  });
  // get NEXT_PUBLIC_ETENDO_URL
  const etendoUrl = process.env.NEXT_PUBLIC_ETENDO_URL || 'http://localhost:8080/etendo';

  useEffect(() => {
    fetch(
      etendoUrl + '/org.openbravo.service.datasource/Order',
      {
        headers: {
          accept: '*/*',
          'accept-language': 'es-419,es;q=0.9',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'sec-ch-ua':
            '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          Authorization: 'Basic ' + btoa('admin:admin'),
        },
        referrer: 'http://localhost:8080/etendo/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body:
          '_noCount=true&%40Order.documentType%40=null&%40Order.deliveryMethod%40=null&%40Order.shippingCompany%40=null&%40Order.freightCostRule%40=null&%40Order.replacementorder%40=null&%40Order.id%40=null&%40Order.client%40=null&%40Order.processed%40=null&%40Order.salesTransaction%40=null&%40Order.posted%40=null&%40Order.organization%40=null&%40Order.orderDate%40=null&%40Order.businessPartner%40=null&%40Order.partnerAddress%40=null&%40Order.priceList%40=null&%40Order.scheduledDeliveryDate%40=null&%40Order.warehouse%40=null&%40Order.documentStatus%40=null&%40Order.grandTotalAmount%40=null&%40Order.currency%40=null&isImplicitFilterApplied=false' +
          '&_selectedProperties=' +
          _selectedProperties +
          '&windowId=143&tabId=186&moduleId=0&_operationType=fetch&_noActiveFilter=true&sendOriginalIDBack=true&_extraProperties=&Constants_FIELDSEPARATOR=%24&_className=OBViewDataSource&Constants_IDENTIFIER=_identifier&operator=and&_constructor=AdvancedCriteria' +
          '&_startRow=0&_endRow=100' +
          '&_sortBy=' + (args?.sortBy ?? '') +
          _criteria +
          '&_textMatchStyle=substring&_componentId=isc_OBViewGrid_0&_dataSource=isc_OBViewDataSource_0&isc_metaDataPrefix=_&isc_dataFormat=json',
        method: 'POST',
        mode: 'cors',
      },
    )
      .then(response => {
        return response.json();
      })
      .then(data => {
        setDat(data.response.data);
        const cols: any = [];
        if (!data.response?.data?.length) {
          setCols([]);
          return;
        }
        Object.keys(data.response.data[0]).forEach(key => {
          cols.push({
            key,
            label: key,
            visible: true,
            width: '20%',
          });
        });
        setCols(cols.slice(3, cols.length - 1));
        console.log(cols);
        console.log(data);
      });
  }, []);

  // Sorting function
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null; // Reset sorting
    }
    setSortConfig({ key, direction });

    if (direction === null) {
      // Reset to original data if sorting is cleared
      setDat([...dat]); // Assuming you have the original data stored somewhere
      return;
    }

    const sortedData = [...dat].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setDat(sortedData);
  };

  // Pagination logic
  const totalPages = Math.ceil(dat.length / rowsPerPage);
  const paginatedData = dat.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="w-full">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <div className="border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {cols.map((col, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    {sortConfig.key === col.key && (
                      <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length ? (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    {cols.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={cols.length}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {dat.length > 0 && (
        <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
