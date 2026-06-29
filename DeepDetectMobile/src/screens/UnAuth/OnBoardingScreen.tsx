import React, { useRef, useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ViewToken,
  StatusBar,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { FONTFAMILY } from '../../constants/fontFamily'
import { StackNavigationProp } from '@react-navigation/stack'
import { AppStackParamList } from '../../route/AppNavigator'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AppButton from '../../components/Custom/AppButton'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '../../hooks/useTheme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

type OnboardingNavigationProp = StackNavigationProp<AppStackParamList, 'OnboardingScreen'>

type OnboardingScreenProps = {
  navigation: OnboardingNavigationProp
}

type OnboardingSlide = {
  id: string
  title: string
  description: string
  iconName: string
  iconSize?: number
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to\nDeepDetect',
    description: 'Instantly verify if an image is Deep-Fake or real with advanced detection technology',
    iconName: 'shield-check-outline',
    iconSize: 120,
  },
  {
    id: '2',
    title: 'Upload Any\nImage',
    description: 'Simply select any image from your gallery to start the detection process',
    iconName: 'cloud-upload-outline',
    iconSize: 120,
  },
  {
    id: '3',
    title: 'Instant\nDetection',
    description: 'Get accurate results in seconds with confidence percentage and detailed analysis',
    iconName: 'brain',
    iconSize: 120,
  },
]

const OnboardingScreen = ({ navigation }: OnboardingScreenProps) => {
  const theme = useTheme()
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0)
      }
    }
  ).current

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      })
    }
  }
  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true')
    } catch (_) {
      // silently ignore storage errors
    }
    navigation.navigate('HomeScreen')
  }

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: theme.blueSurface, borderColor: theme.border }]}>
          <MaterialCommunityIcons 
            name={item.iconName} 
            size={item.iconSize || 100} 
            color={theme.blueMedium} 
          />
        </View>
      </View>
      <Text style={[styles.title, { color: theme.textdark }]}>{item.title}</Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>{item.description}</Text>
    </View>
  )

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: theme.blueMedium },
            index === currentIndex ? [styles.dotActive, { backgroundColor: theme.blueDark }] : null,
          ]}
        />
      ))}
    </View>
  )

  return (
    <LinearGradient
      colors={[theme.white, theme.blueSurface, theme.white]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.white} />
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Dots Indicator */}
      {renderDots()}

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity 
            style={[styles.nextButton, { backgroundColor: theme.blueDark }]} 
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <Text style={[styles.nextButtonText, { color: '#ffffff' }]}>Next</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <AppButton
            text="Get Started"
            onPress={handleGetStarted}
            colors={[theme.blueDark, theme.bluePrimary]}
            textStyle={styles.buttonText}
          />
        )}
      </View>
    </LinearGradient>
  )
}

export default OnboardingScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 50,
  },
  iconCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  title: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 40,
  },
  description: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.3,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    opacity: 1,
  },
  bottomContainer: {
    marginBottom: 80,
    paddingHorizontal: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 28,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  nextButtonText: {
    fontFamily: FONTFAMILY.VivitaMedium,
    fontSize: 17,
  },
  buttonText: {
    color: '#ffffff',
    fontFamily: FONTFAMILY.VivitaBold,
  },
})