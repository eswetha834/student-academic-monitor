// Responsive utilities for input and container management

export const getResponsiveInputProps = (baseProps = {}) => {
  return {
    ...baseProps,
    style: {
      width: '100%',
      maxWidth: '400px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      ...baseProps.style
    }
  };
};

export const getResponsiveContainerProps = (baseProps = {}) => {
  return {
    ...baseProps,
    style: {
      maxWidth: '100vw',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      ...baseProps.style
    }
  };
};

export const getResponsiveTableProps = (baseProps = {}) => {
  return {
    ...baseProps,
    style: {
      width: '100%',
      maxWidth: '100%',
      tableLayout: 'fixed',
      overflowX: 'auto',
      ...baseProps.style
    }
  };
};

export const getSidebarAwareContainerProps = (sidebarOpen, baseProps = {}) => {
  const sidebarWidth = sidebarOpen ? 280 : 80;
  return {
    ...baseProps,
    style: {
      maxWidth: `calc(100vw - ${sidebarWidth}px)`,
      marginLeft: `${sidebarWidth}px`,
      overflowX: 'hidden',
      boxSizing: 'border-box',
      transition: 'margin-left 0.3s ease, max-width 0.3s ease',
      ...baseProps.style
    }
  };
};

// Hook for responsive input handling
export const useResponsiveInput = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const getInputMaxWidth = () => {
    if (windowWidth <= 768) return '100%';
    if (windowWidth <= 1024) return '300px';
    return '400px';
  };
  
  const getContainerMaxWidth = () => {
    if (windowWidth <= 768) return '100vw';
    return 'calc(100vw - 80px)';
  };
  
  return {
    windowWidth,
    getInputMaxWidth,
    getContainerMaxWidth,
    isMobile: windowWidth <= 768,
    isTablet: windowWidth > 768 && windowWidth <= 1024,
    isDesktop: windowWidth > 1024
  };
};

// CSS class names for responsive design
export const responsiveClasses = {
  container: 'responsive-container',
  input: 'responsive-input',
  table: 'responsive-table',
  sidebar: 'responsive-sidebar',
  mainContent: 'responsive-main-content'
};
