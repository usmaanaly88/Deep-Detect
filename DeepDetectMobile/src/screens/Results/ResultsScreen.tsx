import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FONTFAMILY } from '../../constants/fontFamily'
import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { AppStackParamList } from '../../route/AppNavigator'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import LinearGradient from 'react-native-linear-gradient'
import { useTheme } from '../../hooks/useTheme'


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

  const handleCheckAnother = () => navigation.navigate('HomeScreen')
  const handleShare = () =>
    navigation.navigate('ShareScreen', { prediction: result.prediction, confidence, imageUri })

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.blueBackground }]}>
      <StatusBar
        barStyle={theme.statusBar}
        backgroundColor={theme.blueBackground}
        translucent={Platform.OS === 'android'}
      />
      <LinearGradient
        colors={[theme.blueBackground, theme.white]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.divider }]}>
          <TouchableOpacity 
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('HomeScreen');
              }
            }} 
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.blueDark} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textdark }]}>Detection Result</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareIconBtn}>
            <MaterialCommunityIcons name="share-variant" size={22} color={theme.blueDark} />
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { borderColor: theme.divider }]}
            resizeMode="cover"
          />
        </View>

        {/* Result Card */}
        <View style={[
          styles.resultCard,
          { backgroundColor: isAIGenerated ? theme.red + '18' : theme.greenAccent + '18' },
        ]}>
          <View style={[
            styles.resultIconContainer,
            { backgroundColor: isAIGenerated ? theme.red + '28' : theme.greenAccent + '28' },
          ]}>
            {isAIGenerated ? (
              <MaterialCommunityIcons name="robot" size={50} color={theme.red} />
            ) : (
              <MaterialCommunityIcons name="check-circle" size={50} color={theme.greenMuted} />
            )}
          </View>

          <Text style={[styles.resultLabel, { color: theme.textdark }]}>
            {isAIGenerated ? 'AI Generated' : 'Real Image'}
          </Text>

          <View style={styles.confidenceContainer}>
            <Text style={[styles.confidenceLabel, { color: theme.textSecondary }]}>Confidence</Text>
            <Text style={[styles.confidenceValue, { color: isAIGenerated ? theme.red : theme.greenMuted }]}>
              {confidence}%
            </Text>
          </View>

          <View style={[styles.progressBarContainer, { backgroundColor: theme.divider }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${confidence}%`,
                  backgroundColor: isAIGenerated ? theme.red : theme.greenMuted,
                },
              ]}
            />
          </View>
        </View>

        {/* Detailed Results */}
        {detailedResults.length > 0 && (
          <View style={styles.detailsContainer}>
            <Text style={[styles.detailsTitle, { color: theme.textdark }]}>Detailed Analysis</Text>
            {detailedResults.map((item, index) => (
              <View key={index} style={[styles.detailCard, { backgroundColor: theme.whiteSoft, borderColor: theme.divider }]}>
                <View style={styles.detailHeader}>
                  <Text style={[styles.detailLabel, { color: theme.textdark }]}>{item.label}</Text>
                  <Text style={[styles.detailScore, { color: theme.blueDark }]}>
                    {(item.score * 100).toFixed(1)}%
                  </Text>
                </View>
                <View style={[styles.detailProgressContainer, { backgroundColor: theme.divider }]}>
                  <View
                    style={[
                      styles.detailProgress,
                      {
                        width: `${item.score * 100}%`,
                        backgroundColor: item.label.toLowerCase().includes('ai')
                          ? theme.red
                          : theme.greenMuted,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.blueBackground }]}>
          <MaterialCommunityIcons name="information" size={24} color={theme.blueDark} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            {result.message ||
              (isAIGenerated
                ? 'This image appears to be AI-generated. The model has detected patterns commonly found in synthetic images.'
                : 'This image appears to be real. The model has detected natural patterns consistent with authentic photography.')}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>

          {/* Share */}
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.82}>
            <LinearGradient
              colors={[theme.blueDark, '#1B60A0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionBtnGrad}
            >
              <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Share Result</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Check Another */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnGap]}
            onPress={handleCheckAnother}
            activeOpacity={0.82}
          >
            <View style={[styles.actionBtnOutline, { borderColor: theme.blueDark, backgroundColor: theme.blueBackground }]}>
              <MaterialCommunityIcons name="camera-retake-outline" size={20} color={theme.blueDark} />
              <Text style={[styles.actionBtnText, { color: theme.blueDark }]}>Check Another Image</Text>
            </View>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ResultScreen

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 36 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: { padding: 5 },
  shareIconBtn: { padding: 5 },
  headerTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 18,
  },
  imageContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 25,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    borderWidth: 2,
  },
  resultCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
  },
  resultIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultLabel: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 28,
    marginBottom: 20,
  },
  confidenceContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  confidenceLabel: {
    fontFamily: FONTFAMILY.VivitaMedium,
    fontSize: 14,
    marginBottom: 5,
  },
  confidenceValue: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 48,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  detailsTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 20,
    marginBottom: 15,
  },
  detailCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 15,
    marginBottom: 10,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontFamily: FONTFAMILY.VivitaMedium,
    fontSize: 16,
  },
  detailScore: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 16,
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
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  infoText: {
    flex: 1,
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  actionBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#1B60A0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  actionBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    gap: 10,
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 10,
  },
  actionBtnGap: { marginTop: 12 },
  actionBtnText: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0.2,
  },
})