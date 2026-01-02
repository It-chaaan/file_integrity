import React, { createContext, useContext, useState, useEffect } from 'react';

const RegistryContext = createContext();

export const useRegistry = () => {
  const context = useContext(RegistryContext);
  if (!context) {
    throw new Error('useRegistry must be used within RegistryProvider');
  }
  return context;
};

export const RegistryProvider = ({ children }) => {
  const [registry, setRegistry] = useState([]);

  useEffect(() => {
    // Load registry from localStorage on mount
    loadRegistryFromStorage();
  }, []);

  const loadRegistryFromStorage = () => {
    try {
      const raw = localStorage.getItem('parity_registry');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRegistry(parsed.map(p => ({
            name: p.name,
            hash: p.hash,
            type: p.type,
            reference: p.reference,
            signedBy: p.signedBy,
            timestamp: p.timestamp,
            file: null // Files are not persisted
          })));
        }
      }
    } catch (err) {
      console.error('Failed to load registry:', err);
    }
  };

  const saveRegistryToStorage = (updatedRegistry) => {
    try {
      const copy = updatedRegistry.map(e => ({
        name: e.name,
        hash: e.hash,
        type: e.type,
        reference: e.reference,
        signedBy: e.signedBy,
        timestamp: e.timestamp
      }));
      localStorage.setItem('parity_registry', JSON.stringify(copy));
    } catch (err) {
      console.error('Failed to save registry:', err);
    }
  };

  const addEntry = (entry) => {
    const newRegistry = [...registry, entry];
    setRegistry(newRegistry);
    saveRegistryToStorage(newRegistry);
  };

  const removeEntry = (index) => {
    const newRegistry = registry.filter((_, i) => i !== index);
    setRegistry(newRegistry);
    saveRegistryToStorage(newRegistry);
  };

  const getEntry = (index) => {
    return registry[index] || null;
  };

  const findByHash = (hash) => {
    return registry.find(e => e.hash === hash);
  };

  const value = {
    registry,
    addEntry,
    removeEntry,
    getEntry,
    findByHash
  };

  return (
    <RegistryContext.Provider value={value}>
      {children}
    </RegistryContext.Provider>
  );
};