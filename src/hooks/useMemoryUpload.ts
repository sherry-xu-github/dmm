
export const useMemoryUpload = (initialNote?: Note) => {
  

  /*
  const [memoryName, setMemoryName] = useState("");
  const [hasMemoryNameError, setHasMemoryNameError] = useState(false);
  const [tagValues, setTagValues] = useState<Record<string, boolean> | null>(null);
  */

  const checkMemoryNameHandler = async (memoryName: string) => {
    const errorExists = await checkMemoryName(memoryName);
    
    
    //await checkMemoryName(memoryName);
  };

  const createNoteHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createNote(event, memoryName, hasMemoryNameError);
  };

  const updateMemoryHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateMemory(event, initialNote, tagValues);
  };

  const handleTagChange = (e: any) => {
    setTagValues((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  /*
  return {
    memoryName,  
    hasMemoryNameError,
    checkMemoryNameHandler,
    createNoteHandler,
    updateMemoryHandler,
    tagValues,
    handleTagChange,
  };
  */
};