import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { AppStackParamList } from '../../route/AppNavigator';
import { getHistory, HistoryItem } from '../../services/firestore';
import { getCurrentUID } from '../../services/auth';
import { useTheme } from '../../hooks/useTheme';
import { FONTFAMILY } from '../../constants/fontFamily';

type HistoryNavigationProp = StackNavigationProp<AppStackParamList, 'HistoryScreen'>;

type HistoryScreenProps = {
  navigation: HistoryNavigationProp;
};

const formatDate = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const HistoryScreen = ({ navigation }: HistoryScreenProps) => {
  const theme = useTheme();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchHistory = useCallback(async () => {
    try {
      setError(null);
      const uid = getCurrentUID();
      if (!uid) {
        setError('Not signed in. Please restart the app.');
        return;
      }
      const items = await getHistory(uid);
      setHistory(items);
      
      // Animate in when loaded
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (e: any) {
      setError('Failed to load history. Pull down to retry.');
      console.error('[HistoryScreen]', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fadeAnim]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleItemPress = (item: HistoryItem) => {
    navigation.navigate('ResultScreen', {
      imageUri: item.imageUrl,
      result: {
        prediction: item.prediction,
        confidence: item.confidence,
      },
    });
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const isAI = item.prediction === 'ai';
    const badgeColor = isAI ? theme.red : theme.greenPrimary;
    const badgeBg = isAI ? theme.red + '15' : theme.greenPrimary + '15';

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.whiteSoft, borderColor: theme.border }]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.9}
      >
        {/* Image Thumbnail wrapper with scan visual */}
        <View style={styles.thumbWrapper}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={[styles.overlayIndicator, { backgroundColor: badgeColor }]} />
        </View>

        {/* Content Info block */}
        <View style={styles.cardContent}>
          <View style={[styles.predBadge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.predText, { color: badgeColor }]}>
              {isAI ? 'Deep-Fake' : 'Real Image'}
            </Text>
          </View>

          <View style={styles.confidenceRow}>
            <Text style={[styles.confLabel, { color: theme.textSecondary }]}>Confidence:</Text>
            <Text style={[styles.confValue, { color: theme.textdark }]}>
              {Math.round(item.confidence)}%
            </Text>
          </View>

          {/* Mini aesthetic confidence bar */}
          <View style={[styles.barBg, { backgroundColor: theme.divider }]}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.round(item.confidence)}%` as any,
                  backgroundColor: badgeColor,
                },
              ]}
            />
          </View>

          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>

        {/* Action Chevron */}
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={theme.blueDark}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[theme.blueSoft, theme.blueBackground]}
        style={styles.emptyIconCircle}
      >
        <MaterialCommunityIcons name="shield-history" size={48} color={theme.blueDark} />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: theme.textdark }]}>No History Yet</Text>
      <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
        Your scan history will appear here once you check images.
      </Text>
      <TouchableOpacity
        style={[styles.analyzeNowBtn, { borderColor: theme.border, backgroundColor: theme.whiteSoft }]}
        onPress={() => navigation.navigate('HomeScreen')}
        activeOpacity={0.8}
      >
        <Text style={[styles.analyzeNowText, { color: theme.blueDark }]}>
          Check an Image
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.red} />
      <Text style={[styles.emptyTitle, { color: theme.textdark }]}>Oops!</Text>
      <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>{error}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.white }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.white} />

      {/* Modern minimal header */}
      <View style={[styles.header, { borderBottomColor: theme.divider, backgroundColor: theme.whiteSoft }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: theme.graySurface }]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={theme.blueDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textdark }]}>History</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.blueDark} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading history...
          </Text>
        </View>
      ) : error ? (
        renderError()
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={history}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.listContent,
              history.length === 0 && styles.listContentEmpty,
            ]}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.blueDark]}
                tintColor={theme.blueDark}
              />
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  placeholder: { width: 36 },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: FONTFAMILY.VivitaMedium,
    fontSize: 14,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  listContentEmpty: {
    flex: 1,
  },
  separator: {
    height: 12,
  },

  // ── Card Styles ─────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  thumbWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 14,
  },
  overlayIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  predBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 2,
  },
  predText: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 11,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confLabel: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 12,
  },
  confValue: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 13,
  },
  barBg: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
    marginTop: 2,
  },
  barFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  dateText: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 10,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 4,
  },

  // ── Empty / Error Styles ─────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 14,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 20,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  analyzeNowBtn: {
    marginTop: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  analyzeNowText: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 14,
  },
});
