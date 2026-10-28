import React from 'react';
import {createRoot} from 'react-dom/client';
import '@puckeditor/core/puck.css';
import '@add-cms/core/editor.css';
import '@add-cms/core/canvas.css';
import Editor from './Editor';
createRoot(document.getElementById('fixture-editor')!).render(<Editor/>);
