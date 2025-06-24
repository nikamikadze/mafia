import Candidate from '@/components/Candidate'
import FoulsPopup from '@/components/Foul'
import MainButton from '@/components/MainButton'
import TimerCircle, { TimerCircleHandle } from '@/components/Timer'
import Title from '@/components/Title'
import { useGameSettings } from '@/store/gameSettings'
import { useGameState } from '@/store/gameState'
import { router } from 'expo-router'
import React, { useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'

export default function Day() {
  const gameState = useGameState((state) => state.gameState)
  const gameSettings = useGameSettings((state) => state.gameSettings)
  const setGameState = useGameState((state) => state.setGameState)
  const timerRef = useRef<TimerCircleHandle>(null)
  const [showFouls, setShowFouls] = useState(false)
  const [showCandidates, setShowCandidates] = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)
  const [countDownIsOver, setCountDownIsOver] = useState(false)

  function nextPlayer() {
    if (!gameSettings.numberOfPlayers) return
    const { playerTalking, night, alivePlayers } = gameState
    const totalPlayers = gameSettings.numberOfPlayers

    const startPlayer = ((night - 1) % totalPlayers) + 1

    const rotatedAlive = [
      ...alivePlayers.filter((p) => p >= startPlayer),
      ...alivePlayers.filter((p) => p < startPlayer),
    ]

    const currentIndex = rotatedAlive.indexOf(playerTalking)

    if (currentIndex === rotatedAlive.length - 1) {
      if (gameState.candidatesInOrder) {
        router.push('/defense')
      } else {
        setGameState({
          ...gameState,
          day: 1,
          night: night + 1,
          playerTalking: (night % totalPlayers) + 1,
        })
        router.push('/night')
        return
      }
    }

    const nextSpeaker = rotatedAlive[currentIndex + 1]

    setGameState({ ...gameState, playerTalking: nextSpeaker })
    timerRef.current?.stopAndResetTimer()
    setTimerRunning(false)
    setCountDownIsOver(false)
  }

  return (
    <View style={styles.container}>
      <Title text={`Day #${gameState.day}`} textColor='#A4161A' size='md' />
      <Title text={`Player ${gameState.playerTalking}`} />
      <TimerCircle
        ref={timerRef}
        onCountdownEnd={() => {
          setTimeout(() => {
            setCountDownIsOver(true)
          }, 0)
        }}
      />
      <View
        style={[
          {
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 60,
          },
          gameState.day > 1 && { gap: 35 },
        ]}
      >
        {countDownIsOver ? (
          <MainButton
            text='restart'
            color='#CEB9B7'
            bgColor='#A4161A'
            size='sm'
            onClick={() => {
              timerRef.current?.stopAndResetTimer()
              setTimerRunning(false)
              setCountDownIsOver(false)
            }}
            shadow={{
              shadowColor: '#00000040',
              shadowOffset: { width: -3, height: 4 },
              shadowOpacity: 0.7,
              shadowRadius: 0,
            }}
          />
        ) : (
          <>
            {timerRunning ? (
              <MainButton
                text='pause'
                color='#CEB9B7'
                bgColor='#A4161A'
                size='sm'
                onClick={() => {
                  timerRef.current?.stopTimer()
                  setTimerRunning(false)
                }}
                shadow={{
                  shadowColor: '#00000040',
                  shadowOffset: { width: -3, height: 4 },
                  shadowOpacity: 0.7,
                  shadowRadius: 0,
                }}
              />
            ) : (
              <MainButton
                text='start'
                color='#CEB9B7'
                bgColor='#A4161A'
                size='sm'
                onClick={() => {
                  timerRef.current?.startTimer()
                  setTimerRunning(true)
                }}
                shadow={{
                  shadowColor: '#00000040',
                  shadowOffset: { width: -3, height: 4 },
                  shadowOpacity: 0.7,
                  shadowRadius: 0,
                }}
              />
            )}
          </>
        )}

        <MainButton
          text='foul'
          color='#CEB9B7'
          bgColor='#161A1D'
          size='sm'
          onClick={() => {
            setShowFouls(true)
            timerRef.current?.stopTimer()
            setTimerRunning(false)
          }}
          shadow={{
            shadowColor: '#00000040',
            shadowOffset: { width: -4, height: 4 },
            shadowOpacity: 0.7,
            shadowRadius: 0,
          }}
          mt={-2}
        />
        {gameState.day > 1 && (
          <>
            <MainButton
              text='candidate'
              color='#CEB9B7'
              bgColor='#A4161A'
              size='sm'
              onClick={() => setShowCandidates(true)}
              shadow={{
                shadowColor: '#00000040',
                shadowOffset: { width: -3, height: 4 },
                shadowOpacity: 0.7,
                shadowRadius: 0,
              }}
              mt={-14}
            />
          </>
        )}
      </View>
      <MainButton
        text='next player'
        color='#161A1D'
        bgColor='#A4161A'
        size='md'
        onClick={() => nextPlayer()}
        shadow={{
          shadowColor: '#00000040',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.7,
          shadowRadius: 0,
        }}
      />
      <FoulsPopup
        visible={showFouls}
        onClose={() => {
          setShowFouls(false)
          timerRef.current?.startTimer()
          setTimerRunning(true)
        }}
      />
      <Candidate
        visible={showCandidates}
        onClose={() => setShowCandidates(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CEB9B7',
    justifyContent: 'space-around',
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
