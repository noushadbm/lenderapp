import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppContext } from '../src/AppContext';
import { Person } from '../src/types';
import { formatCurrency } from '../src/utils';

type RootStackParamList = {
  Home: undefined;
  AddPerson: undefined;
  AddTransaction: { person: Person };
  Settings: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const { persons, currency } = useContext(AppContext);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const getBorrowedAmount = (person: Person) => {
    return person.transactions.reduce((total, transaction) => {
      return transaction.type === 'borrow' ? total + transaction.amount : total - transaction.amount;
    }, 0);
  };

  const formattedBorrowedAmount = (person: Person) => {
    return formatCurrency(getBorrowedAmount(person), currency);
  };

  const renderPerson = ({ item }: { item: Person }) => (
    <View style={styles.personItem}>
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{item.name}</Text>
        <Text style={styles.borrowedAmount}>Borrowed: {formattedBorrowedAmount(item)}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTransaction', { person: item })}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={persons}
        renderItem={renderPerson}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No persons added yet.</Text>}
      />
      <TouchableOpacity
        style={styles.addPersonButton}
        onPress={() => navigation.navigate('AddPerson')}
      >
        <Text style={styles.addPersonButtonText}>Add New Person</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  personItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  borrowedAmount: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addPersonButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addPersonButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
});

export default HomeScreen;