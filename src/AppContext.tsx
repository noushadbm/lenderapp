import React from 'react';
import { Person } from '../src/types';
import { databaseService } from './database';

export type Currency = 'USD' | 'AED' | 'INR';

interface AppContextType {
  persons: Person[];
  currency: Currency;
  isLoading: boolean;
  addPerson: (name: string) => Promise<void>;
  updatePerson: (personId: string, name: string) => Promise<void>;
  addTransaction: (
    personId: string,
    amount: number,
    type: 'borrow' | 'return',
    date?: Date,
  ) => Promise<void>;
  setCurrency: (currency: Currency) => Promise<void>;
  updatePersonCurrency: (personId: string, currency: Currency) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const AppContext = React.createContext<AppContextType>({
  persons: [],
  currency: 'USD',
  isLoading: true,
  addPerson: async () => {},
  updatePerson: async () => {},
  addTransaction: async () => {},
  setCurrency: async () => {},
  updatePersonCurrency: async () => {},
  refreshData: async () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [persons, setPersons] = React.useState<Person[]>([]);
  const [currency, setCurrencyState] = React.useState<Currency>('USD');
  const [isLoading, setIsLoading] = React.useState(true);

  // Initialize database and load data
  React.useEffect(() => {
    const initializeData = async () => {
      try {
        await databaseService.init();
        await loadData();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const loadData = async () => {
    try {
      const [personsData, currencyData] = await Promise.all([
        databaseService.getAllPersons(),
        databaseService.getCurrency(),
      ]);

      setPersons(personsData);
      setCurrencyState(currencyData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const addPerson = async (name: string) => {
    try {
      const newPerson = await databaseService.addPerson(name, currency);
      setPersons(prev => [newPerson, ...prev]); // Add to beginning for latest first
    } catch (error) {
      console.error('Failed to add person:', error);
      throw error;
    }
  };

  const addTransaction = async (
    personId: string,
    amount: number,
    type: 'borrow' | 'return',
    date?: Date,
  ) => {
    try {
      await databaseService.addTransaction(personId, amount, type, date);
      // Refresh data to get updated transactions
      await loadData();
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  };

  const setCurrency = async (currency: Currency) => {
    try {
      await databaseService.setCurrency(currency);
      setCurrencyState(currency);
    } catch (error) {
      console.error('Failed to set currency:', error);
      throw error;
    }
  };

  const updatePerson = async (personId: string, name: string) => {
    try {
      // Update in database - we'll need to add this method
      await databaseService.updatePersonName(personId, name);
      // Update the person in state
      setPersons(prev =>
        prev.map(person =>
          person.id === personId ? { ...person, name } : person,
        ),
      );
    } catch (error) {
      console.error('Failed to update person:', error);
      throw error;
    }
  };

  const updatePersonCurrency = async (personId: string, currency: Currency) => {
    try {
      await databaseService.updatePersonCurrency(personId, currency);
      // Update the person in state
      setPersons(prev =>
        prev.map(person =>
          person.id === personId ? { ...person, currency } : person,
        ),
      );
    } catch (error) {
      console.error('Failed to update person currency:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <AppContext.Provider
      value={{
        persons,
        currency,
        isLoading,
        addPerson,
        updatePerson,
        addTransaction,
        setCurrency,
        updatePersonCurrency,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
