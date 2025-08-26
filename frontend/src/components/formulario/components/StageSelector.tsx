import React from 'react';
import { FormSelect } from './FormSelect';

interface StageSelectorProps {
  stages: string[];
  loading: boolean;
  value: string;
  onChange: (value: string) => void;
  onStageSelect?: (stage: string) => void;
}

export const StageSelector: React.FC<StageSelectorProps> = ({
  stages,
  loading,
  value,
  onChange,
  onStageSelect,
}) => {
  const handleChange = (value: string) => {
    onChange(value);
    if (onStageSelect) {
      onStageSelect(value);
    }
  };

  return (
    <FormSelect
      label="Etapa"
      name="phase"
      value={value}
      onChange={handleChange}
      options={stages.map(stage => ({ value: stage, label: stage }))}
      placeholder="Seleccione una etapa"
      disabled={false}
      required
    />
  );
};
