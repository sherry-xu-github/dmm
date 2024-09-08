import { Grid, Flex, Heading, Text, Button, Image, Badge, View, useTheme, SearchField } from "@aws-amplify/ui-react";
import { useMemoryUpload, useMemoryAutoComplete } from "../services/memoryService";
import { MemoryModal } from "../components/MemoryModal";
import { useMemorySearch } from "../services/memoryService";
import logo from './../assets/MemoryCellar.png';

import { useMemoryContext } from "../context/MemoryContext";
import { useState, useEffect, FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

export const MemorySearch = () => {
  const {
    memories,
    isModalOpen,
    setIsModalOpen,
    currentMemory,
    searchString
    
    
  } = useMemoryContext();


  const { 
    handleImageClick,
    closeModal
  } = useMemoryAutoComplete();


  const {
    handleSearch,
    onChange,
    onClear
  } = useMemorySearch();  

  /*
  const isLargeScreen = useMediaQuery({ query: '(min-width: 1024px)' });
  const isMediumScreen = useMediaQuery({ query: '(min-width: 768px)' });
  const columns = isLargeScreen ? 'repeat(4, 1fr)' : isMediumScreen ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)';
  */
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
      <SearchField
          label="search"
          onChange={onChange}
          onClear={onClear}
          value={searchString}
          padding="2em"
          placeholder="Search my memories"
          onSubmit={handleSearch}
        />
      <Grid 
        templateColumns="repeat(auto-fit, minmax(150px, 1fr))"
        autoRows="minmax(100px, auto)"
        gap={tokens.space.small}
        padding="2em"
      >
        
        {memories.map((memory) => (
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

