import { Button, Flex, View, DropZone, VisuallyHidden, Text, Loader, Message } from "@aws-amplify/ui-react";
import { useMemoryUpload } from "../services/memoryService";
import logo from './../assets/MemoryCellar.png';
import { useMemoryContext } from "../context/MemoryContext";
import * as React from 'react';

export const MemoryUpload = () => {
  const {
    handleSubmit,
    onFilePickerChange
  } = useMemoryUpload();

  
  const {
    files,
    setFiles,
    percentage
  } = useMemoryContext();



  const acceptedFileTypes = ['image/png', 'image/jpeg'];
  const hiddenInput = React.useRef(null);


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
        
        <View as="form" onSubmit={handleSubmit(files)}>
        <Flex direction="column" justifyContent="center" gap="2rem" padding="2rem">
            
            <DropZone
              acceptedFileTypes={acceptedFileTypes}
              onDropComplete={({ acceptedFiles, rejectedFiles }) => {
                setFiles(acceptedFiles);
              }}
            >
              <Flex direction="column" alignItems="center">
                <Text>Drag images here or</Text>
                <Button size="small" onClick={() => hiddenInput.current.click()}>
                  Browse
                </Button>
              </Flex>

              <VisuallyHidden>
                <input
                  name="image"
                  type="file"
                  tabIndex={-1}
                  ref={hiddenInput}
                  onChange={onFilePickerChange}
                  multiple={true}
                  accept={acceptedFileTypes.join(',')}
                />
              </VisuallyHidden>

            </DropZone>

            

            <Flex direction="column" justifyContent="center">
              {files.map((file) => (
                <Text fontSize="0.8em" key={file.name}>{file.name}</Text>
              ))}
            </Flex>
            
            {percentage > 0 && percentage < 100 && <Loader variation="linear" percentage={percentage} isDeterminate isPercentageTextHidden/>}
            {percentage === 100 && <Message colorTheme="success">Upload complete!</Message>}

            <Button type="submit" variation="primary">
              Create Memory
            </Button>

            
        </Flex>

        </View>
        
    </Flex>
  );
};