import React, { useState, useEffect } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, Calendar } from 'lucide-react';
import { getMonthlyHoursMatrix } from '../api/horasApi';

interface Employee {
  id: number;
  name: string;
  short_name: string;
}

interface MonthlyMatrixData {
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
  const [matrixData, setMatrixData] = useState<MonthlyMatrixData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch matrix data for the current month
  useEffect(() => {
    const fetchMatrixData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1; // getMonth() is zero-indexed
        
        const data = await getMonthlyHoursMatrix(year, month);
        
        setMatrixData(data);
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
                    {days.map((day, index) => (
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
                        {employee.name}
                      </td>
                      {matrix[rowIndex]?.map((hours, colIndex) => (
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
                    {totals.cols.map((total, index) => (
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