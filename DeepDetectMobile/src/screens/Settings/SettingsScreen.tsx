import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { AppStackParamList } from '../../route/AppNavigator';
import { useTheme } from '../../hooks/useTheme';
import { toggleTheme } from '../../store/themeSlice';
import { RootState } from '../../store';
import { FONTFAMILY } from '../../constants/fontFamily';

type SettingsNavigationProp = StackNavigationProp<AppStackParamList, 'SettingsScreen'>;

type SettingsScreenProps = {
  navigation: SettingsNavigationProp;
};

const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  const handleToggleDark = () => {
    dispatch(toggleTheme());
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.white }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.white} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.blueDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textdark }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* History */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>History</Text>
        <View style={[styles.card, { backgroundColor: theme.whiteSoft, borderColor: theme.divider }]}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('HistoryScreen')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: theme.isDark ? '#0D1B2A' : theme.blueBackground }]}>
              <MaterialCommunityIcons name="history" size={22} color={theme.blueDark} />
            </View>
            <Text style={[styles.rowLabel, { color: theme.textdark }]}>Analysis History</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: theme.whiteSoft, borderColor: theme.divider }]}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: isDark ? '#1E2235' : theme.blueBackground }]}>
              <MaterialCommunityIcons
                name={isDark ? 'weather-night' : 'weather-sunny'}
                size={22}
                color={theme.blueDark}
              />
            </View>
            <Text style={[styles.rowLabel, { color: theme.textdark }]}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={handleToggleDark}
              trackColor={{ false: theme.divider, true: theme.blueDark }}
              thumbColor={isDark ? theme.greenAccent : theme.whitePure}
            />
          </View>
        </View>

        {/* Legal */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Legal</Text>
        <View style={[styles.card, { backgroundColor: theme.whiteSoft, borderColor: theme.divider }]}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('PrivacyPolicyScreen')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: theme.isDark ? '#071527' : '#EBF2FF' }]}>
              <MaterialCommunityIcons name="shield-lock-outline" size={22} color={theme.blueDark} />
            </View>
            <Text style={[styles.rowLabel, { color: theme.textdark }]}>Privacy Policy</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={theme.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: theme.divider }]} />

          {/* Contact & Feedback */}
      
        </View>

        {/* Coming Soon */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Coming Soon</Text>
        <View style={[styles.card, { backgroundColor: theme.whiteSoft, borderColor: theme.divider }]}>
          <View style={[styles.row, styles.disabled]}>
            <View style={[styles.iconWrap, { backgroundColor: theme.isDark ? '#1C1C2E' : theme.graySurface }]}>
              <MaterialCommunityIcons name="video-outline" size={22} color={theme.textDisabled} />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowLabel, { color: theme.textDisabled }]}>Video Detection</Text>
              <Text style={[styles.rowSub, { color: theme.textDisabled }]}>Coming in a future update</Text>
            </View>
            <View style={[styles.comingSoonBadge, { borderColor: theme.divider }]}>
              <Text style={[styles.comingSoonText, { color: theme.textDisabled }]}>Soon</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontFamily: FONTFAMILY.VivitaMedium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  rowLabel: {
    flex: 1,
    fontFamily: FONTFAMILY.VivitaMedium,
    fontSize: 15,
  },
  rowTextCol: {
    flex: 1,
  },
  rowSub: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 12,
    marginTop: 2,
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
  },
  disabled: {
    opacity: 0.55,
  },
  comingSoonBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  comingSoonText: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 11,
  },
});
