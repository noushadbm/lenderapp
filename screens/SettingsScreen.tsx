import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppContext, Currency } from '../src/AppContext';

type RootStackParamList = {
  Home: undefined;
  AddPerson: undefined;
  AddTransaction: { person: any };
  TransactionHistory: { person: any };
  Settings: undefined;
};

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

const SettingsScreen: React.FC = () => {
  const { currency, setCurrency } = useContext(AppContext);
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const currencies: { key: Currency; label: string; symbol: string }[] = [
    { key: 'USD', label: 'US Dollar', symbol: '$' },
    { key: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
    { key: 'INR', label: 'Indian Rupee', symbol: '₹' },
  ];

  const handleCurrencySelect = async (selectedCurrency: Currency) => {
    try {
      await setCurrency(selectedCurrency);
      Alert.alert(
        'Success',
        `Currency changed to ${
          currencies.find(c => c.key === selectedCurrency)?.label
        }`,
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change currency. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Select Currency</Text>
      {currencies.map(curr => (
        <TouchableOpacity
          key={curr.key}
          style={[
            styles.currencyOption,
            currency === curr.key && styles.selectedCurrency,
          ]}
          onPress={() => handleCurrencySelect(curr.key)}
        >
          <Text
            style={[
              styles.currencyText,
              currency === curr.key && styles.selectedCurrencyText,
            ]}
          >
            {curr.symbol} {curr.label}
          </Text>
          {currency === curr.key && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      ))}
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
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#333',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    color: '#555',
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCurrency: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 1,
  },
  currencyText: {
    fontSize: 18,
    color: '#333',
  },
  selectedCurrencyText: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
  checkmark: {
    fontSize: 20,
    color: '#2196f3',
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#2196f3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
