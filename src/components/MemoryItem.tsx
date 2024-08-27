import { Flex, TextField, Button, CheckboxField, Grid } from "@aws-amplify/ui-react";
import { useMemoryAutoComplete, useMemoryUpload } from "../services/memoryService";
import logo from './../assets/MemoryCellar.png';
import { useMemoryContext } from "../context/MemoryContext";
import { MemoryAutocomplete } from "../components/MemoryAutocomplete";
//import { useMemoryUpload } from "../hooks/useMemoryUpload";

interface MemoryItemProps {
  currentMemory: Note;
}

export const MemoryItem = () => {
  const {
    currentMemory,
    setNewTags,
    tagList,
  } = useMemoryContext();
  const { updateMemory, addTag, handleTagChange } = useMemoryUpload(currentMemory);
  //const { updateMemory, tagValues, handleTagChange, addTag, setNewTags } = useMemoryAutoComplete();
  

  
  return (
    <>
    <Grid
            margin="2rem 0"
            autoFlow="row"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >
      <MemoryAutocomplete></MemoryAutocomplete>
    </Grid>
    
    {currentMemory ? 
    <Flex as="form" 
      key={currentMemory.id || currentMemory.name}
      onSubmit={updateMemory} 
      direction="column" 
      gap="2rem" 
      //border="1px solid #ccc" 
      padding="3rem" 
      //borderRadius="5%"
      justifyContent="center">


    <Grid
            margin="2rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >

      {currentMemory.image && <img src={currentMemory.image} alt={`visual aid for ${currentMemory.name}`} 
      style={{ maxWidth: 1000 }}
      
      />}
      <Grid
            margin="2rem 0"
            autoFlow="row"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
            maxWidth={600}
          >
      <TextField name="name" label="Memory Name" value={currentMemory.name} required />
      <TextField name="description" label="Memory Description" defaultValue={currentMemory.description} required />
      <TextField name="newTag" label="Memory Tags"
      placeholder="New Tag(s)" 
      labelHidden 
      size="small" 
      onBlur={(e) => setNewTags(e.target.value)} 
      outerEndComponent={<Button size="small" onClick={() => addTag()}>Add</Button>} />
      <Grid autoFlow="column" justifyContent="center" gap="1rem" alignContent="center">
        {tagList?.map((tag) => <CheckboxField key={tag} name={tag} label={tag} defaultChecked={true} onChange={handleTagChange} />)}
      </Grid>
      <Button variation="primary" type="submit">Submit Changes</Button>

      </Grid>

      </Grid>
    </Flex>

    
    : <></>
    }
    
    </>
  );
};