// FormularioPermisos.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast, Toaster } from 'sonner';

import { cn } from '../lib/utils';
import Header from './Header';

import {
  Calendar as CalendarIcon,
  Save,
  Pencil,
  XCircle,
  PlusCircle,
  Loader2,
  Clock,
  Folder,
  Minus,
  Plus,
  Star,
  Info,
  ArrowUpDown,
  Briefcase,
  ListChecks,
  ClipboardList,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

import { FormSelect } from './formulario/FormSelect';
import { ActivityItem } from './formulario/ActivityItem';
import { ActivityListSkeleton } from './formulario/ActivityListSkeleton';
import { EmptyState } from './formulario/EmptyState';
import { TotalHoursProgress } from './formulario/TotalHoursProgress';

// APIs correctas
import {
  DailyActivity,
  getDailyActivities,
  submitHours,
  updateHour,
  deleteHour,
} from '../api/horasApi';

import {
  Project,
  getProjects,
  getProjectStages,
  getDisciplinesByStage,
  getActivitiesByDiscipline,
  sortAZ,
} from '../api/permissionsApi';

// ========================
// Tipos & Props
// ========================
interface FormularioPermisosProps {
  onSuccess?: () => void;
  employeeId: number;
  employeeName: string;
  onLogout: () => void;
  onNavigateToHours: () => void;
  onShowPowerBI?: () => void;
}

type Activity = DailyActivity;

type PermissionFormData = {
  employee_id: number;
  project_code: string;
  phase: string;
  discipline: string;
  activity: string;
  hours: string; // UI-friendly; derivamos number aparte
  note?: string;
};

type Favorite = { project_code: string; phase: string; discipline: string; activity: string };

const initialFormData = (employeeId: number): PermissionFormData => ({
  employee_id: employeeId,
  project_code: '',
  phase: '',
  discipline: '',
  activity: '',
  hours: '0',
  note: '',
});

// Preferir letras antes que números; orden "humano" con soporte numérico
const projectComparator = (a: Project, b: Project) => {
  const startsWithNum = (s: string) => /^\d/.test(s);
  const an = startsWithNum(a.code);
  const bn = startsWithNum(b.code);
  if (an && !bn) return 1;
  if (!an && bn) return -1;
  return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
};

// ========================
// Componente
// ========================
const FormularioPermisos: React.FC<FormularioPermisosProps> = ({
  onSuccess,
  employeeId,
  employeeName,
  onLogout,
  onNavigateToHours,
  onShowPowerBI,
}) => {
  const [formData, setFormData] = useState<PermissionFormData>(initialFormData(employeeId));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [projects, setProjects] = useState<Project[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);

  const [dailyActivities, setDailyActivities] = useState<Activity[]>([]);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  const FAV_KEY = useMemo(() => `fh_favorites_v1_${employeeId}`, [employeeId]);
  const DRAFT_KEY = useMemo(() => `fh_draft_v1_${employeeId}`, [employeeId]);

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const [loading, setLoading] = useState({
    submit: false,
    projects: true,
    stages: false,
    disciplines: false,
    activities: false,
    dailyActivities: true,
    delete: null as string | null,
  });

  const hoursInputRef = useRef<HTMLInputElement | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const favScrollRef = useRef<HTMLDivElement | null>(null);

  const handleFavWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.scrollLeft += e.deltaY;
    }
  }, []);

  const selectedProjectName = useMemo(
    () => projects.find((p) => p.code === formData.project_code)?.name || '',
    [formData.project_code, projects]
  );

  const hoursNumber = useMemo(() => {
    const raw = String(formData.hours ?? '').replace(',', '.').trim();
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [formData.hours]);

  const totalHoursToday = useMemo(
    () => dailyActivities.reduce((sum, a) => sum + (Number(a.hours) || 0), 0),
    [dailyActivities]
  );

  const [errors, setErrors] = useState<Partial<Record<keyof PermissionFormData, string>>>({});

  // Validación reactiva
  useEffect(() => {
    const newErrors: Partial<Record<keyof PermissionFormData, string>> = {};
    if (!formData.project_code) newErrors.project_code = 'Selecciona un proyecto';
    if (!formData.phase) newErrors.phase = 'Selecciona una etapa';
    if (!formData.discipline) newErrors.discipline = 'Selecciona una disciplina';
    if (!formData.activity) newErrors.activity = 'Selecciona una actividad';
    if (!(hoursNumber > 0)) newErrors.hours = 'Ingresa horas válidas (> 0)';
    setErrors(newErrors);
  }, [formData, hoursNumber]);

  // Borrador local
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        setFormData((prev) => ({
          ...prev,
          ...draft,
          employee_id: employeeId, // asegurar número
        }));
      } catch {}
    }
  }, [DRAFT_KEY, employeeId]);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, [DRAFT_KEY, formData]);

  // Favoritos
  useEffect(() => {
    const raw = localStorage.getItem(FAV_KEY);
    if (raw) {
      try {
        setFavorites(JSON.parse(raw));
      } catch {}
    }
  }, [FAV_KEY]);

  const saveFavorites = (next: Favorite[]) => {
    setFavorites(next);
    localStorage.setItem(FAV_KEY, JSON.stringify(next));
  };

  const currentFavObj = useMemo(() => {
    if (!formData.project_code || !formData.phase || !formData.discipline || !formData.activity) return null;
    return {
      project_code: formData.project_code,
      phase: formData.phase,
      discipline: formData.discipline,
      activity: formData.activity,
    } as Favorite;
  }, [formData.project_code, formData.phase, formData.discipline, formData.activity]);

  const isCurrentFavorite = useMemo(() => {
    if (!currentFavObj) return false;
    return favorites.some((f) => JSON.stringify(f) === JSON.stringify(currentFavObj));
  }, [favorites, currentFavObj]);

  const toggleFavorite = () => {
    if (!currentFavObj) {
      toast.error('Completa Proyecto, Etapa, Disciplina y Actividad para usar favoritos');
      return;
    }
    if (isCurrentFavorite) {
      const next = favorites.filter((f) => JSON.stringify(f) !== JSON.stringify(currentFavObj));
      saveFavorites(next);
      toast.message('Eliminado de favoritos');
    } else {
      saveFavorites([...favorites, currentFavObj]);
      toast.success('Guardado en favoritos');
    }
  };

  const visibleActivities = useMemo(() => {
    const list = [...dailyActivities].sort((a, b) =>
      String(a.id ?? '').localeCompare(String(b.id ?? ''), undefined, { numeric: true })
    );
    return sortDir === 'desc' ? list.reverse() : list;
  }, [dailyActivities, sortDir]);

  useEffect(() => {
    const base = initialFormData(employeeId);
    const changed =
      JSON.stringify({ ...formData, employee_id: undefined }) !==
      JSON.stringify({ ...base, employee_id: undefined });
    setIsDirty(changed || Boolean(editingActivityId));
  }, [formData, editingActivityId, employeeId]);

  // Data fetching
  const refreshDailyActivities = useCallback(
    async (date: Date, id: string) => {
      setLoading((p) => ({ ...p, dailyActivities: true }));
      try {
        const dateString = format(date, 'yyyy-MM-dd');
        const acts = await getDailyActivities(dateString, Number(id));
        setDailyActivities(acts);
      } catch (e) {
        toast.error('Error al cargar las actividades del día.');
        console.error(e);
      } finally {
        setLoading((p) => ({ ...p, dailyActivities: false }));
      }
    },
    []
  );

  const fetchProjects = useCallback(async () => {
    setLoading((p) => ({ ...p, projects: true }));
    try {
      const data = await getProjects();
      const sorted = [...data].sort(projectComparator);
      setProjects(sorted);
    } catch (e) {
      toast.error('Error al cargar proyectos.');
    } finally {
      setLoading((p) => ({ ...p, projects: false }));
    }
  }, []);

  const fetchStages = useCallback(async (projectCode: string) => {
    if (!projectCode) return [] as string[];
    setLoading((p) => ({ ...p, stages: true }));
    try {
      const data = await getProjectStages(projectCode);
      const cleaned = (data || [])
        .filter((v: any) => v != null && String(v).trim() !== '')
        .map(String);
      const sorted = sortAZ(cleaned);
      setStages(sorted);
      return sorted;
    } catch (e) {
      toast.error('Error al cargar etapas.');
      setStages([]);
      return [];
    } finally {
      setLoading((p) => ({ ...p, stages: false }));
    }
  }, []);

  const fetchDisciplines = useCallback(async (projectCode: string, stage: string) => {
    if (!projectCode || !stage) return [] as string[];
    setLoading((p) => ({ ...p, disciplines: true }));
    try {
      const data = await getDisciplinesByStage(projectCode, stage);
      const cleaned = (data || [])
        .filter((v: any) => v != null && String(v).trim() !== '')
        .map(String);
      const sorted = sortAZ(cleaned);
      setDisciplines(sorted);
      return sorted;
    } catch (e) {
      toast.error('Error al cargar disciplinas.');
      setDisciplines([]);
      return [];
    } finally {
      setLoading((p) => ({ ...p, disciplines: false }));
    }
  }, []);

  const fetchActivities = useCallback(
    async (projectCode: string, stage: string, discipline: string) => {
      if (!projectCode || !stage || !discipline) return [] as string[];
      setLoading((p) => ({ ...p, activities: true }));
      try {
        const data = await getActivitiesByDiscipline(projectCode, stage, discipline);
        const cleaned = (data || [])
          .filter((v: any) => v != null && String(v).trim() !== '')
          .map(String);
        const sorted = sortAZ(cleaned);
        setActivities(sorted);
        return sorted;
      } catch (e) {
        toast.error('Error al cargar actividades.');
        setActivities([]);
        return [];
      } finally {
        setLoading((p) => ({ ...p, activities: false }));
      }
    },
    []
  );

  const applyFavorite = useCallback(
    async (fav: Favorite) => {
      try {
        setFormData((prev) => ({
          ...prev,
          project_code: fav.project_code,
          phase: '',
          discipline: '',
          activity: '',
        }));
        const st = await fetchStages(fav.project_code);
        if (st && st.includes(fav.phase)) {
          setFormData((prev) => ({ ...prev, phase: fav.phase }));
          const ds = await fetchDisciplines(fav.project_code, fav.phase);
          if (ds && ds.includes(fav.discipline)) {
            setFormData((prev) => ({ ...prev, discipline: fav.discipline }));
            const ac = await fetchActivities(fav.project_code, fav.phase, fav.discipline);
            if (ac && ac.includes(fav.activity)) {
              setFormData((prev) => ({ ...prev, activity: fav.activity }));
            }
          }
        }
      } catch (e) {
        console.error(e);
        toast.error('No se pudo aplicar el favorito');
      }
    },
    [fetchStages, fetchDisciplines, fetchActivities]
  );

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    refreshDailyActivities(selectedDate, String(employeeId));
  }, [selectedDate, employeeId, refreshDailyActivities]);

  // Handlers
  const handleDateChange = (date?: Date) => {
    if (date) setSelectedDate(date);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const v = name === 'hours' ? value.replace(',', '.') : value;
    setFormData((prev) => ({ ...prev, [name]: v } as PermissionFormData));
  };

  const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) e.preventDefault();
  };

  const handleSelectChange = async (name: keyof PermissionFormData, value: string) => {
    const updated: PermissionFormData = { ...formData, [name]: value } as PermissionFormData;
    switch (name) {
      case 'project_code':
        updated.phase = '';
        updated.discipline = '';
        updated.activity = '';
        setFormData(updated);
        setStages([]);
        setDisciplines([]);
        setActivities([]);
        if (value) await fetchStages(value);
        break;
      case 'phase':
        updated.discipline = '';
        updated.activity = '';
        setFormData(updated);
        setDisciplines([]);
        setActivities([]);
        if (value && updated.project_code) await fetchDisciplines(updated.project_code, value);
        break;
      case 'discipline':
        updated.activity = '';
        setFormData(updated);
        setActivities([]);
        if (value && updated.project_code && updated.phase) {
          await fetchActivities(updated.project_code, updated.phase, value);
        }
        break;
      default:
        setFormData(updated);
    }
  };

  const resetForm = useCallback(() => {
    setFormData(initialFormData(employeeId));
    setEditingActivityId(null);
  }, [employeeId]);

  const handleEditActivity = useCallback(
    async (activity: Activity) => {
      try {
        if (activity.date) {
          try {
            const d = typeof activity.date === 'string' ? parseISO(activity.date) : new Date(activity.date);
            setSelectedDate(d);
          } catch {}
        }
        if (activity.project_code) {
          await fetchStages(activity.project_code);
          if (activity.phase) await fetchDisciplines(activity.project_code, activity.phase);
          if (activity.phase && activity.discipline)
            await fetchActivities(activity.project_code, activity.phase, activity.discipline);
        }
        setFormData({
          employee_id: employeeId,
          project_code: activity.project_code || '',
          phase: activity.phase || '',
          discipline: activity.discipline || '',
          activity: activity.activity || '',
          hours: String(activity.hours ?? '0'),
          note: activity.note || '',
        });
        setEditingActivityId(String(activity.id));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        console.error(e);
        toast.error('Error al cargar la actividad para edición');
      }
    },
    [employeeId, fetchStages, fetchDisciplines, fetchActivities]
  );

  const [undoData, setUndoData] = useState<Activity | null>(null);
  const triggerUndoBanner = (activity: Activity) => {
    setUndoData(activity);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndoData(null), 8000);
  };

  const handleUndoDelete = async () => {
    if (!undoData) return;
    const a = undoData;
    setUndoData(null);
    try {
      // recrea el registro eliminado
      await submitHours({
        employee_id: employeeId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        project_code: a.project_code,
        phase: a.phase,
        discipline: a.discipline,
        activity: a.activity,
        hours: Number(a.hours) || 0,
        note: a.note || '',
      });
      await refreshDailyActivities(selectedDate, String(employeeId));
      toast.success('Actividad restaurada');
    } catch (e) {
      console.error(e);
      toast.error('Error al restaurar la actividad');
    }
  };

  const doSubmit = useCallback(async (): Promise<boolean> => {
    if (Object.keys(errors).length > 0) {
      toast.error('Por favor completa todos los campos requeridos');
      return false;
    }

    const payload = {
      employee_id: employeeId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      project_code: formData.project_code,
      phase: formData.phase,
      discipline: formData.discipline,
      activity: formData.activity,
      hours: hoursNumber,
      note: formData.note || '',
      id: editingActivityId || undefined,
    };

    const toastId = toast.loading(editingActivityId ? 'Actualizando actividad...' : 'Guardando actividad...');
    setLoading((p) => ({ ...p, submit: true }));
    try {
      if (editingActivityId) {
        await updateHour(editingActivityId, payload);
      } else {
        await submitHours(payload);
      }
      toast.success(`Actividad ${editingActivityId ? 'actualizada' : 'guardada'} con éxito.`, {
        id: toastId,
        duration: 1800,
      });
      await refreshDailyActivities(selectedDate, String(employeeId));
      onSuccess?.();
      return true;
    } catch (e) {
      console.error(e);
      toast.error('Ocurrió un error al guardar.', { id: toastId });
      return false;
    } finally {
      setLoading((p) => ({ ...p, submit: false }));
    }
  }, [
    editingActivityId,
    employeeId,
    errors,
    formData.activity,
    formData.discipline,
    formData.phase,
    formData.project_code,
    formData.note,
    hoursNumber,
    selectedDate,
    refreshDailyActivities,
    onSuccess,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await doSubmit();
    if (ok) resetForm();
  };

  const handleDelete = async (id: string) => {
    const prev = dailyActivities.find((a) => String(a.id) === String(id));
    try {
      setLoading((p) => ({ ...p, delete: id }));
      await deleteHour(id);
      await refreshDailyActivities(selectedDate, String(employeeId));
      if (prev) triggerUndoBanner(prev);
      toast.error('Actividad eliminada');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo eliminar');
    } finally {
      setLoading((p) => ({ ...p, delete: null }));
    }
  };

  const adjustHours = (delta: number) => {
    const current = hoursNumber || 0;
    const next = Math.max(0, Math.round((current + delta) * 2) / 2);
    setFormData((prev) => ({ ...prev, hours: String(next) }));
  };

  // Atajos de teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
        e.preventDefault();
        (async () => {
          if (!loading.submit) {
            const ok = await doSubmit();
            if (ok) resetForm();
          }
        })();
      }
      if (e.key === 'Escape') {
        resetForm();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doSubmit, loading.submit, resetForm]);

  // Navegación declarativa (se maneja fuera: App.tsx)
  const handleNavigateToPermissions = () => {
    /* noop: handled in router/App.tsx */
  };

  return (
    <div className="min-h-screen bg-[#f2f6fd] text-foreground">
      <Toaster position="top-right" richColors />
      <Header
        employeeName={employeeName}
        onLogout={onLogout}
        onShowPowerBI={onShowPowerBI || (() => {})}
        onNavigateToHours={onNavigateToHours}
        onNavigateToPermissions={handleNavigateToPermissions}
        currentView="hours"
      />

      <style>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .fav-strip { overscroll-behavior-y: contain; touch-action: pan-x; }
        .text-wrap, .text-wrap *{
          overflow-wrap: anywhere;
          word-break: break-word;
          hyphens: auto;
        }
      `}</style>

      <div className="mx-auto container p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* PRINCIPAL */}
          <main className={cn('lg:col-span-3')}>
            <Card className="relative z-10 flex flex-col text-wrap">
              <CardHeader className="relative items-center text-center">
                <div className="flex items-center justify-center gap-2">
                  {editingActivityId ? <Pencil className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                  <CardTitle className="text-center">
                    {editingActivityId ? 'Editar Actividad' : 'Registrar Actividad'}
                  </CardTitle>
                </div>
                <div className="absolute right-4 top-4 text-xs">
                  {editingActivityId ? (
                    <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800">Editando</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Creando</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Registra tus horas del día para el proyecto seleccionado.
                </p>

                <div className="mt-3 text-xs sm:text-sm text-foreground/80 flex flex-wrap justify-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border">
                    <Briefcase className="h-3.5 w-3.5" /> {formData.project_code || '—'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border">
                    <ListChecks className="h-3.5 w-3.5" /> {formData.phase || '—'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border">
                    <Pencil className="h-3.5 w-3.5" /> {formData.discipline || '—'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border">
                    <ClipboardList className="h-3.5 w-3.5" /> {formData.activity || '—'}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                {/* Fecha */}
                <div className="mb-4 w-full sm:max-w-xs">
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    <span className="inline-flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" /> Fecha
                    </span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn('w-full justify-start font-normal h-10', !selectedDate && 'text-muted-foreground')}
                      >
                        <span>{format(selectedDate, 'PPP', { locale: es })}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={selectedDate} onSelect={handleDateChange} initialFocus locale={es} />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-6 items-start">
                  {/* Código de Proyecto */}
                  <div className="text-wrap">
                    <FormSelect
                      label="Código de Proyecto"
                      name="project_code"
                      value={formData.project_code}
                      onValueChange={handleSelectChange as any}
                      options={projects.map((p) => ({
                        value: p.code,
                        label: p.code,
                        dropdownLabel: `${p.code} - ${p.name}`,
                      }))}
                      placeholder="Seleccione un proyecto"
                      loading={loading.projects}
                      disabled={loading.projects}
                      icon={<Briefcase className="h-4 w-4" />}
                      required
                    />
                    <p className="mt-1 text-[12px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis leading-none">
                      Elige el proyecto para cargar los demas campos.
                    </p>
                  </div>

                  {/* Nombre del Proyecto */}
                  <div className="space-y-2 text-wrap">
                    <label className="block text-sm font-medium text-foreground/80 mb-1">
                      <span className="inline-flex items-center gap-1">
                        <Folder className="h-4 w-4" /> Nombre del Proyecto
                      </span>
                    </label>
                    <Input value={selectedProjectName} readOnly className="bg-muted/50" aria-label="Nombre de proyecto seleccionado" />
                  </div>

                  {/* Etapa */}
                  <div className="text-wrap">
                    <FormSelect
                      label="Etapa"
                      name="phase"
                      value={formData.phase}
                      onValueChange={handleSelectChange as any}
                      options={stages.map((s) => ({ value: s, label: s }))}
                      placeholder="Seleccione una etapa"
                      loading={loading.stages}
                      disabled={!formData.project_code || loading.stages}
                      icon={<ListChecks className="h-4 w-4" />}
                      required
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Etapas disponibles para el proyecto elegido.</p>
                  </div>

                  {/* Disciplina */}
                  <div className="text-wrap">
                    <FormSelect
                      label="Disciplina"
                      name="discipline"
                      value={formData.discipline}
                      onValueChange={handleSelectChange as any}
                      options={disciplines.map((d) => ({ value: d, label: d }))}
                      placeholder="Seleccione una disciplina"
                      loading={loading.disciplines}
                      disabled={!formData.phase || loading.disciplines}
                      icon={<Pencil className="h-4 w-4" />}
                      required
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Se filtran según la etapa seleccionada.</p>
                  </div>

                  {/* Actividad */}
                  <div className="w-full md:w-[320px] text-wrap">
                    <FormSelect
                      label="Actividad"
                      name="activity"
                      value={formData.activity}
                      onValueChange={handleSelectChange as any}
                      options={activities.map((a) => ({ value: a, label: a }))}
                      placeholder="Seleccione una actividad"
                      loading={loading.activities}
                      disabled={!formData.discipline || loading.activities}
                      icon={<ClipboardList className="h-4 w-4" />}
                      required
                    />
                  </div>

                  {/* Horas */}
                  <div className="flex flex-col text-wrap">
                    <label htmlFor="hours" className="block text-sm font-medium text-foreground/80 mb-1">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Horas <span className="text-destructive">*</span>
                      </span>
                    </label>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        onClick={() => adjustHours(-0.5)}
                        aria-label="Restar 0.5h"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        onClick={() => adjustHours(0.5)}
                        aria-label="Sumar 0.5h"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>

                      <Input
                        id="hours"
                        name="hours"
                        type="number"
                        value={formData.hours}
                        onChange={handleChange}
                        min="0"
                        step="0.5"
                        ref={hoursInputRef}
                        className="h-10 w-[100px] shrink-0 rounded-md mr-0"
                      />

                      <Button
                        type="button"
                        variant={isCurrentFavorite ? 'default' : 'outline'}
                        className="h-10 shrink-0"
                        onClick={toggleFavorite}
                        title={isCurrentFavorite ? 'Quitar de favoritos' : 'Guardar como favorito'}
                      >
                        <Star className="h-4 w-4 mr-2" /> Favorito
                      </Button>
                    </div>
                  </div>

                  {/* Favoritos */}
                  {favorites.length > 0 && (
                    <div className="md:col-span-2">
                      <div
                        ref={favScrollRef}
                        onWheel={handleFavWheel}
                        className="mt-1 overflow-x-auto whitespace-nowrap hide-scrollbar fav-strip"
                        style={{ overscrollBehaviorX: 'contain', overscrollBehaviorY: 'none', touchAction: 'pan-x' }}
                      >
                        <div className="flex gap-2">
                          {favorites.map((fav, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => applyFavorite(fav)}
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-white hover:bg-muted text-xs shrink-0"
                              title={`${fav.project_code} • ${fav.phase} • ${fav.discipline}`}
                            >
                              <Star className="h-3.5 w-3.5" />
                              <span className="font-medium">{fav.activity}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nota */}
                  <div className="md:col-span-2 w-full text-wrap">
                    <label htmlFor="note" className="block text-sm font-medium text-foreground/80 mb-1">
                      <span className="inline-flex items-center gap-1">
                        <Info className="h-4 w-4" /> Nota (Opcional)
                      </span>
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      onKeyDown={handleNoteKeyDown}
                      rows={2}
                      className="flex h-19 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 whitespace-pre-wrap"
                      placeholder="Descripción breve del trabajo realizado"
                    />
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-6 flex items-center justify-end gap-3">
                  <Button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }}
                    disabled={loading.submit || Object.keys(errors).length > 0}
                    className="h-11"
                  >
                    {loading.submit ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {editingActivityId ? 'Actualizar' : 'Guardar'}
                  </Button>

                  {editingActivityId && (
                    <Button type="button" variant="outline" onClick={resetForm} className="h-11">
                      <XCircle className="mr-2 h-4 w-4" /> Cancelar edición
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </main>

          {/* LATERAL */}
          <aside className="lg:col-span-2">
            <Card className="h-full text-wrap">
              <CardHeader className="relative">
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Actividades del Día
                </CardTitle>
                <Button
                  type="button"
                variant="outline"
                  size="icon"
                  title="Ordenar"
                  onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                  className="absolute right-4 top-4"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>

                <div className="text-sm text-muted-foreground flex items-center justify-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" /> {format(selectedDate, 'PPP', { locale: es })}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted/60 text-foreground/80">
                    Total registros: {dailyActivities.length}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                {loading.dailyActivities ? (
                  <ActivityListSkeleton />
                ) : visibleActivities.length > 0 ? (
                  <>
                    <div className="space-y-4 max-h-[520px] overflow-y-auto overflow-x-hidden pr-1 text-wrap">
                      {visibleActivities.map((activity) => (
                        <div key={String(activity.id)} className="text-wrap">
                          <ActivityItem activity={activity} onEdit={handleEditActivity} onDelete={handleDelete} />
                        </div>
                      ))}
                    </div>
                    <div className="pt-3">
                      <TotalHoursProgress totalHours={totalHoursToday} selectedDate={selectedDate} />
                    </div>
                  </>
                ) : (
                  <EmptyState />
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {undoData && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 shadow rounded-full px-4 py-2 flex items-center gap-3">
          <span className="text-sm">Registro eliminado.</span>
          <Button size="sm" variant="outline" onClick={handleUndoDelete}>
            Deshacer
          </Button>
        </div>
      )}
    </div>
  );
};

export default FormularioPermisos;
