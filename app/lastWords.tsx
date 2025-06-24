import MainButton from '@/components/MainButton'
import TimerCircle, { TimerCircleHandle } from '@/components/Timer'
import Title from '@/components/Title'
import { useGameSettings } from '@/store/gameSettings'
import { useGameState } from '@/store/gameState'
import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'

export default function LastWords({ deadByVotes }: { deadByVotes?: number[] }) {
  const gameState = useGameState((state) => state.gameState)
  const gameSettings = useGameSettings((state) => state.gameSettings)
  const timerRef = useRef<TimerCircleHandle>(null)
  const [timerRunning, setTimerRunning] = useState(false)
  const [countDownIsOver, setCountDownIsOver] = useState(false)

  const mafiaVictim = gameState.mafiaVictim
  const assassinVictim = gameState.assassinVictim

  let victimList: number[] = []
  if (mafiaVictim !== undefined) victimList.push(mafiaVictim)
  if (assassinVictim !== undefined && assassinVictim !== mafiaVictim)
    victimList.push(assassinVictim)

  if (victimList.length === 2) {
    const firstIndex = Math.random() < 0.5 ? 0 : 1

    victimList.splice(firstIndex, 1)
  }

  const [victimIndex, setVictimIndex] = useState(0)
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

    const aliveSpecial =
      isYakuzaMode && (yakuzaAlive || shogunAlive)
        ? [gameState.yakuza, gameState.shogun].filter(
            (p) => p && gameState.alivePlayers.includes(p)
          )
        : aliveAssassin
        ? [aliveAssassin]
        : []

    const aliveCitizens = gameState.alivePlayers.filter(
      (p) => !aliveMafia.includes(p) && !aliveSpecial.includes(p)
    )

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
    } else if (aliveMafia.length >= aliveCitizens.length) {
      winner = 'Mafia'
    } else if (
      aliveMafia.length === 0 &&
      !aliveAssassin &&
      !yakuzaAlive &&
      !shogunAlive
    ) {
      winner = 'Citizens'
    }

    if (winner) return router.push(`/gameOver`)
  }, [
    gameState.alivePlayers,
    gameState.assassin,
    gameState.mafia,
    gameState.yakuza,
    gameState.shogun,
    gameSettings,
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
