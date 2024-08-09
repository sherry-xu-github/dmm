import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  // bucket name, and amplify generates the uuid
  name: "amplifyNotesDrive",

  // defines access rules (by default, no users or other project resources have access to this bucket)
  // returns an object
  access: (allow) => ({
    
    // file path
    // entity_id: a reserved token that will be replaced with the users' identifier when the file is being uploaded
    "media/{entity_id}/*": [

      // list of access rules for this file path
      // only the person who uploads the image can access    
      allow.entity("identity").to(["read", "write", "delete"]),
    ],

    // more file path and rules go here
  }),
});