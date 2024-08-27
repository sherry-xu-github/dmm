import React from 'react';

import { useParams } from 'react-router-dom';
import {MemoryItem} from './MemoryItem';

export default function EditMemoryPage() {
  const { id } = useParams();
  
  return (
    <div>
      <h1>Edit Memory</h1>
      <MemoryItem memoryId={id} />
    </div>
  );
}