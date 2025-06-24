import { useGameSettings } from '@/store/gameSettings'
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'

const { width: screenWidth } = Dimensions.get('window')
const CIRCLE_SIZE = screenWidth * 0.6

export type TimerCircleHandle = {
  startTimer: () => void
  stopAndResetTimer: () => void
  stopTimer: () => void
  timerColor?: string
}

const TimerCircle = forwardRef<
  TimerCircleHandle,
  { timerColor?: string; onCountdownEnd?: () => void }
>(({ timerColor, onCountdownEnd }, ref) => {
  const timeLimit =
    useGameSettings((state) => state.gameSettings.timeSettings.personal) ?? 60

  const [seconds, setSeconds] = useState(timeLimit)
  const intervalRef = useRef<number | null>(null)

  useImperativeHandle(ref, () => ({
    startTimer: () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      // setSeconds(timeLimit)
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            intervalRef.current = null
            if (onCountdownEnd) onCountdownEnd()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    stopAndResetTimer: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setSeconds(timeLimit)
    },
    stopTimer: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    },
  }))

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  return (
    <View
      style={[
        styles.circle,
        timerColor !== undefined && { borderColor: timerColor },
      ]}
    >
      <Text
        style={[styles.text, timerColor !== undefined && { color: timerColor }]}
      >
        {formatTime(seconds)}
      </Text>
    </View>
  )
})

const styles = StyleSheet.create({
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 10,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 80,
    fontWeight: 'bold',
    fontFamily: 'Jomhuria',
    color: '#000',
  },
})

export default TimerCircle

TimerCircle.displayName = 'TimerCircle'
