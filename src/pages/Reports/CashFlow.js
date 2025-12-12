import React, { useState, useEffect } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import './BalanceSheet and IncomeStatment.css'; // Reuse same CSS

export default function CashFlowReport() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('Daily'); // Daily, Weekly, Monthly
  const [error, setError] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  // Fetch locations on mount
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

  // Fetch cash flow report
  const fetchCashFlow = async () => {
    if (!startDate || !endDate || !selectedLocation) {
      setError('Please select start date, end date, location, and period');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.get('FinancialReport/cashFlow', {
        params: {
          startDate,
          endDate,
          locationId: selectedLocation,
          period
        }
      });
      setReport(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch cash flow report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="financial-report-page">
      <Topbar />
      <Sidebar />

      <div className="financial-report-container full-width">
        <h2>Cash Flow Statement</h2>

        {/* Filters */}
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
              {locations.map((loc) => (
                <option key={loc.locationId} value={loc.locationId}>
                  {loc.locationName}
                </option>
              ))}
            </select>
          </label>

          <label>
            Period:
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </label>

          <button onClick={fetchCashFlow}>Generate Cash Flow</button>
        </div>

        {error && <p className="error">{error}</p>}
        {loading && <p>Loading...</p>}

        {/* Cash Flow Table */}
        {report.length > 0 && !loading && (
          <div className="report-tables full-width">
            <h3>
              Cash Flow ({startDate} to {endDate}) - {period} Report
            </h3>
            <table className="full-width-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Total Cash Inflow</th>
                  <th>Total Cash Outflow</th>
                  <th>Net Cash Flow</th>
                </tr>
              </thead>
              <tbody>
                {report.map((r, index) => (
                  <tr key={index}>
                    <td>{r.period}</td>
                    <td>{r.totalCashInflow.toFixed(2)}</td>
                    <td>{r.totalCashOutflow.toFixed(2)}</td>
                    <td className={r.netCashFlow >= 0 ? 'profit' : 'loss'}>
                      {r.netCashFlow.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
