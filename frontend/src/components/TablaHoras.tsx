import React, { useState, useEffect } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, Calendar } from 'lucide-react';
import { getMonthlyHoursReport } from '../api/horasApi';

interface ReportedHour {
  id: string;
  date: string;
  employee_id: number;
  employee_name: string;
  employee_short_name: string;
  project_code: string;
  phase: string;
  discipline: string;
  activity: string;
  hours: number;
  note?: string | null;
}

const TablaHoras: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [reportedHours, setReportedHours] = useState<ReportedHour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reported hours for the current month
  useEffect(() => {
    const fetchReportedHours = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1; // getMonth() is zero-indexed
        
        const data = await getMonthlyHoursReport(year, month);
        
        setReportedHours(data || []);
      } catch (err: any) {
        console.error('Error fetching reported hours:', err);
        setError(err.message || 'Error al cargar las horas reportadas');
      } finally {
        setLoading(false);
      }
    };

    fetchReportedHours();
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
        {reportedHours.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p>No hay datos para el mes seleccionado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium">Empleado</th>
                  <th className="text-left py-3 px-4 font-medium">Proyecto</th>
                  <th className="text-left py-3 px-4 font-medium">Actividad</th>
                  <th className="text-right py-3 px-4 font-medium">Horas</th>
                </tr>
              </thead>
              <tbody>
                {reportedHours.map((hour) => (
                  <tr key={hour.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      {format(new Date(hour.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      {hour.employee_name}
                    </td>
                    <td className="py-3 px-4">
                      {hour.project_code}
                    </td>
                    <td className="py-3 px-4">
                      {hour.activity}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {hour.hours.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-medium">
                  <td colSpan={4} className="py-3 px-4 text-right">
                    Total Horas:
                  </td>
                  <td className="py-3 px-4 text-right">
                    {reportedHours.reduce((sum, hour) => sum + hour.hours, 0).toFixed(1)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TablaHoras;