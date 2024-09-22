import { getUrl } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import { Schema } from "../../amplify/data/resource";
import { useEffect } from "react";
import { useMemoryContext } from "../context/MemoryContext";
import outputs from "../../amplify_outputs.json";
import nlp from 'compromise';
import plg from 'compromise-dates'


import { fetchAuthSession } from "aws-amplify/auth";
import { 
  CreateCollectionCommand, ListCollectionsCommand, 
  DescribeCollectionCommand, DeleteCollectionCommand, 
  IndexFacesCommand, 
  CreateUserCommand, ListUsersCommand, DeleteUserCommand, SearchUsersByImageCommand,
  ListFacesCommand, AssociateFacesCommand,
  SearchFacesByImageCommand
} from  "@aws-sdk/client-rekognition";
import  { RekognitionClient } from "@aws-sdk/client-rekognition";
import { v4 as uuidv4 } from 'uuid';
//import { listMapper } from "aws-cdk-lib";



Amplify.configure(outputs);
Amplify.configure({
  ...Amplify.getConfig(),
  Predictions: outputs.custom.Predictions,
});

const client = generateClient<Schema>({
  authMode: "userPool",
});


const authSession = await fetchAuthSession();

async function getRekogClient() {
  // Set the AWS Region.
  //const REGION = Stack.of(backend.auth.resources.userPool).region;
  const REGION = Amplify.getConfig().Storage?.S3.region;
  console.log(`region:${REGION}`)
  
  const rekogClient = new RekognitionClient({
    region: REGION,
    credentials: authSession.credentials,
  });
  return rekogClient;
};

const rekogClient = await getRekogClient();
const identityIdRaw = authSession.identityId;
const currentIdentityId = identityIdRaw!.replace(/[^a-zA-Z0-9_.\-]+/g, '-');
console.log(currentIdentityId);
console.log("test0");



export const useCollectionManager: any = (collectionName: string) => {
  const onCreateCollection = () => {
    console.log(collectionName)
    createCollection();
    
  };

  const createCollection = async () => {
    try {
       console.log(`Creating collection: ${currentIdentityId}`)
       const data = await rekogClient.send(new CreateCollectionCommand({CollectionId: currentIdentityId}));
       /*
       console.log("Collection ARN:")
       console.log(data.CollectionARN)
       console.log("Status Code:")
       console.log(String(data.StatusCode))
       console.log("Success.",  data);
       */
       return data;
    } catch (err) {
      console.log("Error", err.stack);
    }
  };

  const listCollection = async () => {
    var max_results = 10
    console.log("Displaying collections:")
    var response = await rekogClient.send(new ListCollectionsCommand({MaxResults: max_results}))
    console.log(response)
    var collection_count = 0
    var done = false
    while (done == false){
        var collections = response.CollectionIds
        collections.forEach(collection => {
            console.log(collection)
            collection_count += 1
        });
        return collection_count
    }
  };
  

  const describeCollection = async () => {
    console.log(collectionName)
    try {
       console.log(`Attempting to describe collection named - ${collectionName}`)
       var response = await rekogClient.send(new DescribeCollectionCommand({CollectionId: collectionName}))
       console.log("Describe collection:")
       console.log(response)
       /*
       console.log('Collection Arn:')
       console.log(response.CollectionARN)
       console.log('Face Count:')
       console.log(response.FaceCount)
       console.log('Face Model Version:')
       console.log(response.FaceModelVersion)
       console.log('Timestamp:')
       console.log(response.CreationTimestamp)
       */
       return response; // For unit tests.
    } catch (err) {
      console.log("Error", err.stack);
    }
  };
  
  const deleteCollection = async () => {
    try {
       console.log(`Attempting to delete collection named - ${collectionName}`)
       var response = await rekogClient.send(new DeleteCollectionCommand({CollectionId: collectionName}))
       var status_code = response.StatusCode
       if (status_code = 200){
           console.log("Collection successfully deleted.")
       }
       return response; // For unit tests.
    } catch (err) {
      console.log("Error", err.stack);
    }
  };
  return {
    listCollection,
    createCollection,
    onCreateCollection,
    describeCollection,
    deleteCollection,
    identityIdRaw,
  };
};


export const useFaceUserManager: any = (collectionName: string) => {
  const indexFace = async(bucket, name) => {
    // add faces in a picture to a collection
    // return the face records (list of faces in the image) and list of faces
    const input = {
      CollectionId: currentIdentityId,
      DetectionAttributes: [],
      //"ExternalImageId": "myphotoid",
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: name
        }
      }
    };
    const command = new IndexFacesCommand(input);
    const response = await rekogClient.send(command);

    console.log("index face response:")
    console.log(response)

    const faces = response.FaceRecords.map(face => face.Face.FaceId);

    console.log('indexed faces in image')
    console.log(faces)

    return [response.FaceRecords, faces]
  }

  async function searchFace(bucket, name) {
    const input = {
      CollectionId: currentIdentityId,
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: name,
        },
      },
      MaxFaces: 5, // Number of faces to return
      FaceMatchThreshold: 85, // Confidence threshold for a match
    };
    const command = new SearchFacesByImageCommand(input);
    const response = await rekogClient.send(command);
    console.log(`Search response:`)
    console.log(response)
    console.log(response.$metadata)
    console.log(response.FaceMatches)
    console.log(response.FaceModelVersion)
    console.log(response.SearchedFaceBoundingBox)
    console.log(response.SearchedFaceConfidence)

    if (response.FaceMatches.length > 0) {
      response.FaceMatches.forEach(facematch=> {
        // Face matched an existing record, associate with existing PersonId
        const matchedFaceId = facematch.Face.FaceId;
        // Retrieve PersonId from DynamoDB using matchedFaceId
        console.log(`matched face id: ${matchedFaceId}`)

        if ("UserId" in facematch.Face) {
          const userid = facematch.Face?.UserId;
          console.log("user id matched")
          console.log(userid)
          return [userid, true]
        }
        
        
      });

      console.log("user id matched not found")
      return [null, true]

      
    } else {
      const userId = generateUniqueId();
      await createUser(userId);
      console.log(`new user id: ${userId}`);
      return [userId, false]
    }
  }

  async function searchUsers(bucket, name) {
    // see if user already exists using a face image
    // if so, return user id
    // if not, create a new user
    
    const input = {
      CollectionId: currentIdentityId,
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: name,
        },
      },
      MaxUsers: 5, // Number of faces to return
      FaceMatchThreshold: 85, // Confidence threshold for a match
    };
    const command = new SearchUsersByImageCommand(input);
    const response = await rekogClient.send(command);
    console.log(`Search response:`)
    console.log(response)

    if (response.UserMatches.length > 0) {
      const matchedUser = response.UserMatches.find(usermatch => {
        const matchedId = usermatch.User.UserId;
        console.log(`matched user id: ${matchedId}`);
        return matchedId; // returning the first match
      });
      return [matchedUser, true]
    } else {
      const userId = generateUniqueId();
      await createUser(userId);
      console.log(`new user id: ${userId}`);
      return [userId, false]
    }
  }

  const associateFaces = async (faceIds, userId) => {
    try {
      console.log(`Associating faces: ${faceIds} ${userId}`)
      console.log(`to user: ${userId}`)

      const input = {
       
        CollectionId: currentIdentityId,
        FaceIds: faceIds,
        UserId: userId,
        UserMatchThreshold: 70
      };
      const command = new AssociateFacesCommand(input);
      const response = await rekogClient.send(command);
      // example id: createuser-1686181562299
      console.log(`faces associated`)
      console.log(response)
      
      return response;
    } catch (err) {
      console.log("Error", err.stack);
    }
  };


  function generateUniqueId() {
    const uniqueId = uuidv4(); // Generates a unique ID (e.g., 'e1c3dfc8-88de-4b4d-b8b3-cf4b76adbb37')
    console.log('Generated UUID:', uniqueId);
    return uniqueId;
  }



  const listUsers = async () => {
    try {
      console.log(`List users: ${collectionName}`)

      const input = {
        "CollectionId": currentIdentityId,
      };
      const command = new ListUsersCommand(input);
      const response = await rekogClient.send(command);
      // example id: createuser-1686181562299
      console.log(`Listing users: ${response}`)
      console.log(response.$metadata)
      console.log(response.NextToken)
      console.log(response.Users)
      return response;
    } catch (err) {
      console.log("Error", err.stack);
    }
  };

  const createUser = async (userId) => {
    try {
         
      console.log(`Creating user: ${userId}`)

      const input = {
        "CollectionId": currentIdentityId,
        "UserId": userId
      };
      const command = new CreateUserCommand(input);
      const response = await rekogClient.send(command);
      // example id: createuser-1686181562299
      console.log(`user created`)
      console.log(response)
      
      return response;
    } catch (err) {
      console.log("Error", err.stack);
    }
  };



  const deleteUser = async(userId) => {
    try {
      const input = {
        "CollectionId": currentIdentityId,
        "UserId": userId
      };
      const command = new DeleteUserCommand(input);
      const response = await rekogClient.send(command);
      
      console.log(`user deleted`)
      console.log(response)
      // example id: deleteuser-1686181913475
    } catch (err) {
      console.log("Error", err.stack);
    }
    
  }

  const deleteUserUI = async() => {
    const userId = collectionName
    try {
      const input = {
        "CollectionId": currentIdentityId,
        "UserId": userId
      };
      const command = new DeleteUserCommand(input);
      const response = await rekogClient.send(command);
      
      console.log(`user deleted`)
      console.log(response)
      // example id: deleteuser-1686181913475
    } catch (err) {
      console.log("Error", err.stack);
    }
    
  }
  
  
  return {
    indexFace,
    createUser,
    listUsers,
    searchFace,
    associateFaces,
    searchUsers,
    generateUniqueId,
    deleteUser,
    deleteUserUI
  };
};