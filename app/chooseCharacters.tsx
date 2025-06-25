import { default as Clickable } from '@/components/Clickable'
import CollapsibleSection from '@/components/CollapsibleSection'
import MainButton from '@/components/MainButton'
import Title from '@/components/Title'
import { useGameSettings } from '@/store/gameSettings'
import { useGameState } from '@/store/gameState'
import { router } from 'expo-router'
import React from 'react'
import { Alert, ScrollView, View } from 'react-native'

type GameState = {
  day: number
  night: number
  mafia: number[]
  don?: number
  detective?: number
  assassin?: number
  doctor?: number
  playerTalking: number
  mafiaVictim?: number
  healed?: number
  checked?: number
  assassinVictim?: number
  yakuza?: number
  shogun?: number
  rightHand?: number
}

export default function ChoosingCharacters() {
  const gameSettings = useGameSettings((state) => state.gameSettings)
  const gameState = useGameState((state) => state.gameState)

  const [gameCharacters, setGameCharacters] = React.useState<GameState>({
    day: 1,
    night: 1,
    mafia: [],
    playerTalking: 1,
    don: undefined,
    detective: undefined,
    assassin: undefined,
    yakuza: undefined,
    shogun: undefined,
    doctor: undefined,
    rightHand: undefined,
  })

  const saveGameState = useGameState((state) => state.setGameState)

  function submitCharacters() {
    const {
      mafia,
      detective,
      assassin,
      doctor,
      don,
      yakuza,
      shogun,
      rightHand,
    } = gameCharacters

    const {
      detective: isDetectiveEnabled,
      assassin: isAssassinEnabled,
      doctor: isDoctorEnabled,
      clan: isClanEnabled,
    } = gameSettings.characters

    const isDonEnabled = true
    const isRightHandEnabled =
      gameSettings.gameMode === 'yakuza' && isClanEnabled
    const isYakuzaMode = gameSettings.gameMode === 'yakuza' && isClanEnabled

    if (
      !mafia ||
      (isDetectiveEnabled && !detective) ||
      (isAssassinEnabled && !assassin) ||
      (isDoctorEnabled && !doctor) ||
      (isDonEnabled && !don) ||
      (isRightHandEnabled && !rightHand) ||
      (isYakuzaMode && (!yakuza || !shogun))
    ) {
      Alert.alert('Please select all enabled characters')
      return
    }

    const selectedRoles = [
      isDetectiveEnabled ? detective : undefined,
      isAssassinEnabled ? assassin : undefined,
      isDoctorEnabled ? doctor : undefined,
      isDonEnabled ? don : undefined,
      isRightHandEnabled ? rightHand : undefined,
      isYakuzaMode ? yakuza : undefined,
      isYakuzaMode ? shogun : undefined,
    ].filter((x): x is number => typeof x === 'number')

    const duplicates = new Set()
    const seen = new Set()

    for (const player of selectedRoles) {
      if (seen.has(player)) {
        duplicates.add(player)
      }
      seen.add(player)
    }

    if (duplicates.size > 0) {
      Alert.alert("Player can't have 2 roles!")
      return
    }

    const mafiaRestrictedRoles = selectedRoles.filter(
      (player) => player !== don && player !== rightHand
    )

    const overlapWithMafia = mafiaRestrictedRoles.some((player) =>
      mafia.includes(player)
    )

    if (overlapWithMafia) {
      Alert.alert("Player can't have 2 roles!")
      return
    }

    if (don && !mafia.includes(don)) {
      Alert.alert('Don must be in mafia team')
      return
    }

    if (isRightHandEnabled) {
      if (!mafia.includes(rightHand!)) {
        Alert.alert('Right Hand must be in mafia team')
        return
      }
      if (rightHand === don) {
        Alert.alert("Right Hand can't be Don")
        return
      }
    }

    if (gameSettings.numberOfPlayers) {
      const classicAssassin =
        gameSettings.gameMode === 'classic' ? assassin : undefined
      const yakuzaPlayer = isYakuzaMode ? yakuza : undefined
      const shogunPlayer = isYakuzaMode ? shogun : undefined
      const rightHandPlayer = isRightHandEnabled ? rightHand : undefined

      saveGameState({
        alivePlayers: Array.from(
          { length: gameSettings.numberOfPlayers },
          (_, i) => i + 1
        ),
        deadPlayers: [],
        day: 1,
        night: 1,
        mafia: mafia,
        don: don,
        rightHand: rightHandPlayer,
        detective: detective,
        assassin: classicAssassin,
        yakuza: yakuzaPlayer,
        shogun: shogunPlayer,
        doctor: doctor,
        playerTalking: 1,
        mafiaVictim: undefined,
        healed: undefined,
        checked: undefined,
        assassinVictim: undefined,
        assassinRemainingKills: gameSettings.assassinMaxKills,
      })

      router.push('/day')
    }
  }
  console.log('settings,', gameSettings)

  if (gameSettings.numberOfPlayers)
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: '#161A1D' }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Title text={`Night ${gameState.night}`} />
        <Title text={`Choose Characters`} />
        <CollapsibleSection title='mafia'>
          {Array.from({ length: gameSettings.numberOfPlayers }).map((_, i) => (
            <Clickable
              key={i}
              max={4}
              mb={i > 6 ? (i - 7) * 2 : i * 2}
              size='sm'
              staticValue={i + 1}
              currentOption={gameCharacters.mafia}
              setCurrentOption={(val: number) =>
                setGameCharacters((prev) => {
                  const maxMafia = gameSettings.characters.mafia ?? 3
                  const currentMafia = prev.mafia

                  let newMafia
                  if (currentMafia.includes(val)) {
                    newMafia = currentMafia.filter((item) => item !== val)
                  } else {
                    if (currentMafia.length >= maxMafia) {
                      newMafia = [...currentMafia.slice(1), val]
                    } else {
                      newMafia = [...currentMafia, val]
                    }
                  }

                  return {
                    ...prev,
                    mafia: newMafia,
                  }
                })
              }
            />
          ))}
        </CollapsibleSection>
        <CollapsibleSection title='don'>
          {Array.from({ length: gameSettings.numberOfPlayers }).map((_, i) => {
            const playerNumber = i + 1
            return (
              <Clickable
                key={i}
                max={4}
                mb={i > 6 ? (i - 7) * 2 : i * 2}
                size='sm'
                staticValue={playerNumber}
                currentOption={gameCharacters.don}
                setCurrentOption={(val: number) => {
                  if (gameCharacters.mafia.includes(val)) {
                    setGameCharacters((prev) => ({
                      ...prev,
                      don: val,
                    }))
                  }
                }}
              />
            )
          })}
        </CollapsibleSection>
        {gameSettings.characters.clan && (
          <>
            <CollapsibleSection title='right-hand'>
              {Array.from({ length: gameSettings.numberOfPlayers }).map(
                (_, i) => {
                  const playerNumber = i + 1
                  return (
                    <Clickable
                      key={i}
                      max={4}
                      mb={i > 6 ? (i - 7) * 2 : i * 2}
                      size='sm'
                      staticValue={playerNumber}
                      currentOption={gameCharacters.rightHand}
                      setCurrentOption={(val: number) => {
                        if (
                          gameCharacters.mafia.includes(val) &&
                          val !== gameCharacters.don
                        ) {
                          setGameCharacters((prev) => ({
                            ...prev,
                            rightHand: val,
                          }))
                        }
                      }}
                    />
                  )
                }
              )}
            </CollapsibleSection>
          </>
        )}

        {gameSettings.characters.doctor && (
          <CollapsibleSection title='doctor'>
            {Array.from({ length: gameSettings.numberOfPlayers }).map(
              (_, i) => (
                <Clickable
                  key={i}
                  max={4}
                  mb={i > 6 ? (i - 7) * 2 : i * 2}
                  size='sm'
                  staticValue={i + 1}
                  currentOption={gameCharacters.doctor}
                  setCurrentOption={(val: number) =>
                    setGameCharacters((prev) => ({ ...prev, doctor: val }))
                  }
                />
              )
            )}
          </CollapsibleSection>
        )}
        {gameSettings.characters.detective && (
          <CollapsibleSection title='detective'>
            {Array.from({ length: gameSettings.numberOfPlayers }).map(
              (_, i) => (
                <Clickable
                  key={i}
                  max={4}
                  mb={i > 6 ? (i - 7) * 2 : i * 2}
                  size='sm'
                  staticValue={i + 1}
                  currentOption={gameCharacters.detective}
                  setCurrentOption={(val: number) =>
                    setGameCharacters((prev) => ({ ...prev, detective: val }))
                  }
                />
              )
            )}
          </CollapsibleSection>
        )}
        {gameSettings.gameMode === 'classic' ? (
          <>
            {gameSettings.characters.assassin && (
              <CollapsibleSection title='assassin'>
                {Array.from({ length: gameSettings.numberOfPlayers }).map(
                  (_, i) => (
                    <Clickable
                      key={i}
                      max={4}
                      mb={i > 6 ? (i - 7) * 2 : i * 2}
                      size='sm'
                      staticValue={i + 1}
                      currentOption={gameCharacters.assassin}
                      setCurrentOption={(val: number) =>
                        setGameCharacters((prev) => ({
                          ...prev,
                          assassin: val,
                        }))
                      }
                    />
                  )
                )}
              </CollapsibleSection>
            )}
          </>
        ) : (
          <>
            {gameSettings.characters.clan && (
              <>
                <CollapsibleSection title='yakuza'>
                  {Array.from({ length: gameSettings.numberOfPlayers }).map(
                    (_, i) => (
                      <Clickable
                        key={i}
                        max={4}
                        mb={i > 6 ? (i - 7) * 2 : i * 2}
                        size='sm'
                        staticValue={i + 1}
                        currentOption={gameCharacters.yakuza}
                        setCurrentOption={(val: number) =>
                          setGameCharacters((prev) => ({
                            ...prev,
                            yakuza: val,
                          }))
                        }
                      />
                    )
                  )}
                </CollapsibleSection>
                <CollapsibleSection title='shogun'>
                  {Array.from({ length: gameSettings.numberOfPlayers }).map(
                    (_, i) => (
                      <Clickable
                        key={i}
                        max={4}
                        mb={i > 6 ? (i - 7) * 2 : i * 2}
                        size='sm'
                        staticValue={i + 1}
                        currentOption={gameCharacters.shogun}
                        setCurrentOption={(val: number) =>
                          setGameCharacters((prev) => ({
                            ...prev,
                            shogun: val,
                          }))
                        }
                      />
                    )
                  )}
                </CollapsibleSection>
              </>
            )}
          </>
        )}

        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            paddingRight: 30,
            justifyContent: 'flex-end',
          }}
        >
          <MainButton
            text='start'
            color='#CEB9B7'
            bgColor='#A4161A'
            size='sm'
            onClick={() => submitCharacters()}
            shadow={{
              shadowColor: 'white',
              shadowOffset: { width: -3, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
            }}
          />
        </View>
      </ScrollView>
    )
}
