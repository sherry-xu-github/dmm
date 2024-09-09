import { getUrl } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import { Schema } from "../../amplify/data/resource";
import { useEffect } from "react";
import { useMemoryContext } from "../context/MemoryContext";
import outputs from "../../amplify_outputs.json";
import nlp from 'compromise';
import plg from 'compromise-dates'

Amplify.configure(outputs);
Amplify.configure({
  ...Amplify.getConfig(),
  Predictions: outputs.custom.Predictions,
});

const client = generateClient<Schema>({
  authMode: "userPool",
});

export const useMemorySearch = () => {
  const { 
    setSearchString,
    searchString,
    keywords, setKeywords,
    timeRange, setTimeRange,
    filteredMemories, setFilteredMemories,
    setFilteredImages,
    address, setAddress,
  } = useMemoryContext();

  useEffect(() => {
    if (timeRange!.length !== 0 || keywords!.length !== 0) {
      searchMemoryByKeywordsAndTimeRange()
    }
  }, [timeRange, keywords]);
  
  useEffect(() => {
    if (filteredMemories!.length !== 0) {
      fetchFilteredMemories()}
  }, [filteredMemories]);

  useEffect(() => {
    if (address) {
      const handleGeocode = async () => {
        //const position = await geocodeLocation(location);
        //setCoordinates(position);
      };
      handleGeocode();
    }
  }, [address]);
  
  const onChange = (event: any) => {
    setSearchString(event.target.value);
  };

  const onClear = () => {
    setSearchString('');
    setTimeRange([]);
    setKeywords([]);
    setFilteredMemories([]);
    setFilteredImages([]);
  };
  
  const handleSearch = () => {
    setFilteredMemories([]);
    setFilteredImages([]);
    extractKeyWords(searchString);
    console.log('extraction done');
  };

  const extractKeyWords = (currentSearchString: string) => {
    console.log(currentSearchString)
    nlp.plugin(plg)

    //const sentence = "Show me photos of cats from 1980 to 1990";
    const sentence = currentSearchString;

    // Step 1: Extract keywords and dates using Compromise
    const doc = nlp(sentence);

    //const ckeywords = doc.terms().filter(term => term.tags.includes('Singular')).out('array');
    //const ckeywords = doc.nouns().toTitleCase().out('array')
    const ckeywords = doc.nouns().toSingular().toTitleCase().out('array')
    .flatMap((noun: string) => noun.split(' '))
    .filter((word: string) => !['A', 'Above', 'And', 'Of', 'The'].includes(word)); 

    const doc2 = nlp(sentence);
    const ckeywords2 = doc2.nouns().toPlural().toTitleCase().out('array')
    .flatMap((noun: string) => noun.split(' '))
    .filter((word: string) => !['A', 'Above', 'And', 'Of', 'The'].includes(word)); 

    const ckeywords3 = doc.verbs().toTitleCase().out('array')
    const ckeywords4 = doc.all().toTitleCase().out('array')
    .filter((word: string) => !['A', 'Above', 'And', 'Of', 'The'].includes(word));

    console.log(`keywords to singular: ${ckeywords}`)
    console.log(`keywords to plural: ${ckeywords2}`)
    console.log(`keywords to title case: ${ckeywords3}`)
    console.log(`keywords to keywords: ${ckeywords4}`)
    
    if (ckeywords.length == 0){
      ckeywords.push(...ckeywords3, ...ckeywords4)
    }
    else {
      ckeywords2.forEach((word: string) => {
        if (!ckeywords.includes(word)) {
          ckeywords.push(word);
        }
    });
    }
    
    console.log(`keywords from input final: ${ckeywords}`)
    setKeywords(ckeywords)
    
    // Extract date ranges
    //const newString = doc.dates().format('{year}-{month-pad}-{date-pad}').all().text();
    //console.log(newString)

    const dates = (doc as any).dates().json();
    //doc.dates().format('{year}-{month-pad}-{date-pad}').all().text()
    console.log(`time string from input: ${dates}`)

    // Extract start and end dates from the range
    let startDate, endDate;
    if (dates.length > 0) {
      startDate = dates[0].dates.start || null;
      endDate = dates[0].dates.end || null;      
      console.log(dates[0])

      const formattedStartDate = startDate.slice(0, -6) + "Z";
      const formattedEndDate = endDate.slice(0, -6) + "Z";
      
      console.log(formattedStartDate, formattedEndDate)
      //console.log(doc.dates().format('{month} {date-ordinal} {year}').all().text())
      setTimeRange([formattedStartDate, formattedEndDate])
      //console.log(timeRange)
    }

    const locations = (doc as any).places().out('array');
    const addresses = doc.match('#Value+ #Noun+').out('array');
    console.log(`Locations: ${locations}`)
    console.log(`Addresses: ${addresses}`)
    if (addresses.length > 0) {
      setAddress(addresses)
    }
    else if (locations.length > 0) {
      setAddress(locations)
      const newKeywords = [...ckeywords, ...locations]
      console.log(newKeywords)
      setKeywords(newKeywords)
    }
  }

  const searchMemoryByKeywordsAndTimeRange = async () => {
    console.log(`debug keywords: ${keywords}`)
    console.log(`debug timeRange: ${timeRange}`)
    console.log(`debug address: ${address}`)

    const combinedNameOr = []
    const combinedDateOr = []

    if (keywords!.length !== 0) {
      const nameKeywordsMatch = keywords!.map((keyword) => ({
        name: { contains: keyword }
      }));
  
      const tagsKeywordsMatch = keywords!.map((keyword) => ({
        tags: { contains: keyword },
      }));
  
      const descriptionKeywordsMatch = keywords!.map((keyword) => ({
        description: { contains: keyword },
      }));

      const addressKeywordsMatch = keywords!.map((keyword) => ({
        address: { contains: keyword }
      }));
      combinedNameOr.push(...nameKeywordsMatch, ...tagsKeywordsMatch, ...descriptionKeywordsMatch, ...addressKeywordsMatch)
      console.log(combinedNameOr)
    }

    if (timeRange!.length !== 0) {
      const dateTakenTimeRangeMatch = {
        dateTaken: {
          ge: timeRange![0],
          le: timeRange![1],
        },
      };
  
  
      const nameTimeRangeMatch = timeRange!.map((timeStamp) => ({
        name: { contains: timeStamp },
      }));
  
      const DescriptionTimeRangeMatch = timeRange!.map((timeStamp) => ({
        description: { contains: timeStamp },
      }));
      combinedDateOr.push(dateTakenTimeRangeMatch, ...nameTimeRangeMatch, ...DescriptionTimeRangeMatch)
      console.log(combinedDateOr)

    }
    
    if (keywords!.length !== 0 && timeRange!.length !== 0) {
      const { data, errors } = await client.models.Memory.list({
        filter: {
          and: 
          [
            {
              or : combinedNameOr
            },
            {
              or : combinedDateOr
            },
          ]
        }
      });
      console.log(data, errors)
      setFilteredMemories(data)
    }
    
    else{
      if (keywords!.length !== 0) {
        const { data, errors } = await client.models.Memory.list({
          filter: {  
            or : combinedNameOr
          }
        });
        console.log(data, errors)
        setFilteredMemories(data)
      }
      if (timeRange!.length !== 0) {
        const { data, errors } = await client.models.Memory.list({
          filter: {  
            or : combinedDateOr
          }
        });
        console.log(data, errors)
        setFilteredMemories(data)
      }
    } 

    /*
    for (const kw in keyWords) {
      const { data, errors } = await client.models.Memory.listMemoryByTagAndNameAndDescriptionAndDateTaken({
        tag: kw,
        name: ,
      });
    }
    */
    
  }

  const fetchFilteredMemories = async () => {
    const updatedMemories = await Promise.all(
      filteredMemories.map(async (memory: any) => {
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
    console.log(updatedMemories);
    setFilteredImages(updatedMemories);
  }

  return {
    extractKeyWords,
    onChange,
    onClear,
    handleSearch,
  }
}