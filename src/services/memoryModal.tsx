
import { useMemoryContext } from "../context/MemoryContext";
import { useMemoryManage } from "./memoryManage";

export const useMemoryModal = () => {
    const { 
      setTagValues,
      setCurrentMemory,
      memories,
      setIsModalOpen,
      setMemoryId,
      setUpdateSuccess,  
    } = useMemoryContext();
    
    const {onSelectFunc} = useMemoryManage();
  
    const options = memories.map( (memory: any) => {
      return {"id": memory.name, "label": memory.name}
    } )
    
    const onChange = () => {
      setUpdateSuccess(false);
    };
    
    const onSelect = (option: any) => {
      const { label } = option;
      console.log(label);
      onSelectFunc(label);
    };
  
    const onClear = () => {
      setCurrentMemory(null);
      setTagValues(null);
  
    };
  
    const handleImageClick = (id: string) => {
      setIsModalOpen(true);
      setMemoryId(id);
      onSelectFunc(id);
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
      setCurrentMemory(null);
      setTagValues(null);
      setUpdateSuccess(false);
    };
  
    return {
      options,
      onClear,
      onSelect,
      onChange,
      handleImageClick,
      closeModal
    }
}