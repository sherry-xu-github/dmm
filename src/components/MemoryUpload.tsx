import { TextField, Button, Flex, View } from "@aws-amplify/ui-react";
import { useMemoryUpload } from "../services/memoryService";
import logo from './../assets/MemoryCellar.png';
import { useMemoryContext } from "../context/MemoryContext";

export const MemoryUpload = () => {
  
  const { 
    hasMemoryNameError,
    checkMemoryName,
    createNote,
  } = useMemoryUpload();


  const {
    setMemoryName,
  } = useMemoryContext();
  


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
        
        <View as="form" onSubmit={createNote}>
        <Flex direction="column" justifyContent="center" gap="2rem" padding="2rem">
            <TextField
            name="name"
            placeholder="Memory Name"
            label="Memory Name"
            labelHidden
            variation="quiet"
            required
            onChange={(e) => setMemoryName(e.target.value)}
            onBlur={() => checkMemoryName()}
            hasError={hasMemoryNameError}
            errorMessage="This Memory Name has been used"
            />
            <TextField name="description" placeholder="Memory Description" label="Memory Description" labelHidden variation="quiet" required />
            <TextField name="tags" placeholder="Memory Tags" label="Memory Tags" labelHidden variation="quiet" required />
            <View name="image" as="input" type="file" alignSelf="end" accept="image/png, image/jpeg" />
            <Button type="submit" variation="primary">
            Create Memory
            </Button>
        </Flex>
        </View>
    </Flex>
  );
};