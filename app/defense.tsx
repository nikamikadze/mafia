import FoulsPopup from '@/components/Foul'
import MainButton from '@/components/MainButton'
import TimerCircle, { TimerCircleHandle } from '@/components/Timer'
import Title from '@/components/Title'
import { useGameState } from '@/store/gameState'
import { router } from 'expo-router'
import React, { useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'

export default function Defense() {
  const timerRef = useRef<TimerCircleHandle>(null)
  const candidatesInOrder = useGameState(
    (state) => state.gameState.candidatesInOrder
  )
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [countDownIsOver, setCountDownIsOver] = useState(false)
  const [showFouls, setShowFouls] = useState(false)

  if (candidatesInOrder === undefined) return
  const candidate = candidatesInOrder[candidateIndex]

  function finishDefense() {
    if (candidatesInOrder === undefined) return

    if (candidateIndex + 1 < candidatesInOrder.length) {
      setCandidateIndex((prev) => prev + 1)
    } else {
      router.push('/vote')
    }

    timerRef.current?.stopAndResetTimer()
    setTimerRunning(false)
    setCountDownIsOver(false)
  }

  return (
    <View style={styles.container}>
      <Title
        text={`Defense`}
        bgColor='#A4161A'
        textColor='#161A1D'
        mt={15}
        size='md'
      />
      <Title text={`Player ${candidate}`} />
      <TimerCircle
        ref={timerRef}
        timerColor='#A4161A'
        onCountdownEnd={() => {
          setTimeout(() => {
            setCountDownIsOver(true)
          }, 0)
        }}
      />

      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 60,
        }}
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
        ) : timerRunning ? (
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
        <MainButton
          text='foul'
          color='#161A1D'
          bgColor='#CEB9B7'
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
        />
      </View>
      <MainButton
        text='Next'
        color='#161A1D'
        bgColor='#A4161A'
        size='md'
        onClick={() => finishDefense()}
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161A1D',
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
