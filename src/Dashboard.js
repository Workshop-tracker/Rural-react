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
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/system';
import * as XLSX from 'xlsx';

// Overall container with a soft gradient and updated spacing
const PageContainer = styled(Container)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  padding: '40px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

// Table container with a softer look
const StyledTableContainer = styled(TableContainer)({
  borderRadius: '12px',
  boxShadow: '0 6px 30px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#ffffff',
  marginTop: '20px',
  border: '2px solid #00897b',
});

// Container for file uploads
const UploadBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px',
  backgroundColor: '#ffffff',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e0e0e0',
});

// Customized Tabs with refined hover effects and lighter selected color
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
    transition: 'background-color 0.3s, color 0.3s',
    '&:hover': {
      backgroundColor: '#e0f2f1',
      color: '#00695c',
    },
  },
  '& .Mui-selected': {
    color: '#37474f',
    backgroundColor: '#80cbc4', // Lighter teal for the selected tab
    boxShadow: '0 2px 8px rgba(0, 150, 136, 0.3)',
  },
  '& .MuiTabs-indicator': {
    display: 'none',
  },
});

// Filter Box for dropdown controls
const FilterBox = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '25px',
  marginBottom: '20px',
  backgroundColor: '#ffffff',
  padding: '15px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
});

// Helper to convert Excel serial dates to a human-readable format
const excelSerialToDate = (serial) => {
  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400 * 1000);
  const day = date.getUTCDate();
  const month = date.toLocaleString('default', { month: 'long' });
  return `${day}${
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
      ? 'nd'
      : day % 10 === 3 && day !== 13
      ? 'rd'
      : 'th'
  } ${month}`;
};

// BaseSheet component displays the first Excel sheet
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
        <Table sx={{ border: '2px solid #00897b' }}>
          <TableHead>
            <TableRow
              // Lighter header background gradient
              sx={{
                background: 'linear-gradient(90deg, #b2dfdb 0%, #80cbc4 100%)',
              }}
            >
              {headers.map((header, index) => (
                <TableCell
                  key={index}
                  sx={{
                    color: '#37474f',
                    fontWeight: '600',
                    border: '2px solid #00897b',
                    fontSize: '0.8rem',
                    padding: '8px',
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((item, index) => (
                <TableRow
                  key={index}
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f1f8e9' } }}
                >
                  {headers.map((header, idx) => (
                    <TableCell
                      key={idx}
                      sx={{
                        border: '2px solid #00897b',
                        fontSize: '0.75rem',
                        padding: '8px',
                        color: '#37474f',
                      }}
                    >
                      {item[header] !== '' ? item[header] : 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={headers.length}
                  align="center"
                  sx={{
                    border: '2px solid #00897b',
                    color: '#78909c',
                    fontStyle: 'italic',
                    fontSize: '0.75rem',
                    padding: '8px',
                  }}
                >
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

// CommonWorkshops aggregates all workshop sheets with filtering
const CommonWorkshops = ({ data, title }) => {
  // Collect all date keys (excluding non-date fields)
  const dateKeySet = new Set();
  data?.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (!['offerElement', 'kpi', 'workshopName'].includes(key)) {
        dateKeySet.add(key);
      }
    });
  });
  let dateKeys = Array.from(dateKeySet);
  dateKeys.sort((a, b) => parseFloat(a) - parseFloat(b));

  // Offer Element filter
  const offerElements = data && data.length > 0 ? [...new Set(data.map((item) => item.offerElement))] : [];
  const [offerElementFilter, setOfferElementFilter] = useState([]);
  const handleOfferElementChange = (event) => {
    const value = event.target.value;
    if (value.includes('select-all')) {
      setOfferElementFilter(
        offerElementFilter.length === offerElements.length ? [] : [...offerElements]
      );
    } else {
      setOfferElementFilter(value);
    }
  };
  const isAllOfferSelected = offerElements.length > 0 && offerElementFilter.length === offerElements.length;

  // Workshop filter
  const workshops = data && data.length > 0 ? [...new Set(data.map((item) => item.workshopName))] : [];
  const [workshopFilter, setWorkshopFilter] = useState([]);
  const handleWorkshopChange = (event) => {
    const value = event.target.value;
    if (value.includes('select-all')) {
      setWorkshopFilter(workshopFilter.length === workshops.length ? [] : [...workshops]);
    } else {
      setWorkshopFilter(value);
    }
  };
  const isAllWorkshopSelected = workshops.length > 0 && workshopFilter.length === workshops.length;

  // Date filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const filteredDates = dateKeys.filter((date) => {
    if (!startDate || !endDate) return true;
    const start = parseFloat(startDate);
    const end = parseFloat(endDate);
    return parseFloat(date) >= start && parseFloat(date) <= end;
  });

  // Combine all filters
  const filteredData = data
    .filter(
      (item) =>
        workshopFilter.length === 0 || workshopFilter.includes(item.workshopName)
    )
    .filter(
      (item) =>
        offerElementFilter.length === 0 || offerElementFilter.includes(item.offerElement)
    )
    .map((item) => {
      const rowData = {
        workshopName: item.workshopName,
        offerElement: item.offerElement,
        kpi: item.kpi,
      };
      filteredDates.forEach((date) => {
        rowData[date] = item[date] || 'N/A';
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
        {/* Workshop Filter */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel sx={{ fontSize: '0.8rem', color: '#455a64' }}>Workshop</InputLabel>
          <Select
            multiple
            value={workshopFilter}
            label="Workshop"
            onChange={handleWorkshopChange}
            renderValue={(selected) => selected.join(', ')}
            sx={{ fontSize: '0.75rem', backgroundColor: '#fff', borderRadius: '6px', color: '#455a64' }}
          >
            <MenuItem value="select-all" sx={{ fontSize: '0.75rem' }}>
              <Checkbox
                checked={isAllWorkshopSelected}
                size="small"
                sx={{ color: '#00695c', '&.Mui-checked': { color: '#00695c' } }}
              />
              Select All
            </MenuItem>
            {workshops.map((ws, index) => (
              <MenuItem key={index} value={ws} sx={{ fontSize: '0.75rem' }}>
                <Checkbox
                  checked={workshopFilter.includes(ws)}
                  size="small"
                  sx={{ color: '#00695c', '&.Mui-checked': { color: '#00695c' } }}
                />
                {ws}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Offer Element Filter */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel sx={{ fontSize: '0.8rem', color: '#455a64' }}>
            Offer Element
          </InputLabel>
          <Select
            multiple
            value={offerElementFilter}
            label="Offer Element"
            onChange={handleOfferElementChange}
            renderValue={(selected) => selected.join(', ')}
            sx={{ fontSize: '0.75rem', backgroundColor: '#fff', borderRadius: '6px', color: '#455a64' }}
          >
            <MenuItem value="select-all" sx={{ fontSize: '0.75rem' }}>
              <Checkbox
                checked={isAllOfferSelected}
                size="small"
                sx={{ color: '#00695c', '&.Mui-checked': { color: '#00695c' } }}
              />
              Select All
            </MenuItem>
            {offerElements.map((offer, index) => (
              <MenuItem key={index} value={offer} sx={{ fontSize: '0.75rem' }}>
                <Checkbox
                  checked={offerElementFilter.includes(offer)}
                  size="small"
                  sx={{ color: '#00695c', '&.Mui-checked': { color: '#00695c' } }}
                />
                {offer}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date Filters */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel sx={{ fontSize: '0.8rem', color: '#455a64' }}>Start Date</InputLabel>
          <Select
            value={startDate}
            label="Start Date"
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ fontSize: '0.75rem', backgroundColor: '#fff', borderRadius: '6px', color: '#455a64' }}
          >
            <MenuItem value="">Select Start Date</MenuItem>
            {dateKeys.map((date, index) => (
              <MenuItem key={index} value={date} sx={{ fontSize: '0.75rem' }}>
                {excelSerialToDate(parseFloat(date))}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel sx={{ fontSize: '0.8rem', color: '#455a64' }}>End Date</InputLabel>
          <Select
            value={endDate}
            label="End Date"
            onChange={(e) => setEndDate(e.target.value)}
            sx={{ fontSize: '0.75rem', backgroundColor: '#fff', borderRadius: '6px', color: '#455a64' }}
          >
            <MenuItem value="">Select End Date</MenuItem>
            {dateKeys.map((date, index) => (
              <MenuItem key={index} value={date} sx={{ fontSize: '0.75rem' }}>
                {excelSerialToDate(parseFloat(date))}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </FilterBox>

      <StyledTableContainer component={Paper}>
        <Table sx={{ border: '2px solid #00897b' }}>
          <TableHead>
            <TableRow
              // Lighter header background gradient
              sx={{
                background: 'linear-gradient(90deg, #b2dfdb 0%, #80cbc4 100%)',
              }}
            >
              <TableCell
                sx={{
                  color: '#37474f',
                  fontWeight: '600',
                  border: '2px solid #00897b',
                  fontSize: '0.8rem',
                  padding: '8px',
                }}
              >
                Workshop
              </TableCell>
              <TableCell
                sx={{
                  color: '#37474f',
                  fontWeight: '600',
                  border: '2px solid #00897b',
                  fontSize: '0.8rem',
                  padding: '8px',
                }}
              >
                Offer Element
              </TableCell>
              <TableCell
                sx={{
                  color: '#37474f',
                  fontWeight: '600',
                  border: '2px solid #00897b',
                  fontSize: '0.8rem',
                  padding: '8px',
                }}
              >
                KPI
              </TableCell>
              {filteredDates.map((date, index) => (
                <TableCell
                  key={index}
                  sx={{
                    color: '#37474f',
                    fontWeight: '600',
                    border: '2px solid #00897b',
                    fontSize: '0.8rem',
                    padding: '8px',
                  }}
                >
                  {excelSerialToDate(parseFloat(date))}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData && filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f1f8e9' } }}>
                  <TableCell
                    sx={{
                      border: '2px solid #00897b',
                      fontSize: '0.75rem',
                      padding: '8px',
                      color: '#37474f',
                    }}
                  >
                    {item.workshopName}
                  </TableCell>
                  <TableCell
                    sx={{
                      border: '2px solid #00897b',
                      fontSize: '0.75rem',
                      padding: '8px',
                      color: '#37474f',
                    }}
                  >
                    {item.offerElement}
                  </TableCell>
                  <TableCell
                    sx={{
                      border: '2px solid #00897b',
                      fontSize: '0.75rem',
                      padding: '8px',
                      color: '#37474f',
                    }}
                  >
                    {item.kpi || 'N/A'}
                  </TableCell>
                  {filteredDates.map((date, idx) => (
                    <TableCell
                      key={idx}
                      sx={{
                        border: '2px solid #00897b',
                        fontSize: '0.75rem',
                        padding: '8px',
                        color: '#37474f',
                      }}
                    >
                      {item[date] !== '' ? item[date] : 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3 + filteredDates.length}
                  align="center"
                  sx={{
                    border: '2px solid #00897b',
                    color: '#78909c',
                    fontStyle: 'italic',
                    fontSize: '0.75rem',
                    padding: '8px',
                  }}
                >
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

const App = () => {
  // Tabs for Base Sheet and All Workshops
  const [tabValue, setTabValue] = useState(0);
  const [sheetData, setSheetData] = useState({});

  const tabNames = ['Base Sheet', 'All Workshops'];

  // Define the original workshop names
  const originalWorkshopNames = [
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
      console.log('Available sheets:', workbook.SheetNames);
  
      const newSheetData = {};
  
      // Parse Base Sheet (assumed to be the first sheet)
      const baseSheet = workbook.Sheets[workbook.SheetNames[0]];
      const baseSheetJson = XLSX.utils.sheet_to_json(baseSheet, {
        header: 1,
        defval: '',
      });
      const baseHeaders = baseSheetJson[0];
      const baseSheetData = baseSheetJson.slice(1).map((row) => {
        const rowData = {};
        baseHeaders.forEach((header, idx) => {
          rowData[header] = row[idx] !== '' ? row[idx] : 'N/A';
        });
        return rowData;
      });
      newSheetData['Base Sheet'] = baseSheetData;
  
      // Aggregate workshop sheets (from sheet index 1 onward)
      const aggregatedWorkshopsData = [];
      for (let i = 0; i < originalWorkshopNames.length; i++) {
        const sheetIndex = i + 1;
        const workshopSheet = workbook.Sheets[workbook.SheetNames[sheetIndex]];
        const sheetJson = XLSX.utils.sheet_to_json(workshopSheet, { header: 1, defval: '' });
        const headers = sheetJson[0];
        const workshopData = sheetJson.slice(1).map((row) => {
          const rowData = {
            offerElement: row[0],
            kpi: row[1] || 'N/A',
            workshopName: originalWorkshopNames[i],
          };
          headers.slice(2).forEach((col, idx) => {
            rowData[col] = row[idx + 2] !== '' ? row[idx + 2] : 'N/A';
          });
          return rowData;
        });
        aggregatedWorkshopsData.push(...workshopData);
      }
      newSheetData['All Workshops'] = aggregatedWorkshopsData;
  
      setSheetData(newSheetData);
      console.log('Parsed Sheet Data:', newSheetData);
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
            sx={{ backgroundColor: '#80cbc4', '&:hover': { backgroundColor: '#4db6ac' }, fontSize: '0.8rem', padding: '8px 16px', color: '#37474f' }}
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
            <CommonWorkshops data={sheetData['All Workshops']} title="All Workshops" />
          )}
        </>
      )}
    </PageContainer>
  );
};

export default App;
