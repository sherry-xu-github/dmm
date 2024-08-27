import { getUrl, uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import outputs from "../../amplify_outputs.json";
import { Amplify } from "aws-amplify";
import { Schema } from "../../amplify/data/resource";
import { useState, useEffect, FormEvent } from "react";
import { useMemoryContext } from "../context/MemoryContext";
import { Predictions } from '@aws-amplify/predictions';


export interface Note {
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

Amplify.configure(outputs);
Amplify.configure({
  ...Amplify.getConfig(),
  Predictions: outputs.custom.Predictions,
});

const client = generateClient<Schema>({
  authMode: "userPool",
});

export const useMemoryUpload = (initialNote?: Note) => {

  const { currentMemory, 
    memoryName, 
    setMemories, 
    setError, 
    hasMemoryNameError, 
    setMemoryName, 
    setHasMemoryNameError, 
    tagValues, 
    setTagValues,
    setTagList,
    tagList,
    newTags,
    setNewTags,
    setTaggedMemories,
    setCurrentMemory,
    acValue
  } = useMemoryContext();

  useEffect(() => {
    fetchNotes()
  }, []);

  useEffect(() => {
    if (currentMemory) {
      console.log("Updated currentMemory:", currentMemory);
      setInitialTagValues();
      setTagList(currentMemory.tags);
    }
  }, [currentMemory]);


  useEffect(() => {
    if (tagList) {
      console.log("Updated tagList:", tagList);
      
    }
  }, [tagList]);


  useEffect(() => {
    if (tagValues) {
      console.log("Updated tagValues:", tagValues);
    }
  }, [tagValues]);

  useEffect(() => {
    if (newTags) {
      console.log("Updated newTags:", newTags);
    }
  }, [newTags]);








  const setInitialTagValues = () => {
    console.log(currentMemory)
    console.log(tagValues)
    if (currentMemory && !tagValues) {
      const initialTagValues = Object.fromEntries(
          currentMemory.tags.map(tag => [tag, true])
      );
  
      console.log(initialTagValues);
      setTagValues(initialTagValues);
    }
  }

  
  const checkMemoryName = async () => {
    //const { setHasMemoryNameError, setError } = useMemoryContext();
    if (memoryName){
      try{
        //console.log(memoryName)
        const data = await getNotesByName(memoryName);
    
        console.log(data);
        console.log(data.length > 0)
        setHasMemoryNameError(data.length > 0)
        return data.length > 0
        
      }
      catch (err) {
        console.error(err)
        throw new Error("Caught other error fetching named notes")
      }
    }
  }  


  const createNote = async (event: FormEvent<HTMLFormElement>) => {
    // Implementation...
    event.preventDefault();
    const cT = event.currentTarget;
    const form = new FormData(cT);
    
    console.log(event.currentTarget)

    const imageName = (form.get("image") as File)?.name
    console.log(imageName);

    const err = await checkMemoryName();


    console.log(event.currentTarget)

    if (! hasMemoryNameError && ! err){

      const tagsForm = (form.get("tags") as string).split(",")
      const tags: string[] = []

      if (form.get("image")){
        const file = form.get("image") as File;
          //const response = 
          await Predictions.identify({
            labels: {
              source: {
                file
              },
              type: 'LABELS'
            }
          })
          .then((response) => {
            const { labels } = response;
            console.log(labels)
            labels.forEach((object) => {
              const { name, boundingBoxes } = object;
              //console.log(name, boundingBoxes)
            });
            const labelNames: string[] = labels.map(labelInfo => labelInfo.name);
            console.log(labelNames)
            tags.push(...tagsForm, ...labelNames);
          })
          .catch((err) => console.log({ err }));

          //console.log(response)
      }
      
      console.log(tags)
      if (tags){
        //console.log(tags)
        for (const currentTag of tags){
          //console.log(currentTag)
          const taggedResult = await client.models.Note.create({
            tag: currentTag,
            name: form.get("name") as string
            // change this to use id
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
  };

  const updateMemory = async (event: FormEvent<HTMLFormElement>) => {
    // Implementation...
    console.log("updating")
      event.preventDefault();
      const cT = event.currentTarget;
      const form = new FormData(cT);
      try{
        const uNotes = await getNotesByName(form.get("name") as string);
        
        // edit existing tags
        for (const currentUpdate of uNotes){
          // if parent, update
          if (currentUpdate.tags) {
            console.log("parent");
            console.log(currentUpdate);
            
            const updateContent={
              id: currentUpdate.id as string,
              name: form.get("name") as string,
              description: form.get("description") as string,
              tags: Object.keys(tagValues).filter(TagStatus => tagValues[TagStatus]),
              //support different image
            }
            console.log(updateContent)

            const { data } = await client.models.Note.update(updateContent);
            
          }
          else {
            // if not parent, check if tag still exists. if not, delete
            console.log("not parent");
            console.log(currentUpdate);
            
            if (!tagValues[currentUpdate.tag]){
              console.log("not a keeper");
              console.log(currentUpdate);
              deleteNotebyId(currentUpdate.name, currentUpdate.id)
            }
            else{
              console.log("keeper");
              console.log(currentUpdate);
            }
          }
        }

        // add new tags if any
        for (const [cTag, cTagState] of Object.entries(tagValues)) {
          console.log(cTag, cTagState);


          //console.log(parentMem.tags.include(cTag))
          console.log(currentMemory.tags)

          
          if ((!currentMemory.tags.includes(cTag)) && cTagState) {
            console.log("new row")
            console.log(cTag)
            const taggedResult = await client.models.Note.create({tag: cTag, name: currentMemory.name});          
          }
          
        }
      }
      catch (err) {
        console.error(err)
        setError("Caught other error fetching named notes")
      }
      
      fetchNotes();
      checkMemoryName();
      cT.reset();
      
      onSelectFunc(acValue);

  };


  const deleteNotes = async(noteName: string) => {
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

  const deleteNoteByName = async (noteName: string) => {
      // Implementation...
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

  };



  async function deleteNotebyId(noteName: string, memId: string) {
    console.log("deleting")
    try{
      const dNotes = await getNotesByName(noteName);
      
      //console.log(typeof(data[0]))
      //console.log(typeof(data))
      for (const currentDelete of dNotes){
        const toBeDeletedNote = {
          id: currentDelete.id as string,
        };
    
        if (memId === currentDelete.id) {
          const { data: deletedNote } = await client.models.Note.delete(
            toBeDeletedNote
          );
          console.log(deletedNote);
        }
      }
    }
    catch (err) {
      console.error(err)
      setError("Caught other error fetching named notes")
    }
    
    fetchNotes();
    checkMemoryName();
  }

      
  const getNotesByName = async (noteName: string): Promise<Note[]> => {
  // Implementation...
  //const {setError } = useMemoryContext();
    console.log(noteName)
    const { data, errors } = await client.models.Note.listNoteByNameAndCreatedAt({
      name: noteName,
    });
    console.log(data);

    const dNotes = await Promise.all(
      data.map(async (note) => note)
    )
    console.log(dNotes)

    if (errors) {
      console.log(errors);
      throw new Error("Error fetching named notes");
    }
    return dNotes
  };


  const fetchNotes = async () => {
    //const { setMemories } = useMemoryContext();
    
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
    setMemories(filteredNotes);
  }

  async function addTag() {

    const newTagValues = { ...tagValues, [newTags]: true };
    setTagValues(newTagValues);
    const newTagsList = [ ...tagList, newTags]
    setNewTags(newTagsList)
    
    setTagList(newTagsList)
  }

  const handleTagChange = (e) => {
    console.log(e.target.name)
    console.log(e.target.checked)
    
    if (tagValues){
      console.log(tagValues);
      const newTagValues = { ...tagValues, [e.target.name]: e.target.checked };
      //console.log(newTagValues);
      setTagValues(newTagValues);
    }
    else{
      console.log(tagValues)
    }

    async function fetchTaggedMemories() {
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
          setTaggedMemories(data);
        }
      }
      catch (err) {
        console.error(err)
        setError("Caught other error fetching tagged notes")
      }
    }
    
    
  };

  async function onSelectFunc(label: string) {
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
        setCurrentMemory(cN);
      }
    }
  }

  



  return {
    memoryName,
    setMemoryName,
    hasMemoryNameError,
    createNote,
    updateMemory,
    fetchNotes,
    tagValues,
    setTagValues,
    checkMemoryName,
    deleteNotes,
    getNotesByName,
    addTag,
    handleTagChange,
    onSelectFunc
  };
}




export const useMemoryAutoComplete = () => {
  const { currentMemory, 
    memoryName, 
    setMemories, 
    setError, 
    hasMemoryNameError, 
    setMemoryName, 
    setHasMemoryNameError, 
    tagValues, 
    setTagValues,
    setTagList,
    tagList,
    newTags,
    setCurrentMemory,
    setAcValue,
    memories,
    acValue,
    setNewTags,
    isModalOpen,
    setIsModalOpen,
  } = useMemoryContext();
  const {getNotesByName, onSelectFunc} = useMemoryUpload();


  


  const options = memories.map( (memory) => {
    return {"id": memory.name, "label": memory.name}
  } )
  
  const onChange = (event: any) => {
    setAcValue(event.target.value);
  };

  
  const onSelect = (option: any) => {
    const { label } = option;
    setAcValue(label);
    console.log(label);

    onSelectFunc(label);
    //setInitialTagValues();
  };

  

  const onClear = () => {
    setAcValue('');
    setCurrentMemory(null);
    setTagValues(null);

  };



  const handleImageClick = (name) => {
    setIsModalOpen(true);
    //setAcValue(currentMemory.name);
    setAcValue(name);
    onSelectFunc(name);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAcValue('');
    setCurrentMemory(null);
    setTagValues(null);

    
  };


  return {
    acValue,
    options,
    onClear,
    onSelect,
    onChange,
    handleImageClick,
    closeModal

  }
  
  

}