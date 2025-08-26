import React from 'react';
import { Project } from '../types';
import { FormSelect } from './FormSelect';

interface ProjectSelectorProps {
  projects: Project[];
  loading: boolean;
  value: string;
  onChange: (value: string) => void;
  onProjectSelect?: (projectCode: string) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  value,
  onChange,
  onProjectSelect,
}) => {
  const handleChange = (value: string) => {
    onChange(value);
    if (onProjectSelect) {
      onProjectSelect(value);
    }
  };

  return (
    <FormSelect
      label="Proyecto"
      name="project_code"
      value={value}
      onChange={handleChange}
      options={projects.map(project => ({
        value: project.code,
        label: `${project.code} - ${project.name}`,
      }))}
      placeholder="Seleccione un proyecto"
      disabled={false}
      required
    />
  );
};
