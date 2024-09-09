import { Grid, Flex, Image, View, useTheme } from "@aws-amplify/ui-react";
import { useMemoryModal } from "../services/memoryModal";
import { MemoryModal } from "../components/MemoryModal";
import logo from './../assets/MemoryCellar.png';

import { useMemoryContext } from "../context/MemoryContext";

export const MemoryGallery = () => {
  const {
    memories,
    isModalOpen,
    currentMemory
  } = useMemoryContext();

  const { 
    handleImageClick,
    closeModal
  } = useMemoryModal();

  const { tokens } = useTheme();

  return (
    <Flex
      className="App"
      justifyContent="center"
      alignItems="center"
      direction="column"
      width="80%"
      margin="0 auto"
      color="gray"
    >
      <img src={logo} alt="logo" />      
      <Grid 
        templateColumns="repeat(auto-fit, minmax(150px, 1fr))"
        autoRows="minmax(100px, auto)"
        gap={tokens.space.small}
        padding="2em"
      >
        {memories.map((memory: any) => (
          <View 
            key={memory.id || memory.name}
          >    
            {memory.image && (<Image 
              src={memory.image} 
              alt={`visual aid for ${memory.name}`} 
              onClick={() => handleImageClick(memory.id)}
              style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
            />)}
          </View>
        ))}
      </Grid>
      <MemoryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentMemory={currentMemory}
      />
    </Flex>
);
};

