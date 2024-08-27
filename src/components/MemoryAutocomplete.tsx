import { Autocomplete, ComboBoxOption, Flex } from "@aws-amplify/ui-react";
import { useMemoryAutoComplete } from "../services/memoryService";

interface MemoryAutocompleteProps {
  options: ComboBoxOption[];
  value: string;
  onChange: (e: any) => void;
  onSelect: (option: any) => void;
  onClear: () => void;
}


export const MemoryAutocomplete = () => {


  const { options,
    onChange,
    onSelect,
    onClear,
    acValue
  } = useMemoryAutoComplete();

  return (
    
      <Autocomplete label="Select a Memory" 
        options={options} 
        value={acValue} 
        
        onChange={onChange} 
        onSelect={onSelect} 
        onClear={onClear} 
        color="gray"
        placeholder="Search here to start" />
  )
  
};