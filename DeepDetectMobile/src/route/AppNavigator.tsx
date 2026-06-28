import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SCREENS } from '../constants/screen';
import { DetectionResult } from '../services/apiService';

export type AppStackParamList = {
  SplashScreen: undefined;
  OnboardingScreen: undefined;
  HomeScreen: undefined;
  AnalyzingScreen: {
    imageUri: string;
    fileName?: string;
    fileType?: string;
  };
  ResultScreen: {
    imageUri: string;
    result: DetectionResult;
  };
  ShareScreen: {
    prediction: string;
    confidence: number;
    imageUri: string;
  };
  SettingsScreen: undefined;
  PrivacyPolicyScreen: undefined;
  HistoryScreen: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();
const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="SplashScreen" component={SCREENS.SplashScreen} />
      <Stack.Screen name="OnboardingScreen" component={SCREENS.OnboardingScreen} />
      <Stack.Screen name="HomeScreen" component={SCREENS.HomeScreen} />
      <Stack.Screen name="AnalyzingScreen" component={SCREENS.AnalyzingScreen} />
      <Stack.Screen name="ResultScreen" component={SCREENS.ResultScreen} />
      <Stack.Screen name="ShareScreen" component={SCREENS.ShareScreen} />
      <Stack.Screen name="SettingsScreen" component={SCREENS.SettingsScreen} />
      <Stack.Screen name="PrivacyPolicyScreen" component={SCREENS.PrivacyPolicyScreen} />
      <Stack.Screen name="HistoryScreen" component={SCREENS.HistoryScreen} />
    </Stack.Navigator>
    
  );
};
export default AppNavigator;
