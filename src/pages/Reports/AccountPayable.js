import React, { useState, useEffect } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import './BalanceSheet and IncomeStatment.css';

export default function AccountsPayableReport() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('Daily'); // Daily, Weekly, Monthly
  const [error, setError] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get('Location');
        setLocations(response.data);
      } catch (err) {
        console.error('Failed to fetch locations', err);
      }
    };
    fetchLocations();
  }, []);

  const fetchPayableReport = async () => {
    if (!startDate || !endDate || !selectedLocation) {
      setError('Please select start date, end date, location, and period');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.get('FinancialReport/accountsPayable', {
        params: { startDate, endDate, locationId: selectedLocation, period }
      });
      setReport(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch accounts payable report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="financial-report-page">
      <Topbar />
      <Sidebar />

      <div className="financial-report-container">
        <h2>Accounts Payable Report</h2>

        {/* Filters */}
        <div className="report-filters">
          <label>
            Start Date:
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>

          <label>
            End Date:
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>

          <label>
            Location:
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
              <option value="">Select Location</option>
              {locations.map(loc => (
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

          <button onClick={fetchPayableReport}>Generate Report</button>
        </div>

        {error && <p className="error">{error}</p>}
        {loading && <p>Loading...</p>}

        {/* Full-width Table Report */}
        {report.length > 0 && !loading && (
          <div className="report-tables">
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Total Payable Amount</th>
                  <th>Total Paid Amount</th>
                  <th>Pending Amount</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row, index) => (
                  <tr key={index}>
                    <td>{row.period}</td>
                    <td>{row.totalPayableAmount?.toFixed(2) ?? '0.00'}</td>
                    <td>{row.totalPaidAmount?.toFixed(2) ?? '0.00'}</td>
                    <td className={row.pendingAmount >= 0 ? 'loss' : 'profit'}>
                      {row.pendingAmount?.toFixed(2) ?? '0.00'}
                      {row.pendingAmount >= 0 ? ' (Pending)' : ' (Overpaid)'}
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
