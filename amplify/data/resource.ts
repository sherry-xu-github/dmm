/*import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  BedrockResponse: a.customType({
    body: a.string(),
    error: a.string(),
  }),

  askBedrock: a
    .query()
    .arguments({ ingredients: a.string().array() })
    .returns(a.ref("BedrockResponse"))
    .authorization((allow) => [allow.authenticated()])
    .handler(
      //sets up a custom handler for this query, defined in bedrock.js, using bedrockDS as its data source.
      a.handler.custom({ entry: "./bedrock.js", dataSource: "bedrockDS" })
    ),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
*/



import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Location: a.customType({
    lat: a.float(),
    long: a.float(),
  }),

  Memory: a.model({
    id: a.id(),

    name: a.string(),
    description: a.string(),
    tags: a.string().array(),

    image: a.string(),
    
    
    createdAt: a.string(),
    updatedAt: a.string(),
    dateTaken: a.string(),
    
    location: a.ref('Location'),
    
    // search patterns
    tag: a.string(),
    year: a.integer(),
    month: a.string()

    //11/12/2017, 4:24:00 PM 40.778950, -73.962053
    // amplify auto adds an "owner: a.string()" field that contains the owner's identity info upon note creation to each note
  })
  .secondaryIndexes((index) => [
    index("tag"),
    index("tag").sortKeys(["name", "description", "dateTaken"]),
    index("year"),
  ])
  .authorization((allow) => [allow.owner()]),
  // allow.owner(): a per-owner auth rule that restrics the memory's access to the owner of the note
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});









/*
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*
== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/

/*
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'iam',
  },
});


/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>


