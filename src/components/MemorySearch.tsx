import { Grid, Flex, Image, View, useTheme, SearchField } from "@aws-amplify/ui-react";
import { useMemoryModal } from "../services/memoryModal";
import { MemoryModal } from "../components/MemoryModal";
import { useMemorySearch } from "../services/memorySearch";
import { useMemoryContext } from "../context/MemoryContext";
import logo from './../assets/MemoryCellar.png';

export const MemorySearch = () => {
  const {
    filteredImages,
    isModalOpen,
    currentMemory,
    searchString,
  } = useMemoryContext();

  const { 
    handleImageClick,
    closeModal
  } = useMemoryModal();


  const {
    handleSearch,
    onChange,
    onClear,
  } = useMemorySearch();  

  const { tokens } = useTheme();

  return (
    <Flex
      className="App"
      justifyContent="center"
      alignItems="center"
      direction="column"
      width="90%"
      margin="0 auto"
      color="gray"
    >
      <img src={logo} alt="logo" />      
      <SearchField
          label="search"
          width="60%"
          onChange={onChange}
          onClear={onClear}
          value={searchString}
          padding="2em"
          placeholder="Search my memories in words"
          onSubmit={handleSearch}
        />
      <Grid 
        templateColumns="repeat(auto-fit, minmax(150px, 1fr))"
        autoRows="minmax(100px, auto)"
        gap={tokens.space.small}
        padding="2em"
      >
        
        {filteredImages.map((memory: any) => (
          <View 
            key={memory.id || memory.name}
          >    
            {memory.image && (<Image 
              src={memory.image} 
              //alt={`visual aid for ${memory.name}`} 
              alt={''} 
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

