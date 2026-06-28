import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNShare from 'react-native-share';
import { AppStackParamList } from '../../route/AppNavigator';
import { useTheme } from '../../hooks/useTheme';
import { FONTFAMILY } from '../../constants/fontFamily';

type ShareScreenNavigationProp = StackNavigationProp<AppStackParamList, 'ShareScreen'>;
type ShareScreenRouteProp = RouteProp<AppStackParamList, 'ShareScreen'>;

type ShareScreenProps = {
  navigation: ShareScreenNavigationProp;
  route: ShareScreenRouteProp;
};

const ShareScreen = ({ navigation, route }: ShareScreenProps) => {
  const theme = useTheme();
  const { prediction, confidence, imageUri } = route.params;

  const shareText = `I just checked an image with DeepDetect! 🔍\nResult: ${prediction === 'ai' ? 'AI Generated' : 'Real Image'} (${confidence}% confidence)\nTry it yourself!`;

  const shareToWhatsApp = async () => {
    try {
      await RNShare.shareSingle({
        title: 'DeepDetect Result',
        message: shareText,
        url: imageUri,
        social: RNShare.Social.WHATSAPP,
      });
    } catch {
      Alert.alert('Error', 'Could not share to WhatsApp. Make sure it is installed.');
    }
  };

  const shareToTwitter = async () => {
    try {
      await RNShare.shareSingle({
        title: 'DeepDetect Result',
        message: shareText,
        url: imageUri,
        social: RNShare.Social.TWITTER,
      });
    } catch {
      Alert.alert('Error', 'Could not share to Twitter/X. Make sure it is installed.');
    }
  };

  const shareToFacebook = async () => {
    try {
      await RNShare.shareSingle({
        title: 'DeepDetect Result',
        url: imageUri,
        social: RNShare.Social.FACEBOOK,
      });
    } catch {
      Alert.alert('Error', 'Could not share to Facebook. Make sure it is installed.');
    }
  };

  const platforms = [
    {
      label: 'WhatsApp',
      icon: 'whatsapp',
      color: '#25D366',
      bg: '#E8FFF0',
      bgDark: '#0A2F17',
      onPress: shareToWhatsApp,
    },
    {
      label: 'Twitter / X',
      icon: 'twitter',
      color: '#1DA1F2',
      bg: '#E8F5FE',
      bgDark: '#051A2E',
      onPress: shareToTwitter,
    },
    {
      label: 'Facebook',
      icon: 'facebook',
      color: '#1877F2',
      bg: '#EBF2FF',
      bgDark: '#071527',
      onPress: shareToFacebook,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.white }]}>
      <StatusBar
        barStyle={theme.statusBar}
        backgroundColor={theme.white}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.blueDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textdark }]}>Share Result</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Result badge */}
        <View style={[styles.badge, { backgroundColor: theme.blueBackground }]}>
          <MaterialCommunityIcons
            name={prediction === 'ai' ? 'robot' : 'check-circle'}
            size={40}
            color={prediction === 'ai' ? theme.red : theme.greenMuted}
          />
          <Text style={[styles.badgeLabel, { color: theme.textdark }]}>
            {prediction === 'ai' ? 'AI Generated' : 'Real Image'}
          </Text>
          <Text style={[styles.badgeConfidence, { color: theme.textSecondary }]}>
            {confidence}% confidence
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Share to
        </Text>

        {/* Platform buttons */}
        {platforms.map(p => (
          <TouchableOpacity
            key={p.label}
            style={[
              styles.platformCard,
              {
                backgroundColor: theme.isDark ? p.bgDark : p.bg,
                borderColor: theme.divider,
              },
            ]}
            onPress={p.onPress}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, { backgroundColor: p.color }]}>
              <MaterialCommunityIcons name={p.icon} size={26} color="#FFFFFF" />
            </View>
            <Text style={[styles.platformLabel, { color: theme.textdark }]}>{p.label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShareScreen;

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
  badge: {
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 28,
    marginBottom: 32,
  },
  badgeLabel: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 22,
    marginTop: 12,
  },
  badgeConfidence: {
    fontFamily: FONTFAMILY.VivitaMedium,
    fontSize: 14,
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: FONTFAMILY.VivitaMedium,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  platformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  platformLabel: {
    flex: 1,
    fontFamily: FONTFAMILY.VivitaMedium,
    fontSize: 16,
  },
});
