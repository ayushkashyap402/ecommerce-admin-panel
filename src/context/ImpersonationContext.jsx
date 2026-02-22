import React, { createContext, useContext, useState } from 'react';

const ImpersonationContext = createContext();

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error('useImpersonation must be used within ImpersonationProvider');
  }
  return context;
};

export const ImpersonationProvider = ({ children }) => {
  const [impersonatedAdmin, setImpersonatedAdmin] = useState(null);

  const startImpersonation = (admin) => {
    setImpersonatedAdmin(admin);
  };

  const stopImpersonation = () => {
    setImpersonatedAdmin(null);
  };

  const isImpersonating = !!impersonatedAdmin;

  return (
    <ImpersonationContext.Provider
      value={{
        impersonatedAdmin,
        isImpersonating,
        startImpersonation,
        stopImpersonation,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
};
