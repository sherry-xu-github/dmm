import { Flex, TextField, Button, CheckboxField, Grid } from "@aws-amplify/ui-react";
import { useMemoryAutoComplete, useMemoryUpload } from "../services/memoryService";


import logo from './../assets/MemoryCellar.png';
import { useMemoryContext } from "../context/MemoryContext";
import { MemoryAutocomplete } from "./MemoryAutocomplete";
//import { useMemoryUpload } from "../hooks/useMemoryUpload";

interface MemoryModalProps {
  currentMemory: Note;
  isOpen: boolean;
  onClose: () => void;
  
  /*
  imageSrc: string;
  imageAlt: string;
  photoInfo: string; // or an object if you have multiple details
  */
}

export const MemoryModal = ({isOpen, onClose, currentMemory}) => {
  if (!isOpen) return null;
  
  const {
    //currentMemory,
    setNewTags,
    tagList,
  } = useMemoryContext();
  const { updateMemory, addTag, handleTagChange } = useMemoryUpload(currentMemory);
  const { handleImageClick, closeModal } = useMemoryAutoComplete();
  

  

  
  return (
    <>
    <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
    
    
    {currentMemory ? 
    <Flex as="form" 
      key={currentMemory.id || currentMemory.name}
      onSubmit={updateMemory} 
      direction="column" 
      gap="2rem" 
      //border="1px solid #ccc" 
      padding="3rem" 
      //borderRadius="5%"
      justifyContent="center"
    >
      <Grid
        margin="2rem 0"
        autoFlow="column"
        justifyContent="center"
        gap="1rem"
        alignContent="center"
        alignItems="center"
        templateColumns="2fr 1fr"
        //style={{ height: "100%" }}
      >
        <Flex
        justifyContent="center"
        alignItems="center"
        style={{ height: "100%" }}
        >
          {currentMemory.image && <img src={currentMemory.image} alt={`visual aid for ${currentMemory.name}`} 
          //style={{ maxWidth: 1000 }}
          //onClick={handleImageClick}
          className="modal-image"
          />}
        </Flex>
        
        <Grid
          //templateRows="auto auto auto auto" 
          //margin="2rem 0"
          //autoFlow="row"
          //justifyContent="center"
          gap="1rem"
          //alignContent="center"
          //maxWidth="40%"
          //padding="20px"
          //className="modal-sidebar"
        >
          <TextField name="name" label="Memory Name" value={currentMemory.name} required />
          <TextField name="description" label="Memory Description" defaultValue={currentMemory.description} required />
          <TextField name="newTag" label="Memory Tags"
          placeholder="New Tag(s)" 
          labelHidden 
          size="small" 
          onBlur={(e) => setNewTags(e.target.value)} 
          outerEndComponent={<Button size="small" onClick={() => addTag()}>Add</Button>} />
          <Flex gap="10px" wrap="wrap">
            {tagList?.map((tag) => <CheckboxField key={tag} name={tag} label={tag} defaultChecked={true} onChange={handleTagChange} />)}
          </Flex>


          <Button variation="primary" type="submit">Submit Changes</Button>

        </Grid>

      </Grid>
    </Flex>

    
    : <></>
    }
    </div>
    </div>
    </>
  );
};