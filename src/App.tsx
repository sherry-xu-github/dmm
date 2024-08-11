import { useState, useEffect, FormEvent, memo } from "react";
import {
  Authenticator,
  Button,
  Text,
  TextField,
  Heading,
  Flex,
  View,
  Image,
  Grid,
  Divider,
  Badge,
  Autocomplete,
  ComboBoxOption,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { Schema } from "../amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";
import { getUrl } from "aws-amplify/storage";
import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";


Amplify.configure(outputs);
const client = generateClient<Schema>({
  authMode: "userPool",
});

interface Note {
  id: string | null;
  name: string | null;
  description: string | null;
  image?: string | null;
  owner: string | null;
  createdAt: string | null;
  updatedAt: string;
  tag: string | null;
  tags: Array<string | null> | null;
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [taggedNotes, setTaggedNotes] = useState<Note[] | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  const [hasMemoryNameError, setHasMemoryNameError] = useState(false)
  const [memoryName, setMemoryName] = useState('');

  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  //const options = [{"id":"apple","label":"apple"},{"id":"banana","label":"banana"},{"id":"cherry","label":"cherry"},{"id":"grape","label":"grape"},{"id":"kiwis","label":"kiwis"},{"id":"lemon","label":"lemon"},{"id":"mango","label":"mango"},{"id":"orange","label":"orange"},{"id":"strawberry","label":"strawberry"}]
  const options = notes.map( (note) => {
    return {"id": note.name, "label": note.name}
  } )
  
  const [value, setValue] = useState('');

  const onChange = (event: any) => {
    setValue(event.target.value);
  };

  
  const onSelect = async(option: any) => {
    const { label } = option;
    setValue(label);
    console.log(label);

    const dNotes = await getNotesByName(label);
    for (const cN of dNotes){
      console.log(cN);
      if (cN.tags){
        console.log(cN);
        if (cN.image) {
          const linkToStorageFile = await getUrl({
            path: ({ identityId }) => `media/${identityId}/${cN.image}`,
          });
          console.log(linkToStorageFile.url);
          cN.image = (linkToStorageFile.url).toString();
        }
        setCurrentNote(cN);
      }
    }
    
  };

  const onClear = () => {
    setValue('');
    setCurrentNote(null);

  };


  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchTags() {
    //const { data: fetchedNotes } = await client.models.Note.
  }
  
  async function fetchTaggedNotes() {
    try{
      const { data, errors } = 
      await client.models.Note.listNoteByTagAndName({
        tag: "yay",
        name: {
          beginsWith: "8"
        }
      });

      console.log(data);
      if (errors) {
        console.log(errors);
        setError("Error fetching tagged notes");
      }
      else{
        setTaggedNotes(data);
      }
    }
    catch (err) {
      console.error(err)
      setError("Caught other error fetching tagged notes")
    }
  }

  async function checkMemoryName() {
    try{
      const {data, errors} = 
      await client.models.Note.listNoteByNameAndCreatedAt({
        name: memoryName,
      })

      console.log(data);
      if (errors) {
        console.log(errors);
        setError("Error fetching named notes");
      }
      else{
        console.log(data.length > 0)
        setHasMemoryNameError(data.length > 0)
        return data.length > 0
      }
    }
    catch (err) {
      console.error(err)
      setError("Caught other error fetching named notes")
    }
  }  

  async function fetchNotes() {
    const { data: fetchedNotes } = await client.models.Note.list();
    const updatedNotes = await Promise.all(
      fetchedNotes.map(async (note) => {
        if (note.image) {
          const linkToStorageFile = await getUrl({
            path: ({ identityId }) => `media/${identityId}/${note.image}`,
          });
          console.log(linkToStorageFile.url);
          note.image = (linkToStorageFile.url).toString();
        }
        return note;
      })
    );
    
    const filteredNotes = updatedNotes.filter(note => 
      note.description && note.description.trim() !== ''
    );
    
    console.log(filteredNotes);
    setNotes(filteredNotes);
  }

  async function createNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cT = event.currentTarget;
    const form = new FormData(cT);
    
    console.log(event.currentTarget)

    const imageName = (form.get("image") as File)?.name
    console.log(imageName);

    const err = await checkMemoryName();


    console.log(event.currentTarget)

    //if (! hasMemoryNameError && ! err){
    if (! hasMemoryNameError && ! err){

      
      const tags = (form.get("tags") as string).split(",")
      
      if (tags){
        //console.log(tags)
        for (const currentTag of tags){
          //console.log(currentTag)
          const taggedResult = await client.models.Note.create({
            tag: currentTag,
            name: form.get("name") as string
          });
          //console.log(taggedResult)
        }
      }

      const result = await client.models.Note.create({
        name: form.get("name") as string,
        description: form.get("description") as string,
        image: imageName,
        tags: tags,
      });

      if (result.data) {
        const newNote = result.data;
        console.log(newNote);
        if (newNote.image){
          await uploadData({
            path: ({ identityId }) => `media/${identityId}/${newNote.image}`,
            data: form.get("image") as File,
          }).result;
        }
      }
    
      fetchNotes();
      //event.currentTarget.reset();
      cT.reset();
      
    }
    
  }

  async function getNotesByName(noteName: string) {
    console.log(noteName)
    const { data, errors } = 
      await client.models.Note.listNoteByNameAndCreatedAt({
        name: noteName,
      });
      console.log(data);

      const dNotes = await Promise.all(
        data.map(async (note) => note)
      )
    console.log(dNotes)

    if (errors) {
      console.log(errors);
      setError("Error fetching named notes");
    }
    return dNotes
  }

  async function deleteNotes(noteName: string) {
    console.log("deleting")
    try{
      const dNotes = await getNotesByName(noteName);
      
      //console.log(typeof(data[0]))
      //console.log(typeof(data))
      for (const currentDelete of dNotes){
        const toBeDeletedNote = {
          id: currentDelete.id as string,
        };
    
        const { data: deletedNote } = await client.models.Note.delete(
          toBeDeletedNote
        );
        console.log(deletedNote);
      }
    }
    catch (err) {
      console.error(err)
      setError("Caught other error fetching named notes")
    }
    
    fetchNotes();
    checkMemoryName();
  }

  return (
    <Authenticator>
      {({ signOut }) => (
        <Flex
          className="App"
          justifyContent="center"
          alignItems="center"
          direction="column"
          width="70%"
          margin="0 auto"
          color="gray"
        >
          <Heading level={1}>New Memory</Heading>
          <View as="form" margin="3rem 0" onSubmit={createNote}>
            <Flex
              direction="column"
              justifyContent="center"
              gap="2rem"
              padding="2rem"
            >
              <TextField
                name="name"
                placeholder="Memory Name"
                label="Memory Name"
                labelHidden
                variation="quiet"
                required
                onChange={(e) => setMemoryName(e.target.value)}
                onBlur={checkMemoryName}
                hasError={hasMemoryNameError}
                errorMessage="This Memory Name has been used"
                
              />
              <TextField
                name="description"
                placeholder="Memory Description"
                label="Memory Description"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="tags"
                placeholder="Memory Tags"
                label="Memory Tags"
                labelHidden
                variation="quiet"
                required
              />
              <View
                name="image"
                as="input"
                type="file"
                alignSelf={"end"}
                accept="image/png, image/jpeg"
              />

              <Button type="submit" variation="primary">
                Create Memory
              </Button>
            </Flex>
          </View>
          <Divider />
          <Heading level={1}>My Memories</Heading>
          <Grid
            margin="2rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >
            {notes.map((note) => (
              <Flex
                key={note.id || note.name}
                direction="column"
                justifyContent="center"
                alignItems="center"
                gap="2rem"
                border="1px solid #ccc"
                padding="2rem"
                borderRadius="5%"
                className="box"
              >
                <Heading level={4}>{note.name}</Heading>
                <Text fontStyle="italic">{note.description}</Text>
                {note.image && (
                  <Image
                    src={note.image}
                    alt={`visual aid for ${note.name}`}
                    style={{ width: 400 }}
                  />
                )}
                
                <div>
                  {note.tags?.map((tag, index) => (
                    <Badge key={index}>{tag}</Badge>
                  ))}
                </div>
                
                <Button
                  variation="primary"
                >
                  Edit
                </Button>
              </Flex>
            ))}
          </Grid>
          <Divider></Divider>
          <Heading level={1}>Edit Memory</Heading>
          
          <Flex
            direction="column"
            justifyContent="center"
            gap="2rem"
            padding="2rem"
          >
            <Autocomplete
            label="Select a Memory"
            options={options as ComboBoxOption[]}
            value={value}
            onChange={onChange}
            onClear={onClear}
            onSelect={onSelect}
            placeholder="Search here to start"  
            />

          </Flex>
          
          
          <Grid
            margin="2rem 0"
            autoFlow="row"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >
            

            {currentNote ? <Flex
              key={currentNote.id || currentNote.name}
              direction="column"
              justifyContent="center"
              alignItems="center"
              gap="2rem"
              border="1px solid #ccc"
              padding="2rem"
              borderRadius="5%"
              className="box"
            >
              <Heading level={4}>{currentNote.name}</Heading>
              <Text fontStyle="italic">{currentNote.description}</Text>
              {currentNote.image && (
                <Image
                  src={currentNote.image}
                  alt={`visual aid for ${currentNote.name}`}
                  style={{ width: 400 }}
                />
              )}
              
              <div>
                {currentNote.tags?.map((tag, index) => (
                  <Button key={index}>{tag}</Button>
                ))}
              </div>
              
              <Button
                variation="destructive"
                onClick={() => deleteNotes(currentNote.name as string) }
              >
                Delete
              </Button>
              
            </Flex> : <Text></Text>}
          </Grid>
          <Button onClick={signOut}>Sign Out</Button>
        </Flex>
      )}
    </Authenticator>
  );
}

/*import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={reactLogo} className="logo react" alt="React logo" />

        <h1>Hello from Amplify</h1>
      </header>
    </div>
  );
}

export default App;
*/

/*import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
*/






/*

import { FormEvent, useState } from "react";
import { Loader, Placeholder } from "@aws-amplify/ui-react";
import "./App.css";
import { Amplify } from "aws-amplify";
import { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
//import outputs from "../amplify_outputs.json";


import "@aws-amplify/ui-react/styles.css";

//Amplify.configure(outputs);


const amplifyClient = generateClient<Schema>({
  authMode: "userPool",
});


function App() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    /*
    try {
      const formData = new FormData(event.currentTarget);
      
      
      const { data, errors } = await amplifyClient.queries.askBedrock({
        ingredients: [formData.get("ingredients")?.toString() || ""],
      });

      if (!errors) {
        setResult(data?.body || "No data returned");
      } else {
        console.log(errors);
      }
      

  
    } catch (e) {
      alert(`An error occurred: ${e}`);
    } finally {
      setLoading(false);
    }
    
  };
  */

  /*
  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal
          <br />
          <span className="highlight">Recipe AI</span>
        </h1>
        <p className="description">
          Simply type a few ingredients using the format ingredient1,
          ingredient2, etc., and Recipe AI will generate an all-new recipe on
          demand...
        </p>
      </div>
      <form onSubmit={onSubmit} className="form-container">
        <div className="search-container">
          <input
            type="text"
            className="wide-input"
            id="ingredients"
            name="ingredients"
            placeholder="Ingredient1, Ingredient2, Ingredient3,...etc"
          />
          <button type="submit" className="search-button">
            Generate
          </button>
        </div>
      </form>
      <div className="result-container">
        {loading ? (
          <div className="loader-container">
            <p>Loading...</p>
            <Loader size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
          </div>
        ) : (
          result && <p className="result">{result}</p>
        )}
      </div>
    </div>
  );
}

export default App;
*/