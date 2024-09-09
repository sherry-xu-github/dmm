import React, { createContext, useContext, useState } from 'react';

interface MemoryContextType {
  memories: any; setMemories: React.Dispatch<React.SetStateAction<any[]>>;
  
  files: any; setFiles: React.Dispatch<React.SetStateAction<any[]>>;
  percentage: number; setPercentage: React.Dispatch<React.SetStateAction<number>>;

  isModalOpen: boolean; setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentMemory: any; setCurrentMemory: React.Dispatch<React.SetStateAction<any>>;
  memoryId: string; setMemoryId: React.Dispatch<React.SetStateAction<string>>;
  memoryName: string; setMemoryName: React.Dispatch<React.SetStateAction<string>>;  
  hasMemoryNameError: boolean; setHasMemoryNameError: React.Dispatch<React.SetStateAction<boolean>>;
  updateSuccess: boolean; setUpdateSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  
  tagValues: any| null; setTagValues: React.Dispatch<React.SetStateAction<any>>;
  tagList: any; setTagList: React.Dispatch<React.SetStateAction<any>>;
  newTags: any; setNewTags: React.Dispatch<React.SetStateAction<any>>;
  
  searchString: string; setSearchString: React.Dispatch<React.SetStateAction<string>>;
  keywords: string[] | null; setKeywords: React.Dispatch<React.SetStateAction<string[] | null>>;
  timeRange: string[] | null; setTimeRange: React.Dispatch<React.SetStateAction<string[] | null>>;
  filteredMemories: any; setFilteredMemories: React.Dispatch<React.SetStateAction<any>>;
  filteredImages: any; setFilteredImages: React.Dispatch<React.SetStateAction<any>>;

  location: string, setLocation: React.Dispatch<React.SetStateAction<string>>,
  coordinates: any, setCoordinates: React.Dispatch<React.SetStateAction<any>>,
  lat1: string, setLat1: React.Dispatch<React.SetStateAction<string>>,
  lon1: string, setLon1: React.Dispatch<React.SetStateAction<string>>,
  lat2: string, setLat2: React.Dispatch<React.SetStateAction<string>>,
  lon2: string, setLon2: React.Dispatch<React.SetStateAction<string>>,
  isWithinRange: boolean | null, setIsWithinRange: React.Dispatch<React.SetStateAction<boolean | null>>,
  isSameStreet: boolean | null, setIsSameStreet: React.Dispatch<React.SetStateAction<boolean | null>>,
  latitude: string, setLatitude: React.Dispatch<React.SetStateAction<string>>,
  longitude: string, setLongitude: React.Dispatch<React.SetStateAction<string>>,
  address: string | null, setAddress: React.Dispatch<React.SetStateAction<string | null>>,


  error: any; setError: React.Dispatch<React.SetStateAction<any>>;
  //acValue; setAcValue;
  //taggedMemories; setTaggedMemories;
  //addMemory: (memory: string) => void;
  
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
  const [memories, setMemories] = useState<any>([]);
  
  const [files, setFiles] = React.useState<any>([]);
  const [percentage, setPercentage] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMemory, setCurrentMemory] = useState(null);
  const [memoryId, setMemoryId] = useState("");
  const [memoryName, setMemoryName] = useState("");
  const [hasMemoryNameError, setHasMemoryNameError] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  const [tagValues, setTagValues] = useState<any>({});
  const [tagList, setTagList] = useState<any>(null);
  const [newTags, setNewTags] = useState<any>(null)

  const [searchString, setSearchString] = useState('');
  const [keywords, setKeywords] = useState<string[] | null>([]);
  const [timeRange, setTimeRange] = useState<string[] | null>([]);
  const [filteredMemories, setFilteredMemories] = useState<any>([]);
  const [filteredImages, setFilteredImages] = useState<any>([]);

  const [location, setLocation] = useState<string>('');
  const [coordinates, setCoordinates] = useState<any>(null);
  const [lat1, setLat1] = useState<string>('');
  const [lon1, setLon1] = useState<string>('');
  const [lat2, setLat2] = useState<string>('');
  const [lon2, setLon2] = useState<string>('');
  const [isWithinRange, setIsWithinRange] = useState<boolean | null>(null);
  const [isSameStreet, setIsSameStreet] = useState<boolean | null>(null);
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [address, setAddress] = useState<string | null>(null);

  const [error, setError] = useState<any>(null);
  //const [taggedMemories, setTaggedMemories] = useState(null);
  //const [acValue, setAcValue] = useState('');
  
    
  /*
  const addMemory = (memory: string) => {
    setMemories((prev) => [...prev, memory]);
  };
  */

  return (
    <MemoryContext.Provider value={{ 
      memories, setMemories,

      files, setFiles,
      percentage, setPercentage,
      
      isModalOpen, setIsModalOpen,
      currentMemory, setCurrentMemory,
      memoryId, setMemoryId,
      memoryName, setMemoryName, 
      hasMemoryNameError, setHasMemoryNameError,
      updateSuccess, setUpdateSuccess,
      
      tagValues, setTagValues,
      tagList, setTagList,
      newTags, setNewTags,
      
      searchString, setSearchString,
      keywords, setKeywords,
      timeRange, setTimeRange,
      filteredMemories, setFilteredMemories,
      filteredImages, setFilteredImages,

      location, setLocation,
      coordinates, setCoordinates,
      lat1, setLat1,
      lon1, setLon1,
      lat2, setLat2,
      lon2, setLon2,
      isWithinRange, setIsWithinRange,
      isSameStreet, setIsSameStreet,
      latitude, setLatitude,
      longitude, setLongitude,
      address, setAddress,
      
      error, setError,
      //taggedMemories, setTaggedMemories,
      //addMemory,
      //acValue, setAcValue,
      }}>
        {children}
    </MemoryContext.Provider>
  );
};

