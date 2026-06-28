import React, { useEffect } from 'react'
import { StyleSheet, Text, View, Animated, StatusBar } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { COLORS } from '../../constants/colors'
import { FONTFAMILY } from '../../constants/fontFamily'
import { StackNavigationProp } from '@react-navigation/stack'
import { AppStackParamList } from '../../route/AppNavigator'
import Svg, { Path, Circle } from 'react-native-svg'
import AsyncStorage from '@react-native-async-storage/async-storage'

type SplashScreenNavigationProp = StackNavigationProp<AppStackParamList, 'SplashScreen'>

type SplashScreenProps = {
  navigation: SplashScreenNavigationProp
}

const ONBOARDING_KEY = 'onboardingComplete'

const SplashScreen = ({ navigation }: SplashScreenProps) => {
  const fadeAnim = new Animated.Value(0)
  const scaleAnim = new Animated.Value(0.5)
  const rotateAnim = new Animated.Value(0)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ),
    ]).start()

    const timer = setTimeout(async () => {
      try {
        const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY)
        if (onboardingDone === 'true') {
          navigation.replace('HomeScreen')
        } else {
          navigation.replace('OnboardingScreen')
        }
      } catch (_) {
        // If storage fails, default to onboarding
        navigation.replace('OnboardingScreen')
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [navigation])


  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <LinearGradient
      colors={[COLORS.blueDark, COLORS.bluePrimary, COLORS.greenAccent]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.blueDark} />
      
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Custom Logo */}
        <View style={styles.logoContainer}>
          {/* Rotating outer ring */}
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Svg width="150" height="150" viewBox="0 0 150 150">
              <Circle
                cx="75"
                cy="75"
                r="70"
                stroke={COLORS.white}
                strokeWidth="2"
                fill="none"
                opacity="0.3"
                strokeDasharray="10 5"
              />
            </Svg>
          </Animated.View>

          {/* Center Icon */}
          <View style={styles.centerIcon}>
            <Svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              {/* Shield */}
              <Path
                d="M12 2L4 6V12C4 17.55 7.84 22.54 12 23C16.16 22.54 20 17.55 20 12V6L12 2Z"
                fill={COLORS.white}
              />
              {/* AI Brain dot pattern */}
              <Circle cx="12" cy="10" r="1.5" fill={COLORS.greenAccent} />
              <Circle cx="9" cy="12" r="1.5" fill={COLORS.greenAccent} />
              <Circle cx="15" cy="12" r="1.5" fill={COLORS.greenAccent} />
              <Circle cx="12" cy="14" r="1.5" fill={COLORS.greenAccent} />
              {/* Connecting lines */}
              <Path
                d="M12 10L9 12M12 10L15 12M9 12L12 14M15 12L12 14"
                stroke={COLORS.greenAccent}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </Svg>
          </View>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>DeepDetect</Text>
        
        {/* Tagline */}
        <Text style={styles.tagline}>AI Image Detection</Text>
        
        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.dotContainer}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  )
}

export default SplashScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
  },
  logoContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerIcon: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 40,
    color: COLORS.white,
    marginBottom: 8,
    letterSpacing: 2,
  },
  tagline: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    letterSpacing: 1,
  },
  loadingContainer: {
    marginTop: 50,
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.white,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
})