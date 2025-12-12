import React, { useState, useEffect } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import './BalanceSheet and IncomeStatment.css';

export default function FinancialReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  // ✅ Fetch locations from backend on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get('Location'); // Adjust endpoint if needed
        setLocations(response.data);
      } catch (err) {
        console.error('Failed to fetch locations', err);
      }
    };
    fetchLocations();
  }, []);

  const fetchReport = async () => {
    if (!startDate || !endDate || !selectedLocation) {
      setError('Please select start date, end date, and location');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.get('FinancialReport/financialReport', {
        params: { 
          startDate, 
          endDate, 
          locationId: selectedLocation // 👈 send locationId
        }
      });

      setReport(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch financial report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="financial-report-page">
      <Topbar />
      <Sidebar />

      <div className="financial-report-container">
        <h2>Financial Report</h2>

        {/* Date & Location filters */}
        <div className="report-filters">
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>

          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>

          <label>
            Location:
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">Select Location</option>
              {locations.map(loc => (
                <option key={loc.locationId} value={loc.locationId}>
                  {loc.locationName}
                </option>
              ))}
            </select>
          </label>

          <button onClick={fetchReport}>Generate Report</button>
        </div>

        {error && <p className="error">{error}</p>}
        {loading && <p>Loading...</p>}

        {/* Report Display */}
        {report && !loading && (
          <div className="report-tables">
            {/* Balance Sheet */}
            <div className="balance-sheet">
              <h3>Balance Sheet (As of {report.endDate})</h3>
              <table>
                <tbody>
                  <tr>
                    <td>Total Assets</td>
                    <td>{report.totalAssets?.toFixed(2) ?? "0.00"}</td>
                  </tr>
                  <tr>
                    <td>Total Liabilities</td>
                    <td>{report.totalLiabilities?.toFixed(2) ?? "0.00"}</td>
                  </tr>
                  <tr>
                    <td>Total Equity</td>
                    <td>{report.totalEquity?.toFixed(2) ?? "0.00"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Income Statement */}
            <div className="income-statement">
              <h3>Income Statement ({report.startDate} to {report.endDate})</h3>
              <table>
                <tbody>
                  <tr>
                    <td>Total Revenue</td>
                    <td>{report.totalRevenue?.toFixed(2) ?? "0.00"}</td>
                  </tr>
                  <tr>
                    <td>Total Expenses</td>
                    <td>{report.totalExpenses?.toFixed(2) ?? "0.00"}</td>
                  </tr>
                  <tr>
                    <td>Net Income</td>
                    <td className={report.netIncome >= 0 ? "profit" : "loss"}>
                      {report.netIncome?.toFixed(2) ?? "0.00"}{" "}
                      {report.netIncome >= 0 ? "(Profit)" : "(Loss)"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
