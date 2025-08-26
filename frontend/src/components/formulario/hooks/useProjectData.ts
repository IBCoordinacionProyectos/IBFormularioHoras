import { useState, useCallback } from 'react';
import { Project } from '../types';
import { getProjects, getProjectStages, getDisciplinesByStage, getActivitiesByDiscipline } from '../../../api/horasApi';
import { toast } from 'sonner';

export const useProjectData = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState({
    projects: true,
    stages: false,
    disciplines: false,
    activities: false,
  });

  // Cargar proyectos
  const fetchProjects = useCallback(async () => {
    setLoading(prev => ({ ...prev, projects: true }));
    try {
      const projectData = await getProjects();
      setProjects(projectData);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      toast.error('Error al cargar la lista de proyectos');
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  }, []);

  // Cargar etapas del proyecto
  const fetchStages = useCallback(async (projectCode: string) => {
    if (!projectCode) {
      setStages([]);
      return [];
    }
    
    // Solo mostramos el indicador de carga si no hay etapas cargadas
    if (stages.length === 0) {
      setLoading(prev => ({ ...prev, stages: true }));
    }
    
    try {
      const stageData = await getProjectStages(projectCode);
      const validStages = stageData
        .filter((stage: any) => stage != null && stage !== '')
        .map(String);
      
      // Solo actualizamos si hay cambios
      if (JSON.stringify(validStages) !== JSON.stringify(stages)) {
        setStages(validStages);
      }
      
      return validStages;
    } catch (error) {
      console.error('Error al cargar etapas:', error);
      // No mostramos el toast para no molestar al usuario
      return [];
    } finally {
      if (loading.stages) {
        setLoading(prev => ({ ...prev, stages: false }));
      }
    }
  }, [stages, loading.stages]);

  // Cargar disciplinas por etapa
  const fetchDisciplines = useCallback(async (projectCode: string, stage: string) => {
    if (!projectCode || !stage) {
      setDisciplines([]);
      return [];
    }
    
    // Solo mostramos el indicador de carga si no hay disciplinas cargadas
    if (disciplines.length === 0) {
      setLoading(prev => ({ ...prev, disciplines: true }));
    }
    
    try {
      const disciplineData = await getDisciplinesByStage(projectCode, stage);
      const validDisciplines = disciplineData
        .filter((discipline: any) => discipline != null && discipline !== '')
        .map(String);
      
      // Solo actualizamos si hay cambios
      if (JSON.stringify(validDisciplines) !== JSON.stringify(disciplines)) {
        setDisciplines(validDisciplines);
      }
      
      return validDisciplines;
    } catch (error) {
      console.error('Error al cargar disciplinas:', error);
      // No mostramos el toast para no molestar al usuario
      return [];
    } finally {
      if (loading.disciplines) {
        setLoading(prev => ({ ...prev, disciplines: false }));
      }
    }
  }, [disciplines, loading.disciplines]);

  // Cargar actividades por disciplina
  const fetchActivities = useCallback(async (projectCode: string, stage: string, discipline: string) => {
    if (!projectCode || !stage || !discipline) {
      setActivities([]);
      return [];
    }
    
    try {
      console.log(`Buscando actividades para proyecto: ${projectCode}, etapa: ${stage}, disciplina: ${discipline}`);
      const activityData = await getActivitiesByDiscipline(projectCode, stage, discipline);
      console.log('Actividades recibidas de la API:', activityData);
      
      const validActivities = activityData
        .filter((activity: any) => activity != null && activity !== '')
        .map(String);
      
      console.log('Actividades válidas después de filtrar:', validActivities);
      
      // Siempre actualizamos las actividades para asegurar que estén sincronizadas
      setActivities(validActivities);
      
      return validActivities;
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      setActivities([]);
      return [];
    }
  }, []);

  return {
    projects,
    stages,
    disciplines,
    activities,
    loading,
    fetchProjects,
    fetchStages,
    fetchDisciplines,
    fetchActivities,
  };
};
