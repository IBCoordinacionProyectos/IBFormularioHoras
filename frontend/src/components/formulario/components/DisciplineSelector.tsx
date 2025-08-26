import React from 'react';
import { FormSelect } from './FormSelect';

interface DisciplineSelectorProps {
  disciplines: string[];
  loading: boolean;
  value: string;
  onChange: (value: string) => void;
  onDisciplineSelect?: (discipline: string) => void;
}

export const DisciplineSelector: React.FC<DisciplineSelectorProps> = ({
  disciplines,
  loading,
  value,
  onChange,
  onDisciplineSelect,
}) => {
  const handleChange = (value: string) => {
    onChange(value);
    if (onDisciplineSelect) {
      onDisciplineSelect(value);
    }
  };

  return (
    <FormSelect
      label="Disciplina"
      name="discipline"
      value={value}
      onChange={handleChange}
      options={disciplines.map(discipline => ({ value: discipline, label: discipline }))}
      placeholder="Seleccione una disciplina"
      disabled={false}
      required
    />
  );
};
