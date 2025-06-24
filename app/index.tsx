import HomeScreen from '@/app/HomeScreen'
import { useGameSettings } from '@/store/gameSettings'
import { useGameState } from '@/store/gameState'
import * as Font from 'expo-font'
import React, { useEffect } from 'react'

export default function App() {
  const resetGameState = useGameState((state) => state.resetGameState)

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Jomhuria: require('../assets/fonts/Jomhuria-Regular.ttf'),
      })
    }
    loadFonts()
  }, [])

  async function test() {
    console.log('clearing')

    await (useGameSettings as any).persist.clearStorage?.()
    await (useGameState as any).persist.clearStorage?.()
    resetGameState()
  }
  test()
  return <HomeScreen />
}
