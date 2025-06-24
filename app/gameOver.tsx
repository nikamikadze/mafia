import MainButton from '@/components/MainButton'
import Title from '@/components/Title'
import { useGameState } from '@/store/gameState'
import { router } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'

export default function GameOver() {
  const gameState = useGameState((state) => state.gameState)
  const resetGameState = useGameState((state) => state.resetGameState)
  console.log('game over', gameState)

  if (gameState.winner)
    return (
      <View style={styles.container}>
        <Title
          text='Winner Team'
          textColor='#A4161A'
          bgColor='#CEB9B7'
          size='lg'
        />
        <Title text={gameState.winner} textColor='#CEB9B7' bgColor='#161A1D' />
        <MainButton
          text='restart'
          bgColor='#CEB9B7'
          size='sm'
          color='#161A1D'
          onClick={async () => {
            await (useGameState as any).persist.clearStorage?.()
            resetGameState()
            router.push('/night')
          }}
        />
      </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: '#A4161A',
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
