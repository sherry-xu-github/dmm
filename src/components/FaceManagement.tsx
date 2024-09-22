import { Grid, Flex, Image, View, useTheme, SearchField, Button, TextField, Text } from "@aws-amplify/ui-react";
import { useCollectionManager, useFaceUserManager } from "../services/faceManager";
import { useMemoryContext } from "../context/MemoryContext";
import { useMemoryManage } from "../services/memoryManage";
//import { useContext, useState } from 'react';

//import { Storage } from 'aws-amplify';

import { getUrl } from 'aws-amplify/storage'
;
import { useEffect, useState } from 'react';

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
    memories,
    imageURLs

  } = useMemoryContext();

  const {
    //fetchImageURLs
  }
  =useMemoryManage();


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

      
      <Grid 
        templateColumns="repeat(auto-fit, minmax(150px, 1fr))"
        autoRows="minmax(100px, auto)"
        gap={tokens.space.small}
        padding="2em"
      >
        {faceUsers?.map((user) => (
          <View key={user.facesUserId}>
            
            {imageURLs[user.facesUserId] && (
              <Image
                src={imageURLs[user.facesUserId].url.href}
                alt={`visual aid for ${imageURLs[user.facesUserId].url.href}`}
                style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                maxHeight="250px"
                maxWidth="250px"
              />
            )}
            <Text>{user.facesUserName}</Text>
          </View>
        ))}
        
      </Grid>

      
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

