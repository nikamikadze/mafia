import MainButton from '@/components/MainButton'
import TimerCircle, { TimerCircleHandle } from '@/components/Timer'
import Title from '@/components/Title'
import { useGameSettings } from '@/store/gameSettings'
import { useGameState } from '@/store/gameState'
import { router } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'

export default function LastWords({ deadByVotes }: { deadByVotes?: number[] }) {
  const gameState = useGameState((state) => state.gameState)
  const saveGameState = useGameState((state) => state.setGameState)
  const gameSettings = useGameSettings((state) => state.gameSettings)
  const timerRef = useRef<TimerCircleHandle>(null)
  const [timerRunning, setTimerRunning] = useState(false)
  const [countDownIsOver, setCountDownIsOver] = useState(false)
  const [victimIndex, setVictimIndex] = useState(0)

  const { gameMode, characters } = gameSettings
  const isYakuzaMode = gameMode === 'yakuza' && characters.clan

  const mafiaVictim = gameState.mafiaVictim
  const specialVictim = isYakuzaMode
    ? gameState.yakuzaVictim
    : gameState.assassinVictim

  const victimList = useMemo(() => {
    const list: number[] = []

    if (
      mafiaVictim !== undefined &&
      specialVictim !== undefined &&
      mafiaVictim !== specialVictim
    ) {
      console.log('randomizing')
      if (Math.random() < 0.5) {
        list.push(mafiaVictim, specialVictim)
      } else {
        list.push(specialVictim, mafiaVictim)
      }
    } else {
      if (mafiaVictim !== undefined) list.push(mafiaVictim)
      if (specialVictim !== undefined && specialVictim !== mafiaVictim)
        list.push(specialVictim)
    }

    return list
  }, [mafiaVictim, specialVictim])

  const victim = deadByVotes
    ? deadByVotes[victimIndex]
    : victimList[victimIndex]

  useEffect(() => {
    const { gameMode, characters } = gameSettings
    const clanEnabled = characters.clan
    const isYakuzaMode = gameMode === 'yakuza' && clanEnabled

    const aliveMafia =
      gameState.mafia?.filter((p) => gameState.alivePlayers.includes(p)) || []

    const aliveAssassin =
      gameState.assassin && gameState.alivePlayers.includes(gameState.assassin)
        ? gameState.assassin
        : undefined

    const yakuzaAlive =
      isYakuzaMode &&
      gameState.yakuza &&
      gameState.alivePlayers.includes(gameState.yakuza)

    const shogunAlive =
      isYakuzaMode &&
      gameState.shogun &&
      gameState.alivePlayers.includes(gameState.shogun)

    const yakuzaTeamAliveCount = [yakuzaAlive, shogunAlive].filter(
      Boolean
    ).length

    let winner: 'Clan' | 'Assassin' | 'Mafia' | 'Citizens' | undefined =
      undefined

    if (
      isYakuzaMode &&
      yakuzaTeamAliveCount === 2 &&
      gameState.alivePlayers.length === 4
    ) {
      winner = 'Clan'
    } else if (
      isYakuzaMode &&
      yakuzaTeamAliveCount === 1 &&
      gameState.alivePlayers.length === 2
    ) {
      winner = 'Clan'
    } else if (
      !isYakuzaMode &&
      gameState.alivePlayers.length === 2 &&
      aliveAssassin
    ) {
      winner = 'Assassin'
    } else if (
      aliveMafia.length >=
      gameState.alivePlayers.length - aliveMafia.length
    ) {
      winner = 'Mafia'
    } else if (
      aliveMafia.length === 0 &&
      !aliveAssassin &&
      !yakuzaAlive &&
      !shogunAlive
    ) {
      winner = 'Citizens'
    }
    console.log('winner FROM LASTWORDS,', winner)

    if (winner) {
      saveGameState({ ...gameState, winner })
      router.push(`/gameOver`)
    }
  }, [
    gameState.alivePlayers,
    gameState.assassin,
    gameState.mafia,
    gameState.yakuza,
    gameState.shogun,
    gameSettings,
    gameState,
    saveGameState,
  ])

  const finishLastWords = () => {
    if (gameState.deadPlayers === undefined) return

    timerRef.current?.stopAndResetTimer()
    setTimerRunning(false)
    setCountDownIsOver(false)

    if (deadByVotes) {
      if (victimIndex + 1 < deadByVotes.length) {
        setVictimIndex(victimIndex + 1)
      } else {
        router.push('/night')
      }
      return
    }

    if (victimIndex + 1 < victimList.length) {
      setVictimIndex(victimIndex + 1)
    } else {
      router.push('/day')
    }
  }

  return (
    <View style={styles.container}>
      <Title text={`Last words`} />
      <Title text={`Player ${victim}`} />
      <TimerCircle
        ref={timerRef}
        timerColor='#CEB9B7'
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
        {/* <MainButton
          text='foul'
          color='#161A1D'
          bgColor='#CEB9B7'
          size='sm'
          onClick={() => console.log(12)}
          shadow={{
            shadowColor: '#00000040',
            shadowOffset: { width: -4, height: 4 },
            shadowOpacity: 0.7,
            shadowRadius: 0,
          }}
          mt={-3}
        /> */}
      </View>
      <MainButton
        text='Next'
        color='#161A1D'
        bgColor='#A4161A'
        size='md'
        onClick={() => finishLastWords()}
        shadow={{
          shadowColor: '#00000040',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.7,
          shadowRadius: 0,
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
