import React, { useEffect, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FONTFAMILY } from '../../constants/fontFamily'
import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { AppStackParamList } from '../../route/AppNavigator'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import LinearGradient from 'react-native-linear-gradient'
import { useTheme } from '../../hooks/useTheme'
import Svg, { Circle, G } from 'react-native-svg'

type ResultScreenRouteProp = RouteProp<AppStackParamList, 'ResultScreen'>
type ResultScreenNavigationProp = StackNavigationProp<AppStackParamList, 'ResultScreen'>

type ResultScreenProps = {
  route: ResultScreenRouteProp
  navigation: ResultScreenNavigationProp
}

const ResultScreen = ({ route, navigation }: ResultScreenProps) => {
  const theme = useTheme()
  const { imageUri, result } = route.params

  const isAIGenerated = result.prediction === 'ai'
  const confidence = Math.round(result.confidence ?? 0)
  const detailedResults: { label: string; score: number }[] = result.detailedResults ?? []

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const circleProgress = useRef(new Animated.Value(0)).current
  const cardFlip = useRef(new Animated.Value(0)).current // 3D Y-axis flip

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(cardFlip, {
        toValue: 1,
        friction: 5.5,
        tension: 30,
        useNativeDriver: true,
      }),
      Animated.timing(circleProgress, {
        toValue: confidence,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start()
  }, [confidence])

  const handleCheckAnother = () => navigation.navigate('HomeScreen')
  const handleShare = () =>
    navigation.navigate('ShareScreen', { prediction: result.prediction, confidence, imageUri })

  // Gauge calculations
  const size = 150
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  // 3D card Y-rotation interpolation
  const flipY = cardFlip.interpolate({
    inputRange: [0, 1],
    outputRange: ['90deg', '0deg'],
  })

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.white }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.white} />

      {/* Modern minimal header */}
      <View style={[styles.header, { borderBottomColor: theme.divider, backgroundColor: theme.whiteSoft }]}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack()
            } else {
              navigation.navigate('HomeScreen')
            }
          }}
          style={[styles.backButton, { backgroundColor: theme.graySurface }]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={theme.blueDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textdark }]}>Analysis Report</Text>
        <TouchableOpacity
          onPress={handleShare}
          style={[styles.backButton, { backgroundColor: theme.graySurface }]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="share-variant" size={20} color={theme.blueDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* Dual image/result preview block */}
          <View style={styles.topSection}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
              <View style={[styles.scanLine, { backgroundColor: isAIGenerated ? theme.red : theme.greenPrimary }]} />
            </View>
          </View>

          {/* Premium Circular Gauge Result Card with 3D flip reveal */}
          <Animated.View style={[styles.resultCard, { backgroundColor: theme.whiteSoft, borderColor: isAIGenerated ? 'rgba(255, 0, 85, 0.35)' : 'rgba(0, 255, 135, 0.35)', transform: [{ perspective: 600 }, { rotateY: flipY }] }]}>
            
            <View style={styles.gaugeContainer}>
              <Svg width={size} height={size}>
                <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                  {/* Background Circle */}
                  <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={theme.whitedark}
                    strokeWidth={strokeWidth}
                  />
                  {/* Colored Progress Circle */}
                  <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={isAIGenerated ? theme.red : theme.greenPrimary}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={circleProgress.interpolate({
                      inputRange: [0, 100],
                      outputRange: [circumference, 0],
                    })}
                    strokeLinecap="round"
                  />
                </G>
              </Svg>
              <View style={styles.gaugeTextContainer}>
                <Text style={[styles.gaugePercent, { color: theme.textdark }]}>{confidence}%</Text>
                <Text style={[styles.gaugeLabel, { color: theme.textSecondary }]}>Confidence</Text>
              </View>
            </View>

            <View style={[styles.badge, { backgroundColor: isAIGenerated ? 'rgba(255, 0, 85, 0.12)' : 'rgba(0, 255, 135, 0.12)', borderWidth: 1, borderColor: isAIGenerated ? 'rgba(255, 0, 85, 0.3)' : 'rgba(0, 255, 135, 0.3)' }]}>
              <MaterialCommunityIcons 
                name={isAIGenerated ? "robot-industrial" : "check-decagram"} 
                size={22} 
                color={isAIGenerated ? theme.red : theme.greenPrimary} 
              />
              <Text style={[styles.badgeText, { color: isAIGenerated ? theme.red : theme.greenPrimary }]}>
                {isAIGenerated ? 'Deep-Fake Detected' : 'Authentic Image'}
              </Text>
            </View>
          </Animated.View>

          {/* Forensic breakdown */}
          {detailedResults.length > 0 && (
            <View style={styles.detailsContainer}>
              <Text style={[styles.detailsTitle, { color: theme.textdark }]}>Analysis Details</Text>
              {detailedResults.map((item, index) => {
                const itemScore = Math.round(item.score * 100)
                const isItemAI = item.label.toLowerCase().includes('ai') || item.label.toLowerCase().includes('fake')
                return (
                  <View key={index} style={[styles.detailCard, { backgroundColor: theme.whiteSoft, borderColor: theme.border }]}>
                    <View style={styles.detailHeader}>
                      <Text style={[styles.detailLabel, { color: theme.textdark }]}>{item.label}</Text>
                      <Text style={[styles.detailScore, { color: isItemAI ? theme.red : theme.greenPrimary }]}>
                        {itemScore}%
                      </Text>
                    </View>
                    <View style={[styles.detailProgressContainer, { backgroundColor: theme.divider }]}>
                      <View
                        style={[
                          styles.detailProgress,
                          {
                            width: `${itemScore}%`,
                            backgroundColor: isItemAI ? theme.red : theme.greenPrimary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                )
              })}
            </View>
          )}

          {/* Explanatory Info Card */}
          <View style={[styles.infoCard, { backgroundColor: theme.blueSurface, borderColor: theme.border }]}>
            <View style={styles.infoIconBg}>
              <MaterialCommunityIcons name="shield-text" size={20} color={theme.blueDark} />
            </View>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {result.message ||
                (isAIGenerated
                ? 'This image looks like a deep-fake. The patterns match deep-fake pictures.'
                : 'This image looks real. The patterns match real pictures.')}
            </Text>
          </View>

          {/* Action Row */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.9}>
              <LinearGradient
                colors={[theme.blueDark, theme.bluePrimary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionBtnGrad}
              >
                <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Share Report</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnGap]}
              onPress={handleCheckAnother}
              activeOpacity={0.9}
            >
              <View style={[styles.actionBtnOutline, { borderColor: theme.border, backgroundColor: theme.whiteSoft }]}>
                <MaterialCommunityIcons name="camera-retake" size={20} color={theme.blueMedium} />
              <Text style={[styles.actionBtnText, { color: theme.blueMedium }]}>Check Another</Text>
              </View>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

export default ResultScreen

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
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
  topSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 24,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    opacity: 0.8,
  },
  resultCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  gaugeContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  gaugeTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  gaugePercent: {
    fontSize: 28,
    fontFamily: FONTFAMILY.VivitaBold,
  },
  gaugeLabel: {
    fontSize: 11,
    fontFamily: FONTFAMILY.VivitaLight,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  detailsTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 16,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  detailCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 14,
  },
  detailScore: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 14,
  },
  detailProgressContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  detailProgress: {
    height: '100%',
    borderRadius: 3,
  },
  infoCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 13,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  actionBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 8,
  },
  actionBtnGap: { marginLeft: 12 },
  actionBtnText: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 14,
    color: '#fff',
  },
})