import { Flex, TextField, Button, CheckboxField, Grid, Menu, Message, ScrollView, TextAreaField } from "@aws-amplify/ui-react";
import { useMemoryManage } from "../services/memoryManage";
import { useMemoryModal } from "../services/memoryModal";
import { useMemoryContext } from "../context/MemoryContext";

interface MemoryModalProps {
  currentMemory: any;
  isOpen: boolean;
  onClose: () => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({isOpen, onClose, currentMemory}) => {
  if (!isOpen) return null;
  
  const {
    setNewTags,
    tagList,
    updateSuccess,
    error
  } = useMemoryContext();

  const { updateMemory, addTag, deleteNotes, handleTagChange } = useMemoryManage();
  const { onChange } = useMemoryModal();
  
  
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
              padding="3rem" 
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
              >
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  style={{ height: "100%" }}
                >
                  {
                    currentMemory.image && 
                    <img src={currentMemory.image} 
                      alt={`visual aid for ${currentMemory.name}`} 
                      //style={{ maxWidth: 1000 }}
                      //onClick={handleImageClick}
                      className="modal-image"
                    />
                  }
                </Flex>
                
                <Grid
                  gap="1rem"
                  //templateRows="auto auto auto auto" 
                  //margin="2rem 0"
                  //autoFlow="row"
                  //justifyContent="center"
                  //alignContent="center"
                  //maxWidth="40%"
                  //padding="20px"
                  //className="modal-sidebar"
                >
                  <TextField name="name" label="Name" size="small" defaultValue={currentMemory.name} onChange={onChange}/>
                  <TextField name="dateTaken" label="Date Taken" size="small" defaultValue={currentMemory.dateTaken} onChange={onChange}/>
                  <TextField name="location" label="Location" size="small" defaultValue={currentMemory.address} onChange={onChange}/>

                  <Grid autoFlow="column">
                    <TextField name="locationLat" label="Latitude" size="small" width="95%" variation="quiet" defaultValue={currentMemory.location.lat} onChange={onChange}/>
                    <TextField name="locationLong" label="Longtitude" size="small" variation="quiet" defaultValue={currentMemory.location.long} onChange={onChange}/>
                  </Grid>
                  
                  <TextAreaField name="description" label="Description" size="small" defaultValue={currentMemory.description} onChange={onChange} />
                  <TextField name="newTag" label="Tags" size="small" placeholder="New Tag" 
                    //labelHidden 
                    //size="small" 
                    onBlur={(e) => setNewTags(e.target.value)} 
                    outerEndComponent={<Button size="small" onClick={() => addTag()}>Add</Button>}
                  />

                  <ScrollView height="100px" width="100%">
                    <Flex gap="10px" wrap="wrap">
                      {tagList?.map(
                        (tag: string) => 
                        <CheckboxField size="small" key={tag} name={tag} label={tag} defaultChecked={true} onChange={handleTagChange} />
                      )}
                    </Flex>
                  </ScrollView>

                  <Button variation="primary" size="small" type="submit">Submit Changes</Button>
                  
                  <Menu menuAlign="center" size="small"
                  >
                    <Button size="small" variation="destructive" onClick={() => deleteNotes(currentMemory.id)}>Delete</Button>
                  </Menu>

                  {updateSuccess && <Message colorTheme="success">Succesfully updated!</Message>}
                  {error && <Message colorTheme="error">An error occured when updating the Memory</Message>}
                </Grid>
              </Grid>
            </Flex>: <></>
          }
        </div>
      </div>
    </>
  );
};