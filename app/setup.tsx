import { default as Clickable } from '@/components/Clickable'
import MainButton from '@/components/MainButton'
import Title from '@/components/Title'
import { useGameSettings } from '@/store/gameSettings'
import { router } from 'expo-router'
import React from 'react'
import { Alert, View } from 'react-native'

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
}

export default function App() {
  const [gameSettings, setGameSettings] = React.useState<GameSettings>({
    numberOfPlayers: undefined,
    characters: {
      mafia: 0,
      detective: false,
      doctor: false,
      assassin: undefined,
      clan: undefined,
    },
    timeSettings: {
      personal: 30,
      defense: 30,
      lastWord: 30,
    },
    fouls: {
      limit: undefined,
      time: undefined,
    },
  })

  const saveSettings = useGameSettings((state) => state.saveSettings)
  const settings = useGameSettings((state) => state.gameSettings)

  function submitOptions() {
    const { numberOfPlayers, characters, fouls } = gameSettings

    // Check number of players
    if (!numberOfPlayers) {
      return Alert.alert('Missing setting', 'Please select number of players.')
    }

    const mafiaCount = characters.mafia
    if (typeof mafiaCount !== 'number' || mafiaCount <= 0) {
      return Alert.alert(
        'Missing setting',
        'Please set mafia count greater than 0.'
      )
    }

    if (fouls.limit == null || fouls.time == null) {
      return Alert.alert('Missing setting', 'Please set all foul settings.')
    }

    saveSettings(gameSettings)

    router.push('/night')
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#B91C1C' }}>
      <Title text='choose number of players' mt={15} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Clickable
            key={i}
            max={4}
            mb={i * 5}
            staticValue={i + 8}
            currentOption={gameSettings.numberOfPlayers}
            setCurrentOption={(val: number) =>
              setGameSettings((prev) => ({ ...prev, numberOfPlayers: val }))
            }
          />
        ))}
      </View>
      <Title text='choose characters' />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%',
          flexWrap: 'wrap',
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Clickable
            title='Mafia'
            max={4}
            onChange={(value: number) =>
              setGameSettings((prev) => ({
                ...prev,
                characters: {
                  ...prev.characters,
                  mafia: value,
                },
              }))
            }
          />
          <Clickable
            title='detective'
            toggle
            mb={15}
            onToggle={() =>
              setGameSettings((prev) => ({
                ...prev,
                characters: {
                  ...prev.characters,
                  detective: !prev.characters.detective,
                },
              }))
            }
          />
        </View>
        <View style={{ flexDirection: 'row', marginTop: -25 }}>
          <Clickable
            toggle
            title='doctor'
            onToggle={() =>
              setGameSettings((prev) => ({
                ...prev,
                characters: {
                  ...prev.characters,
                  doctor: !prev.characters.doctor,
                },
              }))
            }
          />
          {settings.gameMode === 'classic' ? (
            <Clickable
              toggle
              title='assassin'
              mb={15}
              onToggle={() =>
                setGameSettings((prev) => ({
                  ...prev,
                  characters: {
                    ...prev.characters,
                    assassin: !prev.characters.assassin,
                  },
                }))
              }
            />
          ) : (
            <Clickable
              toggle
              title='clan'
              mb={15}
              onToggle={() =>
                setGameSettings((prev) => ({
                  ...prev,
                  characters: {
                    ...prev.characters,
                    clan: !prev.characters.clan,
                  },
                }))
              }
            />
          )}
        </View>
      </View>
      <Title text='choose time' />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%',
          flexWrap: 'wrap',
        }}
      >
        <Clickable
          title='personal'
          max={4}
          isTimeInput
          onChange={(value: number) =>
            setGameSettings((prev) => ({
              ...prev,
              timeSettings: {
                ...prev.timeSettings,
                personal: value,
              },
            }))
          }
        />
        <Clickable
          title='defense'
          mb={15}
          isTimeInput
          onChange={(value: number) =>
            setGameSettings((prev) => ({
              ...prev,
              timeSettings: {
                ...prev.timeSettings,
                defense: value,
              },
            }))
          }
        />
        <View style={{ marginTop: -10 }}>
          <Clickable
            title='last word'
            isTimeInput
            onChange={(value: number) =>
              setGameSettings((prev) => ({
                ...prev,
                timeSettings: {
                  ...prev.timeSettings,
                  lastWord: value,
                },
              }))
            }
          />
        </View>
      </View>
      <Title text='fouls' />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <Clickable
          title='Limit'
          max={5}
          onChange={(value: number) =>
            setGameSettings((prev) => ({
              ...prev,
              fouls: {
                ...prev.fouls,
                limit: value,
              },
            }))
          }
        />
        <Clickable
          title='Time'
          max={15}
          mb={15}
          onChange={(value: number) =>
            setGameSettings((prev) => ({
              ...prev,
              fouls: {
                ...prev.fouls,
                time: value,
              },
            }))
          }
        />
      </View>
      <MainButton
        text='start'
        color='#A4161A'
        bgColor='#B1A7A6'
        size='lg'
        onClick={submitOptions}
      />
    </View>
  )
}
