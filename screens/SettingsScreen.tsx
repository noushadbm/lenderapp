import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppContext, Currency } from '../src/AppContext';
import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

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
  const { currency, setCurrency, persons } = useContext(AppContext);
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [isExporting, setIsExporting] = React.useState(false);

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

  const exportToExcel = async () => {
    if (persons.length === 0) {
      Alert.alert('No Data', 'No persons or transactions to export.');
      return;
    }

    setIsExporting(true);
    try {
      console.log('Starting export process...');

      // Prepare data for Excel
      const exportData: any[] = [];

      // Add summary section
      exportData.push(['Lender App - Transaction Summary']);
      exportData.push(['Export Date:', new Date().toLocaleDateString()]);
      exportData.push(['Total Persons:', persons.length]);
      exportData.push([]);

      // Add persons and their transactions
      persons.forEach((person, index) => {
        // Calculate balance
        const balance = person.transactions.reduce((total, transaction) => {
          return transaction.type === 'borrow'
            ? total + transaction.amount
            : total - transaction.amount;
        }, 0);

        // Person header
        exportData.push([`Person ${index + 1}: ${person.name}`]);
        exportData.push(['Currency:', person.currency]);
        exportData.push(['Current Balance:', balance]);
        exportData.push([]);

        if (person.transactions.length > 0) {
          // Transactions header
          exportData.push(['Date', 'Type', 'Amount', 'Running Balance']);

          let runningBalance = 0;
          // Sort transactions by date
          const sortedTransactions = [...person.transactions].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );

          // Add transactions
          sortedTransactions.forEach(transaction => {
            runningBalance =
              transaction.type === 'borrow'
                ? runningBalance + transaction.amount
                : runningBalance - transaction.amount;

            exportData.push([
              new Date(transaction.date).toLocaleDateString(),
              transaction.type === 'borrow' ? 'Borrowed' : 'Returned',
              transaction.amount,
              runningBalance,
            ]);
          });
        } else {
          exportData.push(['No transactions found']);
        }

        exportData.push([]); // Empty row between persons
      });

      console.log('Data prepared, creating workbook...');

      // Create workbook and worksheet
      const ws = XLSX.utils.aoa_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

      // Generate Excel file - use base64 directly
      const excelBase64 = XLSX.write(wb, {
        type: 'base64',
        bookType: 'xlsx',
      });

      console.log('Excel base64 created, length:', excelBase64.length);

      // Save to temporary file
      const fileName = `LenderApp_Export_${
        new Date().toISOString().split('T')[0]
      }.xlsx`;
      const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;

      console.log('Writing file to:', filePath);

      await RNFS.writeFile(filePath, excelBase64, 'base64');

      // Verify file was created
      const fileInfo = await RNFS.stat(filePath);
      console.log('File created successfully, size:', fileInfo.size);

      // Share the file
      await Share.open({
        url: `file://${filePath}`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: fileName,
        title: 'Lender App Export',
        message: 'Exported transactions and balances from Lender App',
      });

      Alert.alert('Success', 'Excel file exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed',
        `Failed to export data: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      setIsExporting(false);
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

      <Text style={styles.subtitle}>Data Management</Text>
      <TouchableOpacity
        style={styles.exportButton}
        onPress={exportToExcel}
        disabled={isExporting}
      >
        {isExporting ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.exportButtonText}>📊 Export to Excel</Text>
        )}
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
  exportButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 18,
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
