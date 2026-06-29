import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/route/AppNavigator';
import 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { signInGuest } from './src/services/auth';

function App() {
  useEffect(() => {
    signInGuest();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;