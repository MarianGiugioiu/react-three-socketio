import React, { useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext';
import styled, { css } from 'styled-components';
import { useSocket } from '../contexts/SocketContext';
import ExampleComponent from '../components/ExampleComponent';

const MainLayout = () => {

  useEffect(() => {
    
  }, [])
  
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ExampleComponent />
    </div>
  )
}

export default MainLayout