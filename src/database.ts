import SQLite from 'react-native-sqlite-storage';
import { Person, Transaction } from './types';
import { Currency } from './AppContext';

SQLite.enablePromise(true);

// Database name
const DB_NAME = 'lenderapp.db';

// Table names
const TABLES = {
  PERSONS: 'persons',
  TRANSACTIONS: 'transactions',
  SETTINGS: 'settings',
};

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: DB_NAME,
        location: 'default',
      });

      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create persons table
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS ${TABLES.PERSONS} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if currency column exists, if not add it
    await this.addCurrencyColumnIfNotExists();

    // Migrate existing persons to have default currency
    await this.migrateExistingPersonsCurrency();
  }

  private async addCurrencyColumnIfNotExists(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Try to add the currency column if it doesn't exist
      await this.db.executeSql(`
        ALTER TABLE ${TABLES.PERSONS} ADD COLUMN currency TEXT DEFAULT 'USD'
      `);
    } catch (error) {
      // Column might already exist, ignore error
      console.log('Currency column already exists or could not be added');
    }
  }

  private async migrateExistingPersonsCurrency(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Update any persons with null or empty currency to 'USD'
      await this.db.executeSql(`
        UPDATE ${TABLES.PERSONS}
        SET currency = 'USD'
        WHERE currency IS NULL OR currency = ''
      `);
    } catch (error) {
      console.log('Migration failed or not needed:', error);
    }

    // Create transactions table
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS ${TABLES.TRANSACTIONS} (
        id TEXT PRIMARY KEY,
        person_id TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('borrow', 'return')),
        date DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (person_id) REFERENCES ${TABLES.PERSONS} (id) ON DELETE CASCADE
      )
    `);

    // Create settings table
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS ${TABLES.SETTINGS} (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
  }

  // Person operations
  async getAllPersons(): Promise<Person[]> {
    if (!this.db) throw new Error('Database not initialized');

    // First get all persons
    const [personResults] = await this.db.executeSql(
      `SELECT * FROM ${TABLES.PERSONS} ORDER BY created_at DESC`,
    );

    // Then get all transactions
    const [transactionResults] = await this.db.executeSql(
      `SELECT * FROM ${TABLES.TRANSACTIONS} ORDER BY date DESC`,
    );

    // Group transactions by person_id
    const transactionsByPerson: { [personId: string]: any[] } = {};
    for (let i = 0; i < transactionResults.rows.length; i++) {
      const tx = transactionResults.rows.item(i);
      const personId = tx.person_id;
      if (!transactionsByPerson[personId]) {
        transactionsByPerson[personId] = [];
      }
      transactionsByPerson[personId].push({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        date: new Date(tx.date),
      });
    }

    // Combine persons with their transactions
    const persons: Person[] = [];
    for (let i = 0; i < personResults.rows.length; i++) {
      const personRow = personResults.rows.item(i);
      const person: Person = {
        id: personRow.id,
        name: personRow.name,
        currency: (personRow.currency as Currency) || 'USD', // Default to USD if null
        transactions: transactionsByPerson[personRow.id] || [],
      };
      persons.push(person);
    }

    return persons;
  }

  async addPerson(name: string, currency: Currency = 'USD'): Promise<Person> {
    if (!this.db) throw new Error('Database not initialized');

    const id = Date.now().toString();
    const person: Person = {
      id,
      name,
      currency,
      transactions: [],
    };

    await this.db.executeSql(
      `INSERT INTO ${TABLES.PERSONS} (id, name, currency) VALUES (?, ?, ?)`,
      [id, name, currency],
    );

    return person;
  }

  async deletePerson(personId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(`DELETE FROM ${TABLES.PERSONS} WHERE id = ?`, [
      personId,
    ]);
    // Transactions will be deleted automatically due to CASCADE constraint
  }

  async updatePersonCurrency(
    personId: string,
    currency: Currency,
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(
      `UPDATE ${TABLES.PERSONS} SET currency = ? WHERE id = ?`,
      [currency, personId],
    );
  }

  async updatePersonName(personId: string, name: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(
      `UPDATE ${TABLES.PERSONS} SET name = ? WHERE id = ?`,
      [name, personId],
    );
  }

  // Transaction operations
  async addTransaction(
    personId: string,
    amount: number,
    type: 'borrow' | 'return',
    date?: Date,
  ): Promise<Transaction> {
    if (!this.db) throw new Error('Database not initialized');

    const id = Date.now().toString();
    const transactionDate = date || new Date();

    const transaction: Transaction = {
      id,
      amount,
      type,
      date: transactionDate,
    };

    await this.db.executeSql(
      `INSERT INTO ${TABLES.TRANSACTIONS} (id, person_id, amount, type, date) VALUES (?, ?, ?, ?, ?)`,
      [id, personId, amount, type, transactionDate.toISOString()],
    );

    return transaction;
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(
      `DELETE FROM ${TABLES.TRANSACTIONS} WHERE id = ?`,
      [transactionId],
    );
  }

  // Settings operations
  async getCurrency(): Promise<Currency> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const [results] = await this.db.executeSql(
        `SELECT value FROM ${TABLES.SETTINGS} WHERE key = 'currency'`,
      );

      if (results.rows.length > 0) {
        return results.rows.item(0).value as Currency;
      }
    } catch (error) {
      // Settings table might not exist yet or no currency set
    }

    return 'USD'; // Default currency
  }

  async setCurrency(currency: Currency): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(
      `INSERT OR REPLACE INTO ${TABLES.SETTINGS} (key, value) VALUES ('currency', ?)`,
      [currency],
    );
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(`DELETE FROM ${TABLES.TRANSACTIONS}`);
    await this.db.executeSql(`DELETE FROM ${TABLES.PERSONS}`);
    await this.db.executeSql(`DELETE FROM ${TABLES.SETTINGS}`);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export const databaseService = new DatabaseService();
