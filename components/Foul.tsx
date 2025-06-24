import { useGameSettings } from '@/store/gameSettings'
import { useGameState } from '@/store/gameState'
import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Modal from 'react-native-modal'

const { height } = Dimensions.get('window')

interface Props {
  visible: boolean
  onClose: () => void
}

type PlayerFoul = {
  fouls: number
  countdownLeft: number
  paused: boolean
  completed: boolean
}

type PlayerTimerData = {
  countdownLeft: number
  paused: boolean
  completed: boolean
}

export default function FoulsPopup({ visible, onClose }: Props) {
  const alivePlayers = useGameState((state) => state.gameState.alivePlayers)
  const gameSettings = useGameSettings((state) => state.gameSettings)
  const gameState = useGameState((state) => state.gameState)
  const setGameState = useGameState((state) => state.setGameState)
  const foulsFromStore = gameState.fouls || {}

  const maxFouls = gameSettings.fouls.limit ?? 3
  const foulTimerLimit = gameSettings.fouls.time ?? 7

  const [playerData, setPlayerData] = useState<Record<number, PlayerTimerData>>(
    {}
  )
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null)
  const [initialCountdown, setInitialCountdown] = useState(foulTimerLimit)
  const [initialCountdownRunning, setInitialCountdownRunning] = useState(false)
  const [hasSelectedPlayer, setHasSelectedPlayer] = useState(false)

  const pausedQueueRef = useRef<number[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (visible) {
      setInitialCountdown(foulTimerLimit)
      setInitialCountdownRunning(true)
      setHasSelectedPlayer(false)
    } else {
      stopCountdown()
      setInitialCountdownRunning(false)
      setActivePlayerId(null)
      pausedQueueRef.current = []
      setPlayerData({})
      setHasSelectedPlayer(false)
    }
  }, [visible])

  useEffect(() => {
    if (!visible) return
    if (!foulsFromStore) return

    intervalRef.current = setInterval(() => {
      setPlayerData((prev) => {
        const updated = { ...prev }

        if (activePlayerId !== null) {
          const current = updated[activePlayerId]
          if (current && !current.paused && !current.completed) {
            if (current.countdownLeft > 0) {
              updated[activePlayerId].countdownLeft -= 1
            } else {
              updated[activePlayerId].completed = true

              const newFoulCount = (foulsFromStore[activePlayerId] || 0) + 1

              setGameState({
                ...gameState,
                fouls: {
                  ...gameState.fouls,
                  [activePlayerId]: newFoulCount,
                },
              })

              const nextId = pausedQueueRef.current.pop()
              if (nextId !== undefined) {
                updated[nextId].paused = false
                setActivePlayerId(nextId)
              } else {
                setActivePlayerId(null)
              }
            }
          }
        } else if (initialCountdownRunning) {
          setInitialCountdown((prev) => Math.max(prev - 1, 0))
        }

        return updated
      })
    }, 1000)

    return () => stopCountdown()
  }, [activePlayerId, visible, initialCountdownRunning])

  const stopCountdown = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  const handlePlayerPress = (playerId: number) => {
    const foulCount = foulsFromStore[playerId] || 0

    // Check if max fouls reached
    if (foulCount >= maxFouls) {
      if (!gameState.deadPlayers?.includes(playerId)) {
        const updatedAlive = gameState.alivePlayers.filter(
          (p) => p !== playerId
        )
        setGameState({
          ...gameState,
          deadPlayers: [...(gameState.deadPlayers ?? []), playerId],
          night: gameState.night + 1,
          alivePlayers: updatedAlive,
        })
        onClose()
        router.push('/night')
      }
      return
    }

    // First-ever tap: if initial countdown is over, give foul instantly
    if (!hasSelectedPlayer) {
      setHasSelectedPlayer(true)
      setInitialCountdownRunning(false)

      if (initialCountdown <= 0) {
        const newFoulCount = (foulsFromStore[playerId] || 0) + 1
        setGameState({
          ...gameState,
          fouls: {
            ...gameState.fouls,
            [playerId]: newFoulCount,
          },
        })
        return
      }
    }

    setPlayerData((prev) => {
      const updated = { ...prev }

      if (!hasSelectedPlayer && initialCountdown > 0) {
        updated[playerId] = {
          countdownLeft: initialCountdown,
          paused: false,
          completed: false,
        }
      } else if (!updated[playerId]) {
        updated[playerId] = {
          countdownLeft: foulTimerLimit,
          paused: false,
          completed: false,
        }
      } else {
        const player = updated[playerId]
        if (player.completed || player.countdownLeft <= 0) {
          updated[playerId] = {
            ...player,
            countdownLeft: foulTimerLimit,
            paused: false,
            completed: false,
          }
        }
      }

      if (activePlayerId !== null && activePlayerId !== playerId) {
        updated[activePlayerId].paused = true
        pausedQueueRef.current.push(activePlayerId)
      }

      updated[playerId].paused = false
      updated[playerId].completed = false
      setActivePlayerId(playerId)

      return updated
    })
  }

  const renderPlayer = ({ item }: { item: number }) => {
    const data = playerData[item] || { countdownLeft: 0 }
    const isActive = item === activePlayerId
    const foulCount = foulsFromStore[item] || 0

    return (
      <TouchableOpacity
        style={[styles.playerRow, isActive && { backgroundColor: '#fde2d0' }]}
        onPress={() => handlePlayerPress(item)}
      >
        <Text style={styles.playerText}>PLAYER {item}</Text>
        <View style={styles.rightSection}>
          <Text
            style={[
              styles.foulCount,
              foulCount === maxFouls ? { color: 'red' } : { color: '#111' },
            ]}
          >
            {foulCount}
          </Text>
          {(data.countdownLeft > 0 || isActive) && (
            <Text style={styles.timerText}>{data.countdownLeft}s</Text>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropColor='black'
      backdropOpacity={0.3}
    >
      <View style={styles.container}>
        {activePlayerId === null && initialCountdownRunning && (
          <View style={styles.initialCountdownContainer}>
            <Text style={styles.initialCountdownText}>
              Timer: {initialCountdown}s
            </Text>
            <Text style={{ color: '#888', fontSize: 12 }}>
              Select who committed the foul
            </Text>
          </View>
        )}
        <FlatList
          data={alivePlayers}
          keyExtractor={(item) => item.toString()}
          renderItem={renderPlayer}
          contentContainerStyle={styles.list}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    height: height * 0.7,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  list: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f1d0cb',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  playerText: {
    fontWeight: 'bold',
    color: '#111',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  foulCount: {
    fontWeight: 'bold',
    color: '#111',
    fontSize: 16,
  },
  timerText: {
    fontWeight: 'bold',
    color: '#111',
    fontSize: 14,
  },
  initialCountdownContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  initialCountdownText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
})
