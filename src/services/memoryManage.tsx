import { getUrl, uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import { Schema } from "../../amplify/data/resource";
import { useEffect, FormEvent } from "react";
import { useMemoryContext } from "../context/MemoryContext";
import { Predictions } from '@aws-amplify/predictions';
import * as exifr from 'exifr';
import outputs from "../../amplify_outputs.json";


export interface Memory {
  id: string;
  name: string | null;
  description: string | null;
  image: string | null;
  owner: string | null;
  createdAt: string;
  updatedAt: string;
  dateTaken: string | null;
  location: {} | null;
  address: string | null;
  tag: string | null;
  tags: Array<string | null> | null;
  year: string | null;
  month: string | null;
}

Amplify.configure(outputs);
Amplify.configure({
  ...Amplify.getConfig(),
  Predictions: outputs.custom.Predictions,
});

const client = generateClient<Schema>({
  authMode: "userPool",
});

export const useMemoryManage: any = () => {
  const { 
    currentMemory, setCurrentMemory,
    tagValues, setTagValues,
    tagList, setTagList,
    newTags, setNewTags,
    setFiles,
    setMemories, 
    setError, 
    setPercentage,
    setIsModalOpen,
    setUpdateSuccess
  } = useMemoryContext();

  useEffect(() => {
    fetchMemories();
    resetStates();
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

  const onFilePickerChange = (event: any) => {
    const { files } = event.target;
    if (!files || files.length === 0) {
      return;
    }
    setFiles(Array.from(files));
  };

  const resetStates = () => {
    setPercentage(0);
    //setMName("");
    //setImageName("");
    //setTags([]);
    //setDateTaken("");
    //setLocation("");
    setFiles([]);
    // Reset other states as needed
  };

  const handleSubmit = (files: File[]) => (event: FormEvent<HTMLFormElement>) => {
    createMemories(event, files);
    return () => setPercentage(0);
  };

  const setInitialTagValues = () => {
    console.log(currentMemory)
    console.log(tagValues)
    if (currentMemory && !tagValues) {
      const initialTagValues = Object.fromEntries(
          currentMemory.tags.map((tag: string) => [tag, true])
      );
  
      console.log(initialTagValues);
      setTagValues(initialTagValues);
    }
  }

  /*
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
        throw new Error("Caught other error fetching named memories")
      }
    }
  } 
  */ 

  const createMemories = async (event: FormEvent<HTMLFormElement>, files: File[]) => {
    event.preventDefault();
    setPercentage(0);
    //const cT = event.currentTarget;
    //const form = new FormData(cT);
    //console.log(event.currentTarget)

    console.log(files)

    for (const file of files){
      const mName = new Date().toISOString().replace(/[^\w]/gi, '-');
      console.log(mName)

      const imageName = file.name;
      console.log(imageName);

      const location = {lat: 0.0, long: 0.0};
      let dateTaken = null;
      //const err = await checkMemoryName();
      //console.log(event.currentTarget)
      //const tagsForm = (form.get("tags") as string).split(",")

      try {
        // Read the EXIF data using exifr
        const metadata = await exifr.parse(file, { gps: true, tiff: true });
  
        dateTaken = metadata.DateTimeOriginal
          ? new Date(metadata.DateTimeOriginal).toJSON()
          : 'Unknown';
        
        if (metadata.latitude !== undefined && metadata.longitude !== undefined) {
          location.lat = metadata.latitude.toFixed(6);
          location.long = metadata.longitude.toFixed(6);
        }
        console.log(dateTaken, location)

      } catch (error) {
        console.error('Error reading metadata:', error);
      }
      
      const tags: string[] = []
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
        labels!.forEach((object) => {
          const { name, boundingBoxes } = object;
          console.log(name, boundingBoxes)
        });
        const labelNames: string[] = labels!.map(labelInfo => labelInfo.name as string);
        console.log(labelNames)
        //tags.push(...tagsForm, ...labelNames);
        tags.push(...labelNames);
      })
      .catch((err) => console.log({ err }));
      //console.log(response)
      
      console.log(tags)
      /*
      if (tags){
        //console.log(tags)
        for (const currentTag of tags){
          //console.log(currentTag)
          const taggedResult = await client.models.Memory.create({
            tag: currentTag,
            name: 
            // change this to use id
          });
          //console.log(taggedResult)
        }
      }
      */

      const result = await client.models.Memory.create({
        name: mName,
        description: "",
        image: imageName,
        tags: tags,
        dateTaken: dateTaken,
        location: location,
      });

      if (result.data) {
        const newMemory = result.data;
        console.log(newMemory);
        if (newMemory.image){
          await uploadData({
            path: ({ identityId }) => `media/${identityId}/${newMemory.image}`,
            data: file,
          }).result;
        }
      }
      //const progress = Math.min(100, Math.random() * 100); // Simulated progress
      setPercentage((prevPercentage) => prevPercentage + (1 / files.length) * 100 );
    }
    //fetchMemories();
    //event.currentTarget.reset();
    //cT.reset();
    //setFiles([]);
    setPercentage(100);
  };

  const updateMemory = async (event: FormEvent<HTMLFormElement>) => {
    console.log("updating")
    event.preventDefault();
    const cT = event.currentTarget;
    const form = new FormData(cT);
    try{
      //const uNotes = await getNotesByName(form.get("name") as string);
      //const currentUpdate = await getMemoryById(currentMemory.id);

      // edit existing tags
      /*
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

          const { data } = await client.models.Memory.update(updateContent);
          
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
      */

      console.log("parent");
      console.log(currentMemory);
      
      const updateContent={
        id: currentMemory.id as string,
        name: form.get("name") as string,
        description: form.get("description") as string,
        address: form.get("location") as string,
        location: {lat: Number(form.get("locationLat")), long: Number(form.get("locationLong"))},
        tags: Object.keys(tagValues).filter(TagStatus => tagValues![TagStatus]),
        dateTaken: form.get("dateTaken") as string,
      }
      console.log(updateContent)

      const { data, errors } = await client.models.Memory.update(updateContent);
      console.log(data, errors)
      if (data) {
        setUpdateSuccess(true);
      }
      if (errors) {
        setError(errors);
      }
      
      // add new tags if any
      /*
      for (const [cTag, cTagState] of Object.entries(tagValues)) {
        console.log(cTag, cTagState);

        //console.log(parentMem.tags.include(cTag))
        console.log(currentMemory.tags)

        if ((!currentMemory.tags.includes(cTag)) && cTagState) {
          console.log("new row")
          console.log(cTag)
          const taggedResult = await client.models.Memory.create({tag: cTag, name: currentMemory.name});          
        }
      }
      */
    }
    catch (err) {
      console.error(err)
      setError("Caught other error fetching named memories")
    }
    
    fetchMemories();
    //checkMemoryName();
    cT.reset();
    
    onSelectFunc(currentMemory.id );

  };


  const deleteNotes = async(id: string) => {
    console.log("deleting")
    try{
      //const dMem = await getMemoryById(id);
      
      //console.log(typeof(data[0]))
      //console.log(typeof(data))
      /*
      for (const currentDelete of dMem){
        const toBeDeletedNote = {
          id: currentDelete.id as string,
        };
    
        const { data: deletedNote } = await client.models.Memory.delete(
          toBeDeletedNote
        );
        console.log(deletedNote);
      }
      */
      const { data: deletedMem } = await client.models.Memory.delete(
        {id: id}
      );
      console.log(deletedMem)
    }
    catch (err) {
      console.error(err)
      setError("Caught other error fetching named memories")
    }
    
    fetchMemories();
    setIsModalOpen(false);
    //checkMemoryName();
  }

  const getMemoryById = async (id: string) => {
    //const {setError } = useMemoryContext();
    //console.log(memoryName)
    console.log(id)
    const { data, errors } = await client.models.Memory.get({
      id: id,
    });

    console.log(data);
    /*
    const dNotes = await Promise.all(
      data.map(async (memory) => memory)
    )
    */
    
    console.log(data)

    if (errors) {
      console.log(errors);
      throw new Error("Error fetching memory with id");
    }
    return data
  };
  
  /*
  const getNotesByName = async (memoryName: string) => {
  //const {setError } = useMemoryContext();
    console.log(memoryName)
    const { data, errors } = await client.models.Memory.listNoteByNameAndCreatedAt({
      name: memoryName,
    });
    console.log(data);

    const dNotes = await Promise.all(
      data.map(async (memory) => memory)
    )
    console.log(dNotes)

    if (errors) {
      console.log(errors);
      throw new Error("Error fetching named memories");
    }
    return dNotes
  };
  */

  const fetchMemories = async () => {
    /*
    do {
      const { data: fetchedNotes, nextToken: newNextToken, errors } = await client.models.Note.list({
        limit: 50, 
        nextToken,
      });
      fetchedNotes = [...fetchedNotes, ...data];
      nextToken = newNextToken;
      
      console.log(nextToken)
      console.log(fetchedNotes)

    } while (nextToken);
    */
    
    //const { data: fetchedNotes } = await client.models.Note.list();
    const { data: fetchedNotes } = await client.models.Memory.list({limit: 10000});

    const updatedMemories = await Promise.all(
      fetchedNotes.map(async (memory) => {
        if (memory.image) {
          const linkToStorageFile = await getUrl({
            path: ({ identityId }) => `media/${identityId}/${memory.image}`,
          });
          console.log(linkToStorageFile.url);
          memory.image = (linkToStorageFile.url).toString();
        }
        return memory;
      })
    );
    
    const filteredNotes = updatedMemories.filter(memory => 
      memory.tags 
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

  const handleTagChange = (e: any) => {
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
  };

  /*
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
        setError("Error fetching tagged memories");
      }
      else{
        setTaggedMemories(data);
      }
    }
    catch (err) {
      console.error(err)
      setError("Caught other error fetching tagged memories")
    }
  }
  */

  async function onSelectFunc(id: string) {
    const clickedMem = await getMemoryById(id);
    
    const linkToStorageFile = await getUrl({
      path: ({ identityId }) => `media/${identityId}/${clickedMem!.image}`,
    });
    console.log(linkToStorageFile.url);
    clickedMem!.image = (linkToStorageFile.url).toString();
    setCurrentMemory(clickedMem);
  }

  return {
    createMemories,
    updateMemory,
    fetchMemories,
    deleteNotes,
    addTag,
    handleTagChange,
    onSelectFunc,
    client,
    onFilePickerChange,
    handleSubmit,
    resetStates
  };
}

