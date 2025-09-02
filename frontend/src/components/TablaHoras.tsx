import React, { useState, useEffect } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, Calendar } from 'lucide-react';
import { getGroupedHoursByEmployee } from '../api/horasApi';

interface Employee {
  id: number;
  name: string;
  short_name: string;
}

interface GroupedHour {
  date: string;
  employee_id: string;
  short_name: string;
  hours: number;
}

interface TransformedData {
  employees: Employee[];
  days: string[];
  matrix: number[][];
  totals: {
    rows: number[];
    cols: number[];
  };
}

const TablaHoras: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [matrixData, setMatrixData] = useState<TransformedData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Transform grouped data to matrix format
  const transformGroupedData = (groupedData: GroupedHour[]): TransformedData => {
    // Extract unique employees and days
    const employeesMap = new Map<string, { id: number; name: string; short_name: string }>();
    const daysSet = new Set<string>();
    
    groupedData.forEach(item => {
      // Add employee to map
      const employeeId = parseInt(item.employee_id, 10);
      if (!employeesMap.has(item.employee_id)) {
        employeesMap.set(item.employee_id, {
          id: employeeId,
          name: item.short_name, // Using short_name as name for display
          short_name: item.short_name
        });
      }
      
      // Add day to set
      daysSet.add(item.date);
    });
    
    // Convert to arrays and sort
    const employees = Array.from(employeesMap.values()).sort((a, b) => a.short_name.localeCompare(b.short_name));
    const days = Array.from(daysSet).sort();
    
    // Create matrix
    const matrix: number[][] = [];
    const rowTotals: number[] = [];
    const colTotals: number[] = Array(days.length).fill(0);
    
    employees.forEach((employee, rowIndex) => {
      const row: number[] = Array(days.length).fill(0);
      let rowTotal = 0;
      
      days.forEach((day, colIndex) => {
        const matchingItem = groupedData.find(
          item => item.employee_id === employee.id.toString() && item.date === day
        );
        
        if (matchingItem) {
          row[colIndex] = matchingItem.hours;
          rowTotal += matchingItem.hours;
          colTotals[colIndex] += matchingItem.hours;
        }
      });
      
      matrix.push(row);
      rowTotals.push(rowTotal);
    });
    
    return {
      employees,
      days,
      matrix,
      totals: {
        rows: rowTotals,
        cols: colTotals
      }
    };
  };

  // Fetch matrix data for the current month
  useEffect(() => {
    const fetchMatrixData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1; // getMonth() is zero-indexed
        
        const groupedData = await getGroupedHoursByEmployee(year, month);
        const transformedData = transformGroupedData(groupedData);
        
        setMatrixData(transformedData);
      } catch (err: any) {
        console.error('Error fetching matrix data:', err);
        setError(err.message || 'Error al cargar el reporte de horas');
      } finally {
        setLoading(false);
      }
    };

    fetchMatrixData();
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reporte de Horas</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleCurrentMonth}>
                Mes Actual
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p>Cargando datos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reporte de Horas</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleCurrentMonth}>
                Mes Actual
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

   // If we have data, render the matrix table
   if (matrixData) {
     const { employees, days, matrix, totals } = matrixData;
     
     // Filter out days where no collaborator has hours
     const daysWithHours = days.filter((_, index) => totals.cols[index] > 0);
     const filteredMatrix = matrix.map(row =>
       row.filter((_, colIndex) => totals.cols[colIndex] > 0)
     );
     const filteredTotalsCols = totals.cols.filter(total => total > 0);
     
     // Get the number of days in the month for proper column count
     const daysInMonth = getDaysInMonth(currentMonth);
     
     return (
       <Card>
         <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>Reporte de Horas - {format(currentMonth, 'MMMM yyyy', { locale: es })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Mes Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCurrentMonth}
                disabled={currentMonth.getMonth() === new Date().getMonth() && 
                         currentMonth.getFullYear() === new Date().getFullYear()}
              >
                Mes Actual
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p>No hay datos para el mes seleccionado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-left bg-gray-100 sticky left-0 z-10">Colaborador</th>
                    {daysWithHours.map((day, index) => (
                      <th key={index} className="border p-2 text-center bg-gray-100">
                        {day}
                      </th>
                    ))}
                    <th className="border p-2 text-center bg-gray-200">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee, rowIndex) => (
                    <tr key={employee.id} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border p-2 font-medium sticky left-0 z-10 bg-inherit">
                        {employee.short_name}
                      </td>
                      {filteredMatrix[rowIndex]?.map((hours, colIndex) => (
                        <td key={colIndex} className="border p-2 text-center">
                          {hours > 0 ? hours.toFixed(1) : ''}
                        </td>
                      ))}
                      <td className="border p-2 text-center font-bold bg-gray-100">
                        {totals.rows[rowIndex]?.toFixed(1) || '0.0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-200 font-bold">
                    <td className="border p-2 text-right">Total</td>
                    {filteredTotalsCols.map((total, index) => (
                      <td key={index} className="border p-2 text-center">
                        {total.toFixed(1)}
                      </td>
                    ))}
                    <td className="border p-2 text-center">
                      {totals.rows.reduce((sum, rowTotal) => sum + rowTotal, 0).toFixed(1)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Fallback in case we have no data and no error
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Reporte de Horas</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleCurrentMonth}>
              Mes Actual
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-32">
          <p>No hay datos disponibles.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TablaHoras;