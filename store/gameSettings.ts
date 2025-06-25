import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GameSettings {
  numberOfPlayers?: number
  characters: {
    mafia?: number
    detective?: boolean
    doctor?: boolean
    assassin?: boolean
    clan?: boolean
  }
  timeSettings: {
    personal?: number
    defense?: number
    lastWord?: number
  }
  fouls: {
    limit?: number
    time?: number
  }
  gameMode?: 'classic' | 'yakuza'
  assassinMaxKills?: number
}

interface GameSettingsState {
  gameSettings: GameSettings
  saveSettings: (settings: GameSettings) => void
}

export const useGameSettings = create<GameSettingsState>()(
  persist(
    (set) => ({
      gameSettings: {
        characters: {},
        timeSettings: {},
        fouls: {},
      },
      saveSettings: (settings) => set({ gameSettings: settings }),
    }),
    {
      name: 'game-settings',
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
