import React, { useEffect, useState, useCallback } from 'react';
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
    } catch (e: any) {
      setError('Failed to load history. Pull down to retry.');
      console.error('[HistoryScreen]', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
    const badgeColor = isAI ? theme.red : theme.greenMuted;
    const badgeBg = isAI ? theme.red + '20' : theme.greenAccent + '20';

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.whiteSoft, borderColor: theme.divider }]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.82}
      >
        {/* Thumbnail */}
        <View style={styles.thumbWrapper}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          {/* Prediction overlay badge on image */}
          <View style={[styles.overlayBadge, { backgroundColor: badgeColor }]}>
            <MaterialCommunityIcons
              name={isAI ? 'robot' : 'check-circle'}
              size={10}
              color="#fff"
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={[styles.predBadge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.predText, { color: badgeColor }]}>
              {isAI ? 'AI Generated' : 'Real Image'}
            </Text>
          </View>

          <View style={styles.confidenceRow}>
            <Text style={[styles.confLabel, { color: theme.textSecondary }]}>
              Confidence
            </Text>
            <Text style={[styles.confValue, { color: theme.textdark }]}>
              {Math.round(item.confidence)}%
            </Text>
          </View>

          {/* Mini confidence bar */}
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

        {/* Chevron */}
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={theme.textSecondary}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[theme.blueSoft ?? '#EBF2FF', theme.blueBackground]}
        style={styles.emptyIconCircle}
      >
        <MaterialCommunityIcons name="history" size={52} color={theme.blueDark} />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: theme.textdark }]}>No History Yet</Text>
      <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
        Analyze your first image to see results here.
      </Text>
      <TouchableOpacity
        style={[styles.analyzeNowBtn, { borderColor: theme.blueDark }]}
        onPress={() => navigation.navigate('HomeScreen')}
        activeOpacity={0.82}
      >
        <Text style={[styles.analyzeNowText, { color: theme.blueDark }]}>
          Analyze an Image
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="alert-circle-outline" size={52} color={theme.red} />
      <Text style={[styles.emptyTitle, { color: theme.textdark }]}>Oops!</Text>
      <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>{error}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.white }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.white} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.blueDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textdark }]}>Analysis History</Text>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 18,
  },
  placeholder: { width: 32 },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingText: {
    fontFamily: FONTFAMILY.VivitaMedium,
    fontSize: 15,
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

  // ── Card ────────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  overlayBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 5,
  },
  predBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 2,
  },
  predText: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 12,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confLabel: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 12,
  },
  confValue: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 14,
  },
  barBg: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 2,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  dateText: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 11,
    marginTop: 3,
  },
  chevron: {
    marginLeft: 6,
  },

  // ── Empty / Error ────────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 22,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  analyzeNowBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  analyzeNowText: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 15,
  },
});
