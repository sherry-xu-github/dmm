import React, { createContext, useContext, useState } from 'react';

interface MemoryContextType {
  memories: string[];
  addMemory: (memory: string) => void;
  setMemories;
  memoryName;
  setMemoryName;
  hasMemoryNameError;
  setHasMemoryNameError;
  tagValues;
  setTagValues;
  error;
  setError;
  setCurrentMemory;
  currentMemory;
  tagList;
  setTagList;
  newTags;
  setNewTags;
  acValue;
  setAcValue;
  setTaggedMemories;
  taggedMemories;
  isModalOpen;
  setIsModalOpen;
  files;
  setFiles;
  memoryId;
  setMemoryId;
  percentage;
  setPercentage;
  updateSuccess;
  setUpdateSuccess;
  searchString;
  setSearchString;
  keywords;
  setKeywords;
  timeRange;
  setTimeRange;

}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const useMemoryContext = () => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemoryContext must be used within a MemoryProvider');
  }
  return context;
};

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);
  const [memories, setMemories] = useState<string[]>([]);
  const [files, setFiles] = React.useState([]);
  
  const [memoryName, setMemoryName] = useState("");
  const [hasMemoryNameError, setHasMemoryNameError] = useState(false);
  const [memoryId, setMemoryId] = useState("");

  const [acValue, setAcValue] = useState('');
  const [currentMemory, setCurrentMemory] = useState<Note | null>(null);
  const [tagValues, setTagValues] = useState<Record<string, boolean> | null>(null);
  const [newTags, setNewTags] = useState(null)
  const [tagList, setTagList] = useState(null);

  const [taggedMemories, setTaggedMemories] = useState<Note[] | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [percentage, setPercentage] = useState(0);
  const [updateSuccess, setUpdateSuccess] = useState(false);


  const [searchString, setSearchString] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [timeRange, setTimeRange] = useState([]);
  
  
  const addMemory = (memory: string) => {
    setMemories((prev) => [...prev, memory]);
  };

  return (
    <MemoryContext.Provider value={{ 
      memories, setMemories,
      addMemory, 
      memoryName, setMemoryName, 
      hasMemoryNameError, setHasMemoryNameError,
      tagValues, setTagValues,
      error, setError,
      currentMemory, setCurrentMemory,
      tagList, setTagList,
      newTags, setNewTags,
      acValue, setAcValue,
      taggedMemories, setTaggedMemories,
      isModalOpen, setIsModalOpen,
      files, setFiles,
      memoryId, setMemoryId,
      percentage, setPercentage,
      updateSuccess, setUpdateSuccess,
      searchString, setSearchString,
      keywords, setKeywords,
      timeRange, setTimeRange
      }}>
        {children}
    </MemoryContext.Provider>
  );
};

