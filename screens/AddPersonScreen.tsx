import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppContext } from '../src/AppContext';

type RootStackParamList = {
  Home: undefined;
  AddPerson: undefined;
  AddTransaction: { person: any };
  Settings: undefined;
};

type AddPersonScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddPerson'>;

const AddPersonScreen: React.FC = () => {
  const [name, setName] = useState('');
  const { addPerson } = useContext(AppContext);
  const navigation = useNavigation<AddPersonScreenNavigationProp>();

  const handleAddPerson = () => {
    if (name.trim()) {
      addPerson(name.trim());
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Please enter a name');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Person</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter person's name"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddPerson}>
        <Text style={styles.buttonText}>Add Person</Text>
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

export default AddPersonScreen;