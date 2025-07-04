import React, { createContext, useContext, useState } from 'react';

export interface DataRefreshContextType {
  refreshData: boolean;
  setRefreshData: React.Dispatch<React.SetStateAction<boolean>>;
  refreshExpenses: boolean;
  setRefreshExpenses: React.Dispatch<React.SetStateAction<boolean>>;
  lastExpenseUpdate: number;
  setLastExpenseUpdate: React.Dispatch<React.SetStateAction<number>>;
  lastBudgetUpdate: number;
  setLastBudgetUpdate: React.Dispatch<React.SetStateAction<number>>;
  refreshBudgets: boolean; // <-- Add this line
  setRefreshBudgets: React.Dispatch<React.SetStateAction<boolean>>; // <-- Add this line
}

const DataRefreshContext = createContext<DataRefreshContextType | undefined>(undefined);

export const DataRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshData, setRefreshData] = useState(false);
  const [refreshExpenses, setRefreshExpenses] = useState(false);
  const [lastExpenseUpdate, setLastExpenseUpdate] = useState(Date.now());
  const [lastBudgetUpdate, setLastBudgetUpdate] = useState(Date.now());
  const [refreshBudgets, setRefreshBudgets] = useState(false); // <-- Add this line

  return (
    <DataRefreshContext.Provider
      value={{
        refreshData,
        setRefreshData,
        refreshExpenses,
        setRefreshExpenses,
        lastExpenseUpdate,
        setLastExpenseUpdate,
        lastBudgetUpdate,
        setLastBudgetUpdate,
        refreshBudgets, // <-- Add this line
        setRefreshBudgets, // <-- Add this line
      }}
    >
      {children}
    </DataRefreshContext.Provider>
  );
};

export const useDataRefresh = () => {
  const context = useContext(DataRefreshContext);
  if (!context) throw new Error('useDataRefresh must be used within a DataRefreshProvider');
  return context;
};