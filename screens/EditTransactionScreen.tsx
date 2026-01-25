import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AppContext } from '../src/AppContext';
import { Transaction } from '../src/types';

type RootStackParamList = {
  Home: undefined;
  AddPerson: undefined;
  AddTransaction: { person: any };
  TransactionHistory: { person: any };
  EditTransaction: { transaction: Transaction; personName: string };
  Settings: undefined;
};

type EditTransactionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditTransaction'
>;
type EditTransactionScreenRouteProp = RouteProp<
  RootStackParamList,
  'EditTransaction'
>;

const EditTransactionScreen: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'borrow' | 'return'>('borrow');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { updateTransaction, deleteTransaction } = useContext(AppContext);
  const navigation = useNavigation<EditTransactionScreenNavigationProp>();
  const route = useRoute<EditTransactionScreenRouteProp>();
  const { transaction, personName } = route.params;

  // Initialize form with existing transaction data
  React.useEffect(() => {
    setAmount(transaction.amount.toString());
    setType(transaction.type);
    setDate(new Date(transaction.date));
  }, [transaction]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios' ? false : false);
    setDate(currentDate);
  };

  const handleUpdateTransaction = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      await updateTransaction(transaction.id, numAmount, type, date);
      navigation.goBack();
      Alert.alert('Success', 'Transaction updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteTransaction(transaction.id);
              navigation.goBack();
              Alert.alert('Success', 'Transaction deleted successfully');
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to delete transaction. Please try again.',
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Edit Transaction for {personName}</Text>

        <Text style={styles.label}>Amount:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          blurOnSubmit={true}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />

        <Text style={styles.label}>Transaction Date:</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <Text style={styles.label}>Transaction Type:</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'borrow' && styles.selectedType,
            ]}
            onPress={() => setType('borrow')}
          >
            <Text
              style={[
                styles.typeText,
                type === 'borrow' && styles.selectedTypeText,
              ]}
            >
              Borrow
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'return' && styles.selectedType,
            ]}
            onPress={() => setType('return')}
          >
            <Text
              style={[
                styles.typeText,
                type === 'return' && styles.selectedTypeText,
              ]}
            >
              Return
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            styles.updateButton,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleUpdateTransaction}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Updating...' : 'Update Transaction'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.deleteButton,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleDeleteTransaction}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, styles.deleteButtonText]}>
            Delete Transaction
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedType: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeText: {
    fontSize: 16,
  },
  selectedTypeText: {
    color: 'white',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  updateButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: 'white',
  },
  cancelButton: {
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default EditTransactionScreen;
