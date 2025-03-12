import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/system';
import * as XLSX from 'xlsx';

// Styled Components
const PageContainer = styled(Container)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)',
  padding: '30px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const StyledTableContainer = styled(TableContainer)({
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  backgroundColor: '#ffffff',
  marginTop: '20px',
  border: '1px solid #e0e0e0',
});

const UploadBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px',
  backgroundColor: '#ffffff',
  padding: '25px',
  borderRadius: '10px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e0e0e0',
});

const StyledTabs = styled(Tabs)({
  marginBottom: '25px',
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  padding: '5px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  '& .MuiTab-root': {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#455a64',
    textTransform: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#e0f2f1',
      color: '#00695c',
    },
  },
  '& .Mui-selected': {
    color: '#ffffff',
    backgroundColor: '#ff7043',
    boxShadow: '0 2px 8px rgba(255, 112, 67, 0.3)',
  },
  '& .MuiTabs-indicator': {
    display: 'none',
  },
});

const FilterBox = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '25px',
  marginBottom: '20px',
  backgroundColor: '#ffffff',
  padding: '15px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
});

// Helper function to convert Excel serial number to date string
const excelSerialToDate = (serial) => {
  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400 * 1000);
  const day = date.getUTCDate();
  const month = date.toLocaleString('default', { month: 'long' });
  return `${day}${day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th'} ${month}`;
};

// Workshop Component (Sheets 2-13)
const WorkshopSheet = ({ data, title }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const dates = data && data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'offerElement' && key !== 'kpi') : [];
  const dateObjects = dates.map(date => ({
    original: date,
    parsed: new Date((parseFloat(date) - 25569) * 86400 * 1000),
    formatted: excelSerialToDate(parseFloat(date)),
  }));

  const filteredDates = dateObjects.filter(date => {
    if (!startDate || !endDate) return true;
    const start = new Date((parseFloat(startDate) - 25569) * 86400 * 1000);
    const end = new Date((parseFloat(endDate) - 25569) * 86400 * 1000);
    return date.parsed >= start && date.parsed <= end;
  }).map(date => date.original);

  const filteredData = data.map(item => {
    const rowData = { offerElement: item.offerElement, kpi: item.kpi };
    filteredDates.forEach(date => {
      rowData[date] = item[date];
    });
    return rowData;
  });

  return (
    <>
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: '600', color: '#00695c', marginBottom: '20px' }}
      >
        {title}
      </Typography>
      <FilterBox>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel sx={{ fontSize: '0.8rem', color: '#455a64' }}>Start Date</InputLabel>
          <Select
            value={startDate}
            label="Start Date"
            onChange={e => setStartDate(e.target.value)}
            sx={{ fontSize: '0.75rem', backgroundColor: '#fff', borderRadius: '6px', color: '#455a64' }}
          >
            <MenuItem value="">Select Start Date</MenuItem>
            {dateObjects.map((date, index) => (
              <MenuItem key={index} value={date.original} sx={{ fontSize: '0.75rem' }}>
                {date.formatted}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel sx={{ fontSize: '0.8rem', color: '#455a64' }}>End Date</InputLabel>
          <Select
            value={endDate}
            label="End Date"
            onChange={e => setEndDate(e.target.value)}
            sx={{ fontSize: '0.75rem', backgroundColor: '#fff', borderRadius: '6px', color: '#455a64' }}
          >
            <MenuItem value="">Select End Date</MenuItem>
            {dateObjects.map((date, index) => (
              <MenuItem key={index} value={date.original} sx={{ fontSize: '0.75rem' }}>
                {date.formatted}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </FilterBox>
      <StyledTableContainer component={Paper}>
        <Table sx={{ border: '1px solid #b0bec5' }}>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg, #00695c 0%, #00897b 100%)' }}>
              <TableCell sx={{ color: '#fff', fontWeight: '600', border: '1px solid #b0bec5', fontSize: '0.8rem', padding: '8px' }}>
                Offer Element
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '600', border: '1px solid #b0bec5', fontSize: '0.8rem', padding: '8px' }}>
                KPI
              </TableCell>
              {filteredDates.map((date, index) => (
                <TableCell key={index} sx={{ color: '#fff', fontWeight: '600', border: '1px solid #b0bec5', fontSize: '0.8rem', padding: '8px' }}>
                  {excelSerialToDate(parseFloat(date))}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData && filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f7fa' } }}>
                  <TableCell sx={{ border: '1px solid #b0bec5', fontSize: '0.75rem', padding: '8px', color: '#37474f' }}>
                    {item.offerElement}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #b0bec5', fontSize: '0.75rem', padding: '8px', color: '#37474f' }}>
                    {item.kpi || 'N/A'}
                  </TableCell>
                  {filteredDates.map((date, idx) => (
                    <TableCell key={idx} sx={{ border: '1px solid #b0bec5', fontSize: '0.75rem', padding: '8px', color: '#37474f' }}>
                      {item[date] !== '' ? item[date] : 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2 + filteredDates.length} align="center" sx={{ border: '1px solid #b0bec5', color: '#78909c', fontStyle: 'italic', fontSize: '0.75rem', padding: '8px' }}>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </>
  );
};

// Base Sheet Component (Sheet 1)
const BaseSheet = ({ data }) => {
  const headers = data && data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <>
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: '600', color: '#00695c', marginBottom: '20px' }}
      >
        Base Sheet
      </Typography>
      <StyledTableContainer component={Paper}>
        <Table sx={{ border: '1px solid #b0bec5' }}>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg, #00695c 0%, #00897b 100%)' }}>
              {headers.map((header, index) => (
                <TableCell key={index} sx={{ color: '#fff', fontWeight: '600', border: '1px solid #b0bec5', fontSize: '0.8rem', padding: '8px' }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f7fa' } }}>
                  {headers.map((header, idx) => (
                    <TableCell key={idx} sx={{ border: '1px solid #b0bec5', fontSize: '0.75rem', padding: '8px', color: '#37474f' }}>
                      {item[header] !== '' ? item[header] : 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={headers.length} align="center" sx={{ border: '1px solid #b0bec5', color: '#78909c', fontStyle: 'italic', fontSize: '0.75rem', padding: '8px' }}>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </>
  );
};

// Main App Component
const App = () => {
  const [tabValue, setTabValue] = useState(0);
  const [sheetData, setSheetData] = useState({});

  const tabNames = [
    'Base Sheet', // First tab
    'Trinity Auto',
    'Lucky Hi-Tech',
    'Car Tech Services',
    'Panchang Auto',
    'EZ Drive',
    'Marvel Automobile',
    'Round the clock',
    'V Auto Care',
    'Fidato',
    'NCR Wheels',
    'RK Big Toy',
    'SNA Automobile',
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      console.log("Available sheets:", workbook.SheetNames);

      const newSheetData = {};

      // Parse Sheet 1 (Base Sheet, index 0)
      const baseSheet = workbook.Sheets[workbook.SheetNames[0]];
      const baseSheetJson = XLSX.utils.sheet_to_json(baseSheet, { header: 1, defval: '' });
      console.log("Sheet 1 (Base Sheet) raw data:", baseSheetJson);

      const baseHeaders = baseSheetJson[0];
      const baseSheetData = baseSheetJson.slice(1).map(row => {
        const rowData = {};
        baseHeaders.forEach((header, idx) => {
          rowData[header] = row[idx] !== '' ? row[idx] : 'N/A';
        });
        return rowData;
      });
      newSheetData['Base Sheet'] = baseSheetData;

      // Parse Sheets 2-13 (Workshops, indices 1-12)
      for (let i = 1; i < 13; i++) {
        const sheetName = workbook.SheetNames[i];
        const sheet = workbook.Sheets[sheetName];
        const sheetJson = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        console.log(`Sheet ${i + 1} (${sheetName}) raw data:`, sheetJson);

        const headers = sheetJson[0];
        const workshopData = sheetJson.slice(1).map(row => {
          const rowData = { offerElement: row[0], kpi: row[1] || 'N/A' };
          headers.slice(2).forEach((date, idx) => {
            rowData[date] = row[idx + 2] !== '' ? row[idx + 2] : 'N/A';
          });
          return rowData;
        });
        newSheetData[tabNames[i]] = workshopData;
      }

      setSheetData(newSheetData);
      console.log("Parsed Sheet Data:", newSheetData);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <PageContainer maxWidth="xl">
      {!Object.keys(sheetData).length ? (
        <UploadBox>
          <Typography variant="h6" sx={{ fontWeight: '600', color: '#00695c' }}>
            Please Upload Excel File
          </Typography>
          <Button
            variant="contained"
            component="label"
            sx={{ backgroundColor: '#ff7043', '&:hover': { backgroundColor: '#f4511e' }, fontSize: '0.8rem', padding: '8px 16px', color: '#fff' }}
          >
            Upload File
            <input type="file" hidden accept=".xlsx, .xls" onChange={handleFileUpload} />
          </Button>
        </UploadBox>
      ) : (
        <>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: '600', color: '#00695c', marginBottom: '30px', textShadow: '1px 1px 4px rgba(0,0,0,0.1)' }}
          >
            Workshop Progress Tracker
          </Typography>
          <StyledTabs value={tabValue} onChange={handleTabChange} centered variant="scrollable" scrollButtons="auto">
            {tabNames.map((name, index) => (
              <Tab key={index} label={name} />
            ))}
          </StyledTabs>
          {tabValue === 0 ? (
            <BaseSheet data={sheetData['Base Sheet']} />
          ) : (
            <WorkshopSheet data={sheetData[tabNames[tabValue]]} title={tabNames[tabValue]} />
          )}
        </>
      )}
    </PageContainer>
  );
};

export default App;