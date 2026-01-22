import React, { useContext, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
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
  TransactionHistory: { person: Person };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

const HomeScreen: React.FC = () => {
  const { persons, currency, isLoading, updatePerson } = useContext(AppContext);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const lastTapRef = useRef<{ [key: string]: number }>({});

  const getBorrowedAmount = (person: Person) => {
    return person.transactions.reduce((total, transaction) => {
      return transaction.type === 'borrow'
        ? total + transaction.amount
        : total - transaction.amount;
    }, 0);
  };

  const handlePersonPress = (person: Person) => {
    const now = Date.now();
    const lastTap = lastTapRef.current[person.id] || 0;
    const DOUBLE_TAP_DELAY = 300; // ms

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      navigation.navigate('TransactionHistory', { person });
      delete lastTapRef.current[person.id]; // Reset
    } else {
      // Single tap - prepare for double tap
      lastTapRef.current[person.id] = now;
      // Auto-reset after delay
      setTimeout(() => {
        delete lastTapRef.current[person.id];
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handlePersonLongPress = (person: Person) => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Edit Person Name',
        `Current name: ${person.name}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: async (newName?: string) => {
              if (newName && newName.trim() !== person.name) {
                try {
                  await updatePerson(person.id, newName.trim());
                  Alert.alert('Success', 'Person name updated successfully');
                } catch (error) {
                  Alert.alert('Error', 'Failed to update person name');
                }
              }
            },
          },
        ],
        'plain-text',
        person.name,
      );
    } else {
      // For Android and other platforms, use a regular Alert with input
      Alert.alert('Edit Person Name', `Current name: ${person.name}`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Edit',
          onPress: () => {
            // For Android, we could implement a custom modal here
            // For now, just show a message
            Alert.alert(
              'Edit Feature',
              'Long press to edit names is optimized for iOS. Please use iOS for this feature.',
            );
          },
        },
      ]);
    }
  };

  const formattedBorrowedAmount = (person: Person) => {
    return formatCurrency(getBorrowedAmount(person), person.currency);
  };

  const renderPerson = ({ item }: { item: Person }) => (
    <TouchableOpacity
      style={styles.personItem}
      onPress={() => handlePersonPress(item)}
      onLongPress={() => handlePersonLongPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{item.name}</Text>
        <Text style={styles.borrowedAmount}>
          Borrowed: {formattedBorrowedAmount(item)}
        </Text>
        <Text style={styles.tapHint}>Double tap for transaction history</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={e => {
          e.stopPropagation(); // Prevent triggering parent onPress
          navigation.navigate('AddTransaction', { person: item });
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={persons}
        renderItem={renderPerson}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No persons added yet.</Text>
        }
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
  tapHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default HomeScreen;
