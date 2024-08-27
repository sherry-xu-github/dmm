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
            <Link to="/create">
              <Button variation="link">Create</Button>
            </Link>
            <Link to="/gallery">
                <Button variation="link">Gallery</Button>
            </Link>
            <Link to="/item">
                <Button variation="link">Item</Button>
            </Link>
            <Link to="/profile">
                <Button variation="link">Profile</Button>
            </Link>
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