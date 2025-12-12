import React, { useState, useEffect } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import './BalanceSheet and IncomeStatment.css'; // reuse CSS

export default function COGSReportPage() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('Daily');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('Location');
        setLocations(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLocations();
  }, []);

  const fetchCOGSReport = async () => {
    if (!startDate || !endDate || !selectedLocation) {
      setError('Please select start date, end date, and location');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await api.get('FinancialReport/cogsReport', {
        params: {
          startDate,
          endDate,
          locationId: selectedLocation,
          period
        }
      });
      setReport(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch COGS report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="financial-report-page">
      <Topbar />
      <Sidebar />

      <div className="financial-report-container">
        <h2>COGS Report</h2>

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

          <button onClick={fetchCOGSReport}>Generate Report</button>
        </div>

        {error && <p className="error">{error}</p>}
        {loading && <p>Loading...</p>}

        {/* Report Table */}
        {report.length > 0 && !loading && (
          <div className="report-tables">
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Total Revenue</th>
                  <th>Total COGS</th>
                  <th>Gross Profit</th>
                </tr>
              </thead>
              <tbody>
                {report.map((r, index) => (
                  <tr key={index}>
                    <td>{r.period}</td>
                    <td>{r.totalRevenue.toFixed(2)}</td>
                    <td>{r.totalCOGS.toFixed(2)}</td>
                    <td className={r.grossProfit >= 0 ? 'profit' : 'loss'}>
                      {r.grossProfit.toFixed(2)}
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
