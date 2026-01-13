import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AppContext } from '../src/AppContext';
import { Person } from '../src/types';

type RootStackParamList = {
  Home: undefined;
  AddPerson: undefined;
  AddTransaction: { person: Person };
  Settings: undefined;
};

type AddTransactionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddTransaction'>;
type AddTransactionScreenRouteProp = RouteProp<RootStackParamList, 'AddTransaction'>;

const AddTransactionScreen: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'borrow' | 'return'>('borrow');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { addTransaction } = useContext(AppContext);
  const navigation = useNavigation<AddTransactionScreenNavigationProp>();
  const route = useRoute<AddTransactionScreenRouteProp>();
  const { person } = route.params;

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios' ? false : false);
    setDate(currentDate);
  };

  const handleAddTransaction = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    addTransaction(person.id, numAmount, type, date);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Transaction for {person.name}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Transaction Date:</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
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
          style={[styles.typeButton, type === 'borrow' && styles.selectedType]}
          onPress={() => setType('borrow')}
        >
          <Text style={[styles.typeText, type === 'borrow' && styles.selectedTypeText]}>Borrow</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'return' && styles.selectedType]}
          onPress={() => setType('return')}
        >
          <Text style={[styles.typeText, type === 'return' && styles.selectedTypeText]}>Return</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleAddTransaction}>
        <Text style={styles.buttonText}>Add Transaction</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
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
  label: {
    fontSize: 18,
    marginBottom: 8,
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
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default AddTransactionScreen;