import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AppContext, Currency } from '../src/AppContext';
import { Person, Transaction } from '../src/types';
import { formatCurrency } from '../src/utils';

type RootStackParamList = {
  Home: undefined;
  AddPerson: undefined;
  AddTransaction: { person: Person };
  Settings: undefined;
  TransactionHistory: { person: Person };
  EditTransaction: { transaction: Transaction; personName: string };
};

type TransactionHistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TransactionHistory'
>;
type TransactionHistoryScreenRouteProp = RouteProp<
  RootStackParamList,
  'TransactionHistory'
>;

const TransactionHistoryScreen: React.FC = () => {
  const { persons, updatePersonCurrency } = useContext(AppContext);
  const navigation = useNavigation<TransactionHistoryScreenNavigationProp>();
  const route = useRoute<TransactionHistoryScreenRouteProp>();
  const { person: routePerson } = route.params;

  // Get the latest person data from context instead of route params
  const person = persons.find(p => p.id === routePerson.id) || routePerson;

  // Sort transactions by date descending
  const sortedTransactions = [...person.transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const getRunningBalance = (
    transactions: Transaction[],
    currentIndex: number,
  ) => {
    let balance = 0;
    for (let i = 0; i <= currentIndex; i++) {
      const tx = transactions[i];
      if (tx.type === 'borrow') {
        balance += tx.amount;
      } else {
        balance -= tx.amount;
      }
    }
    return balance;
  };

  const renderTransaction = ({
    item,
    index,
  }: {
    item: Transaction;
    index: number;
  }) => {
    const runningBalance = getRunningBalance(sortedTransactions, index);

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionType}>
            {item.type === 'borrow' ? '📥 Borrowed' : '📤 Returned'}
          </Text>
          <Text style={styles.transactionDate}>
            {item.date.toLocaleDateString()} at{' '}
            {item.date.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <View style={styles.transactionRight}>
          <Text
            style={[
              styles.transactionAmount,
              item.type === 'borrow'
                ? styles.amountBorrowed
                : styles.amountReturned,
            ]}
          >
            {item.type === 'borrow' ? '+' : '-'}
            {formatCurrency(Math.abs(item.amount), person.currency)}
          </Text>
          <Text style={styles.runningBalance}>
            Balance: {formatCurrency(runningBalance, person.currency)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate('EditTransaction', {
              transaction: item,
              personName: person.name,
            })
          }
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const totalBorrowed = person.transactions
    .filter(tx => tx.type === 'borrow')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalReturned = person.transactions
    .filter(tx => tx.type === 'return')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const currentBalance = totalBorrowed - totalReturned;

  const handleCurrencyChange = async (newCurrency: Currency) => {
    try {
      await updatePersonCurrency(person.id, newCurrency);
      // Update the local person object
      person.currency = newCurrency;
    } catch (error) {
      Alert.alert('Error', 'Failed to update currency');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{person.name}'s Transaction History</Text>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Total Borrowed: {formatCurrency(totalBorrowed, person.currency)}
          </Text>
          <Text style={styles.summaryText}>
            Total Returned: {formatCurrency(totalReturned, person.currency)}
          </Text>
          <Text style={[styles.summaryText, styles.currentBalance]}>
            Current Balance: {formatCurrency(currentBalance, person.currency)}
          </Text>
        </View>

        {/* Currency Selector */}
        <View style={styles.currencySection}>
          <Text style={styles.currencyTitle}>Currency:</Text>
          <View style={styles.currencyButtons}>
            {(['USD', 'AED', 'INR'] as Currency[]).map(curr => (
              <TouchableOpacity
                key={curr}
                style={[
                  styles.currencyButton,
                  person.currency === curr && styles.currencyButtonSelected,
                ]}
                onPress={() => handleCurrencyChange(curr)}
              >
                <Text
                  style={[
                    styles.currencyButtonText,
                    person.currency === curr &&
                      styles.currencyButtonTextSelected,
                  ]}
                >
                  {curr === 'USD' && '$ USD'}
                  {curr === 'AED' && 'د.إ AED'}
                  {curr === 'INR' && '₹ INR'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <FlatList
        data={sortedTransactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add transactions
            </Text>
          </View>
        }
        contentContainerStyle={
          sortedTransactions.length === 0 ? styles.emptyList : undefined
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTransaction', { person })}
      >
        <Text style={styles.addButtonText}>Add Transaction</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  summary: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  currentBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 10,
    marginBottom: 0,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  amountBorrowed: {
    color: '#dc3545', // Red for borrowed (money going out)
  },
  amountReturned: {
    color: '#28a745', // Green for returned (money coming back)
  },
  runningBalance: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyList: {
    flex: 1,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currencySection: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  currencyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currencyButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  currencyButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  currencyButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  editButtonText: {
    fontSize: 16,
  },
});

export default TransactionHistoryScreen;
