import { Button, Flex, View, DropZone, VisuallyHidden, Text, Loader, Message, Theme, ThemeProvider } from "@aws-amplify/ui-react";
import { useMemoryManage } from "../services/memoryManage";
import logo from './../assets/MemoryCellar.png';
import { useMemoryContext } from "../context/MemoryContext";
import {useRef} from 'react';

export const MemoryUpload = () => {
  const {
    handleSubmit,
    onFilePickerChange
  } = useMemoryManage();

  const {
    files, setFiles,
    percentage
  } = useMemoryContext();

  const theme: Theme = {
    name: 'loader-theme',
    tokens: {
      components: {
        loader: {
          strokeEmpty: { value: '{colors.neutral.20}' },
          strokeFilled: { value: '{colors.green.80}' },
  
          // sizes
          large: {
            width: { value: '{fontSizes.xxxl}' },
            height: { value: '{fontSizes.xxxl}' },
          },
  
          // linear loader
          linear: {
            width: { value: '50%' },
            strokeWidth: { value: '{fontSizes.xxs}' },
            strokeFilled: { value: '{colors.white}' },
            strokeEmpty: { value: '{colors.neutral.20}' },
            animationDuration: { value: '2s' },
          },
        },
      },
    },
  };

  const acceptedFileTypes = ['image/png', 'image/jpeg'];
  const hiddenInput = useRef<HTMLInputElement | null>(null);

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
        <Flex direction="column" justifyContent="center" gap="2rem" >
          <ThemeProvider theme={theme} colorMode="system">
            <Loader variation="linear" percentage={100} isDeterminate isPercentageTextHidden/>
          </ThemeProvider>

          <DropZone
            width="100%"
            acceptedFileTypes={acceptedFileTypes}
            onDropComplete={({ acceptedFiles, rejectedFiles }) => {
              setFiles(acceptedFiles);
              console.log(`Failed to upload: ${rejectedFiles}`)
            }}
          >
            <Flex direction="column" alignItems="center">
              <Text>Drag images here or</Text>
              <Button size="small" onClick={() => hiddenInput.current!.click()}>
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
            {files.map((file: any) => (
              <Text fontSize="0.8em" key={file.name}>{file.name}</Text>
            ))}
          </Flex>
          {percentage === -1 && <Loader />}
          {percentage > 0 && percentage < 100 && <Loader variation="linear" percentage={percentage} isDeterminate isPercentageTextHidden/>}
          {percentage === 100 && <Message colorTheme="success">Upload complete!</Message>}
          {percentage === -2 && <Message colorTheme="error">Upload failed!</Message>}
          {percentage === -3 && <Message colorTheme="error">Please add some photos</Message>}
          <Button type="submit" variation="primary">
            Create Memory
          </Button> 
        </Flex>
      </View>
    </Flex>
  );
};