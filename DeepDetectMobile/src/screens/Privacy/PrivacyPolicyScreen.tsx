import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppStackParamList } from '../../route/AppNavigator';
import { useTheme } from '../../hooks/useTheme';
import { FONTFAMILY } from '../../constants/fontFamily';

type PrivacyPolicyNavigationProp = StackNavigationProp<AppStackParamList, 'PrivacyPolicyScreen'>;

type PrivacyPolicyScreenProps = {
  navigation: PrivacyPolicyNavigationProp;
};

const sections = [
  {
    title: 'Information We Collect',
    body: 'DeepDetect only processes images you voluntarily upload within the app. We do not store your images on our servers permanently. Images are sent securely to our detection API and discarded immediately after analysis.',
  },
  {
    title: 'How We Use Your Data',
    body: 'The images you upload are used solely to perform AI-detection analysis and return a result to you. We do not use your images for training or share them with third parties.',
  },
  {
    title: 'Data Security',
    body: 'All data transmission between the app and our API is encrypted using HTTPS/TLS. We take reasonable measures to protect your information from unauthorized access.',
  },
  {
    title: 'Third-Party Services',
    body: 'DeepDetect may integrate with third-party analytics tools to improve app performance. These services operate under their own privacy policies.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify you of any changes by updating the date at the top of this page.',
  },
  {
    title: 'Contact Us',
    body: 'If you have any questions about this Privacy Policy, please contact us through the Contact & Feedback option in Settings.',
  },
];

const PrivacyPolicyScreen = ({ navigation }: PrivacyPolicyScreenProps) => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.white }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.white} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.blueDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textdark }]}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.updated, { color: theme.textSecondary }]}>
          Last updated: May 2026
        </Text>

        <Text style={[styles.intro, { color: theme.textSecondary }]}>
          Your privacy is important to us. This policy explains how DeepDetect handles your information.
        </Text>

        {sections.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textdark }]}>{s.title}</Text>
            <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 18,
  },
  placeholder: { width: 32 },
  content: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 40,
  },
  updated: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 12,
    marginBottom: 12,
  },
  intro: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 16,
    marginBottom: 6,
  },
  sectionBody: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 14,
    lineHeight: 22,
  },
});
