import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type GameState = {
  alivePlayers: number[]
  deadPlayers?: number[]
  day: number
  night: number
  mafia: number[]
  don?: number
  detective?: number
  assassin?: number
  doctor?: number
  playerTalking: number
  mafiaVictim?: number
  healed?: number[]
  checked?: number[]
  checkedByDon?: number[]
  assassinVictim?: number
  winner?: 'Assassin' | 'Mafia' | 'Citizens' | 'Clan'
  fouls?: Record<number, number>
  candidates?: Record<number, number>
  candidatesInOrder?: number[]
  defenseRound?: number
  yakuza?: number
  shogun?: number
  rightHand?: number
  checkedByRH?: number[]
  yakuzaVictim?: number
  assassinRemainingKills?: number
}

interface GameStateStore {
  gameState: GameState
  setGameState: (state: GameState) => void
  resetGameState: () => void
}

export const useGameState = create<GameStateStore>()(
  persist(
    (set) => ({
      gameState: {
        alivePlayers: [],
        deadPlayers: [],
        day: 1,
        night: 1,
        mafia: [],
        playerTalking: 1,
      },
      setGameState: (state) => set({ gameState: state }),
      resetGameState: () =>
        set({
          gameState: {
            alivePlayers: [],
            deadPlayers: [],
            day: 1,
            night: 1,
            mafia: [],
            playerTalking: 1,
            detective: undefined,
            assassin: undefined,
            doctor: undefined,
            mafiaVictim: undefined,
            healed: undefined,
            checked: undefined,
            assassinVictim: undefined,
            winner: undefined,
            fouls: undefined,
            candidates: undefined,
            candidatesInOrder: undefined,
            defenseRound: undefined,
          },
        }),
    }),

    {
      name: 'game-state',
      storage: {
        getItem: async (key) => {
          const value = await AsyncStorage.getItem(key)
          return value ? JSON.parse(value) : null
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, JSON.stringify(value))
        },
        removeItem: async (key) => {
          await AsyncStorage.removeItem(key)
        },
      },
    }
  )
)
