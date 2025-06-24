import { useGameSettings } from '@/store/gameSettings'
import { useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function HomeScreen() {
  const router = useRouter()
  const setGameSettings = useGameSettings((state) => state.saveSettings)
  const gameSettings = useGameSettings((state) => state.gameSettings)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MAFIA</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setGameSettings({ ...gameSettings, gameMode: 'classic' })
          router.push('/setup')
        }}
      >
        <Text style={styles.buttonText}>START CLASSIC</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setGameSettings({ ...gameSettings, gameMode: 'yakuza' })
          router.push('/setup')
        }}
      >
        <Text style={styles.buttonText}>START YAKUZA</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B91C1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 60, color: '#fff', fontWeight: 'bold' },
  button: {
    marginTop: 30,
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 20 },
})
