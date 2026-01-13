import React from 'react';
import { Person } from '../src/types';

export type Currency = 'USD' | 'AED' | 'INR';

interface AppContextType {
  persons: Person[];
  currency: Currency;
  addPerson: (name: string) => void;
  addTransaction: (personId: string, amount: number, type: 'borrow' | 'return', date?: Date) => void;
  setCurrency: (currency: Currency) => void;
}

export const AppContext = React.createContext<AppContextType>({
  persons: [],
  addPerson: () => {},
  addTransaction: () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persons, setPersons] = React.useState<Person[]>([]);
  const [currency, setCurrency] = React.useState<Currency>('USD');

  const addPerson = (name: string) => {
    const newPerson: Person = {
      id: Date.now().toString(),
      name,
      transactions: [],
    };
    setPersons(prev => [...prev, newPerson]);
  };

  const addTransaction = (personId: string, amount: number, type: 'borrow' | 'return', date?: Date) => {
    setPersons(prev =>
      prev.map(person =>
        person.id === personId
          ? {
              ...person,
              transactions: [
                ...person.transactions,
                {
                  id: Date.now().toString(),
                  amount,
                  type,
                  date: date || new Date(),
                },
              ],
            }
          : person
      )
    );
  };

  return (
    <AppContext.Provider value={{ persons, currency, addPerson, addTransaction, setCurrency }}>
      {children}
    </AppContext.Provider>
  );
};