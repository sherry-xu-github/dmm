import { Link } from 'react-router-dom';
import { Authenticator, Flex, Button, Menu } from '@aws-amplify/ui-react';
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { Outlet } from "react-router-dom";
import { MemoryProvider } from './context/MemoryContext';

window.global = window;

Amplify.configure(outputs);

Amplify.configure({
  ...Amplify.getConfig(),
  Predictions: outputs.custom.Predictions,
});

export default function App() {
  

  return (
    <Authenticator>
    {({ signOut }) => (
      <>
        <MemoryProvider>
          <Flex
            //as="nav"
            //direction="row"
            justifyContent="space-between"
            alignItems="center"
            padding="0.5rem"
            //backgroundColor="var(--amplify-colors-blue-80)"
          >
            <Menu
              menuAlign="start"
            >
              <Button variation="link" as={Link} to="/create">Create</Button>
              <Button variation="link" as={Link} to="/gallery">Gallery</Button>
              <Button variation="link" as={Link} to="/search">Search</Button>
              <Button onClick={signOut}>Sign Out</Button>
            </Menu>

          </Flex>
          <Outlet />

        </MemoryProvider>

      </>      
    )}
    </Authenticator>
  );
}