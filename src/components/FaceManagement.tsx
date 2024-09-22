import { Grid, Flex, Image, View, useTheme, SearchField, Button, TextField } from "@aws-amplify/ui-react";
import { useCollectionManager, useFaceUserManager } from "../services/faceManager";
import { useMemoryContext } from "../context/MemoryContext";
//import { useContext, useState } from 'react';

import logo from './../assets/MemoryCellar.png';

export const FaceManagement = () => {
  const {
    filteredImages,
    isModalOpen,
    currentMemory,
    searchString,
    collectionName,
    setCollectionName,
    faceUsers,

  } = useMemoryContext();

  


  const { 
    listCollection,
    onCreateCollection,
    describeCollection,
    deleteCollection,
  } = useCollectionManager(collectionName);


  const {
    createUser,
    listUsers,
    deleteUser,
    deleteUserUI
  } = useFaceUserManager(collectionName);


  


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
      
      <Button onClick={listCollection}>List Collections</Button>
      <Button onClick={listUsers}>List Users</Button>
      
      <Flex>
        <TextField id="CollectionName" label="Collection Name" 
          labelHidden={true} 
          value={collectionName}
          onChange={(e) => setCollectionName(e.currentTarget.value)} 
          outerEndComponent={
            <>
              <Button onClick={onCreateCollection}>Create Col</Button>
              <Button onClick={describeCollection}>Describe</Button>
              <Button onClick={deleteCollection}>Delete</Button>
              <Button onClick={createUser}>Create User</Button>
              <Button onClick={deleteUserUI}>Delete User</Button>
            </>            
          } 
        />

      </Flex>
      
      
    </Flex>
    
);
};

