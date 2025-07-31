import React, { useState, useEffect } from 'react';
import InputField from './InputField';
import SelectField from './SelectField';
import TextareaField from './TextareaField';
import DatePicker from './DatePicker';
import {
    submitHours,
    getProjects,
    getProjectStages,
    getDisciplinesByStage,
    getActivitiesByDiscipline,
    getDailyActivities,
    deleteHour
} from '../api/horasApi';
import { toast } from 'react-toastify';

interface FormularioHorasProps {
    onSuccess: () => void;
    employeeId: number;
    employeeName: string;
    onLogout: () => void;
}

interface Project {
    code: string;
    name: string;
}

interface Activity {
    id: number;
    date: string;
    employee_id: number;
    project_code: string;
    project_name: string;
    phase: string;
    discipline: string;
    activity: string;
    hours: number;
    note: string;
}

const FormularioHoras: React.FC<FormularioHorasProps> = ({ onSuccess, employeeId, employeeName, onLogout }) => {
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [formData, setFormData] = useState({
        employee_id: String(employeeId),
        project_code: '',
        phase: '',
        discipline: '',
        activity: '',
        hours: '',
        note: ''
    });

    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
    const [selectedProjectName, setSelectedProjectName] = useState<string>('');

    const [stages, setStages] = useState<string[]>([]);
    const [loadingStages, setLoadingStages] = useState<boolean>(false);
    const [disciplines, setDisciplines] = useState<string[]>([]);
    const [loadingDisciplines, setLoadingDisciplines] = useState<boolean>(false);
    const [activities, setActivities] = useState<string[]>([]);
    const [loadingActivities, setLoadingActivities] = useState<boolean>(false);

    const [dailyActivities, setDailyActivities] = useState<Activity[]>([]);
    const [loadingDailyActivities, setLoadingDailyActivities] = useState<boolean>(true);
    const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
    const [totalHoursToday, setTotalHoursToday] = useState<number>(0);

    useEffect(() => {
        if (selectedDate) {
            refreshDailyActivities(selectedDate, String(employeeId));
        }
    }, [selectedDate, employeeId]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects();
                setProjects(data);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoadingProjects(false);
            }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        if (formData.project_code) {
            setLoadingStages(true);
            getProjectStages(formData.project_code)
                .then(data => setStages(data.map(String)))
                .catch(error => console.error('Error fetching stages:', error))
                .finally(() => setLoadingStages(false));
        } else {
            setStages([]);
        }
    }, [formData.project_code]);

    useEffect(() => {
        if (formData.project_code && formData.phase) {
            setLoadingDisciplines(true);
            getDisciplinesByStage(formData.project_code, formData.phase)
                .then(data => setDisciplines(data.map(String)))
                .catch(error => console.error('Error fetching disciplines:', error))
                .finally(() => setLoadingDisciplines(false));
        } else {
            setDisciplines([]);
        }
    }, [formData.project_code, formData.phase]);

    useEffect(() => {
        if (formData.project_code && formData.phase && formData.discipline) {
            setLoadingActivities(true);
            getActivitiesByDiscipline(formData.project_code, formData.phase, formData.discipline)
                .then(data => setActivities(data.map(String)))
                .catch(error => console.error('Error fetching activities:', error))
                .finally(() => setLoadingActivities(false));
        } else {
            setActivities([]);
        }
    }, [formData.project_code, formData.phase, formData.discipline]);

    useEffect(() => {
        const total = dailyActivities.reduce((sum, activity) => sum + activity.hours, 0);
        setTotalHoursToday(total);
    }, [dailyActivities]);

    const refreshDailyActivities = async (date: Date, employeeId: string) => {
        setLoadingDailyActivities(true);
        try {
            const dateStr = date.toISOString().split('T')[0];
            const activities = await getDailyActivities(dateStr, Number(employeeId));
            setDailyActivities(activities);
        } catch (error) {
            console.error('Error fetching daily activities:', error);
            setDailyActivities([]);
        } finally {
            setLoadingDailyActivities(false);
        }
    };

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'project_code') {
                newState.phase = '';
                newState.discipline = '';
                newState.activity = '';
                const project = projects.find(p => p.code === value);
                setSelectedProjectName(project ? project.name : '');
            } else if (name === 'phase') {
                newState.discipline = '';
                newState.activity = '';
            } else if (name === 'discipline') {
                newState.activity = '';
            }
            return newState;
        });
    };

    const handleSelectActivity = (activity: Activity) => {
        setFormData({
            employee_id: String(activity.employee_id),
            project_code: activity.project_code,
            phase: activity.phase,
            discipline: activity.discipline,
            activity: activity.activity,
            hours: String(activity.hours),
            note: activity.note || '',
        });
        setEditingActivityId(activity.id);
        const project = projects.find(p => p.code === activity.project_code);
        setSelectedProjectName(project ? project.name : '');
    };

    const resetForm = () => {
        setFormData(prev => ({
            ...prev,
            project_code: '',
            phase: '',
            discipline: '',
            activity: '',
            hours: '',
            note: ''
        }));
        setEditingActivityId(null);
        setSelectedProjectName('');
        setSubmitError(null);
        setStages([]);
        setDisciplines([]);
        setActivities([]);
    };

    const handleDelete = async () => {
        if (!editingActivityId || !selectedDate) return;
        try {
            await deleteHour(editingActivityId);
            toast.success('Actividad eliminada con éxito');
            resetForm();
            refreshDailyActivities(selectedDate, String(employeeId));
            onSuccess();
        } catch (error) {
            console.error('Error deleting activity:', error);
            setSubmitError('Ocurrió un error al eliminar la actividad.');
        }
    };

    const handleSubmit = async () => {
        if (!selectedDate || !formData.project_code || !formData.phase || !formData.discipline || !formData.activity || !formData.hours || parseFloat(formData.hours) <= 0) {
            setSubmitError('Por favor complete todos los campos requeridos.');
            return;
        }

        try {
            const dataToSubmit = {
                ...formData,
                date: selectedDate.toISOString().split('T')[0],
                hours: parseFloat(formData.hours)
            };

            if (editingActivityId) {
                await deleteHour(editingActivityId);
                await submitHours(dataToSubmit);
                toast.success('Actividad actualizada con éxito');
            } else {
                await submitHours(dataToSubmit);
                toast.success('Horas registradas con éxito');
            }

            setSubmitError(null);
            resetForm();
            refreshDailyActivities(selectedDate, String(employeeId));
            onSuccess();
        } catch (error) {
            setSubmitError('Error al registrar las horas');
            console.error('Error submitting hours:', error);
        }
    };

    return (
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0 lg:items-start">

            {/* Columna Izquierda: Formulario */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-[#083c4c] flex flex-col overflow-hidden">
                <div className="bg-[#083c4c] text-white p-4 flex justify-between items-center flex-shrink-0">
                    <img src="/logo.png" alt="Logo" className="h-14" />
                    <div className="text-center">
                        <h2 className="text-xl font-bold">REGISTRO DE HORAS</h2>
                        <p className="text-sm mt-1">Bienvenido, {employeeName}</p>
                    </div>
                    <div className="w-40 flex justify-end">
                        <button 
                            onClick={onLogout}
                            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300 shadow-md"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <div className="md:col-span-2">
                            <DatePicker
                                label="Fecha"
                                selectedDate={selectedDate}
                                onChange={handleDateChange}
                                required
                                icon={<svg className="h-5 w-5 text-[#083c4c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                            />
                        </div>
                        
                        <SelectField
                            label="Código de Proyecto"
                            name="project_code"
                            value={formData.project_code}
                            onChange={handleChange}
                            options={[{ value: '', label: 'Seleccione un código' }, ...projects.map(proj => ({ value: proj.code, label: proj.code })) ]}
                            isLoading={loadingProjects}
                            required
                            icon={<svg className="h-5 w-5 text-[#083c4c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                        />
                        
                        <InputField
                            label="Nombre del Proyecto"
                            name="project_name"
                            value={selectedProjectName}
                            readOnly
                            icon={<svg className="h-5 w-5 text-[#083c4c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />

                        <SelectField
                            label="Etapa"
                            name="phase"
                            value={formData.phase}
                            onChange={handleChange}
                            options={[{ value: '', label: 'Seleccione una etapa' }, ...stages.map(s => ({ value: s, label: s })) ]}
                            isLoading={loadingStages}
                            disabled={!formData.project_code}
                            required
                            icon={<svg className="h-5 w-5 text-[#083c4c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10h6c2 0 2.586-2.162 2.657-2.234" /></svg>}
                        />
                        
                        <SelectField
                            label="Disciplina"
                            name="discipline"
                            value={formData.discipline}
                            onChange={handleChange}
                            options={[{ value: '', label: 'Seleccione una disciplina' }, ...disciplines.map(d => ({ value: d, label: d })) ]}
                            isLoading={loadingDisciplines}
                            disabled={!formData.phase}
                            required
                            icon={<svg className="h-5 w-5 text-[#083c4c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 9.11c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
                        />
                        
                        <SelectField
                            label="Actividad"
                            name="activity"
                            value={formData.activity}
                            onChange={handleChange}
                            options={[{ value: '', label: 'Seleccione una actividad' }, ...activities.map(a => ({ value: a, label: a })) ]}
                            isLoading={loadingActivities}
                            disabled={!formData.discipline}
                            required
                            icon={<svg className="h-5 w-5 text-[#083c4c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                        />
                        
                        <InputField
                            label="Horas"
                            name="hours"
                            type="number"
                            value={formData.hours}
                            onChange={handleChange}
                            required
                            icon={<svg className="h-5 w-5 text-[#083c4c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        
                        <div className="md:col-span-2">
                            <TextareaField
                                label="Notas (Opcional)"
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                icon={<svg className="h-5 w-5 text-[#083c4c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z" /></svg>}
                            />
                        </div>
                    </div>

                    {submitError && <p className="text-red-500 text-sm mt-4 text-center">{submitError}</p>}

                    <div className="mt-8 flex justify-center space-x-4 mb-4">
                        <button onClick={handleSubmit} className="bg-[#083c4c] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#062c3a] transition-colors duration-300 shadow-md">
                            {editingActivityId ? 'ACTUALIZAR' : 'GUARDAR'}
                        </button>
                        <button onClick={resetForm} className="bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg hover:bg-gray-400 transition-colors duration-300 shadow-md">
                            NUEVO
                        </button>
                        {editingActivityId && (
                            <button onClick={handleDelete} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md">
                                ELIMINAR
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Columna Derecha: Listado de Actividades */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-lg border border-[#083c4c] flex flex-col overflow-hidden">
                <div className="bg-[#083c4c] text-white p-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-center">LISTADO DE ACTIVIDADES</h2>
                </div>

                <div className="p-6 flex-grow flex flex-col min-h-0">
                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4 text-center flex-shrink-0">
                        <div className="text-yellow-800 text-sm font-bold">HORAS TOTALES DEL DÍA</div>
                        <div className="text-2xl font-bold text-yellow-900">{totalHoursToday.toFixed(1)} hrs</div>
                    </div>

                    <div className="mt-4 flex-grow overflow-y-auto pr-2">
                        {loadingDailyActivities ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#083c4c] mx-auto"></div>
                                <p className="mt-3 text-gray-600">Cargando actividades...</p>
                            </div>
                        ) : dailyActivities.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <div className="text-gray-400 mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 font-semibold">No hay actividades registradas.</p>
                                <p className="text-gray-400 text-sm mt-1">Utilice el formulario para añadir su primera actividad del día.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {dailyActivities.map((activity) => (
                                    <div 
                                        key={activity.id} 
                                        className={`bg-white border rounded-lg p-3 shadow-sm border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors duration-200 ${
                                            editingActivityId === activity.id ? 'ring-2 ring-[#083c4c]' : 'hover:border-[#083c4c]'
                                        }`}
                                        onClick={() => handleSelectActivity(activity)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-grow">
                                                <p className="font-bold text-[#083c4c]">{activity.project_code} - {activity.project_name}</p>
                                                <p className="text-xs text-gray-500">{activity.phase} / {activity.discipline}</p>
                                                <p className="text-sm mt-1">{activity.activity}</p>
                                                {activity.note && <p className="text-xs text-gray-500 mt-1 italic">Nota: {activity.note}</p>}
                                            </div>
                                            <div className="text-right ml-4 flex-shrink-0">
                                                <p className="font-bold text-lg text-[#083c4c]">{activity.hours.toFixed(1)}</p>
                                                <p className="text-xs text-gray-500">horas</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormularioHoras;