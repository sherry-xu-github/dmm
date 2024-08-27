import { Grid, Flex, Heading, Text, Button, Image, Badge } from "@aws-amplify/ui-react";
import { useMemoryUpload, useMemoryAutoComplete } from "../services/memoryService";
import { MemoryModal } from "../components/MemoryModal";
import logo from './../assets/MemoryCellar.png';

import { useMemoryContext } from "../context/MemoryContext";

export const MemoryGallery = () => {
  const { 
    deleteNotes
  } = useMemoryUpload();


  const {
    memories,
    isModalOpen,
    setIsModalOpen,
    currentMemory
    
  } = useMemoryContext();


  const { 
    handleImageClick,
    closeModal
  } = useMemoryAutoComplete();

  return (
    <Flex
          className="App"
          justifyContent="center"
          alignItems="center"
          direction="column"
          width="70%"
          margin="0 auto"
          color="gray"
        >
    
  <img src={logo} alt="logo" />
  <Grid margin="2rem 0" autoFlow="column" justifyContent="center" gap="1rem" alignContent="center">
    {memories.map((memory) => (
      <Flex key={memory.id || memory.name}
        direction="column" 
        justifyContent="center" 
        alignItems="center" 
        gap="2rem" 
        border="1px solid #ccc" 
        padding="2rem" 
        borderRadius="5%"
        className="box">
        <Heading level={4}>{memory.name}</Heading>
        <Text fontStyle="italic">{memory.description}</Text>
        {memory.image && 
          (<Image 
          src={memory.image} 
          alt={`visual aid for ${memory.name}`} 
          style={{ width: 400 }}
          onClick={() => handleImageClick(memory.name)}
           />)}
        <div>{memory.tags?.map((tag, index) => <Badge key={index}>{tag}</Badge>)}</div>
        <Button variation="destructive" onClick={() => deleteNotes(memory.name as string)}>
          Delete
        </Button>


        <MemoryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentMemory={currentMemory}
      />
      </Flex>
      
    ))}
  </Grid>
  </Flex>
);
};

