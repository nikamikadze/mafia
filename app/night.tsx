import Clickable from '@/components/Clickable'
import CollapsibleSection from '@/components/CollapsibleSection'
import MainButton from '@/components/MainButton'
import Title from '@/components/Title'
import { useGameSettings } from '@/store/gameSettings'
import { useGameState } from '@/store/gameState'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import ChoosingCharacters from './chooseCharacters'

type NightDecisions = {
  mafiaVictim: number
  donCheck: number
  healed: number
  checked: number
  checkedWasMafia?: boolean
  assassinVictim?: number
  yakuzaVictim?: number
}

export default function Night() {
  const gameSettings = useGameSettings((state) => state.gameSettings)
  const gameState = useGameState((state) => state.gameState)
  const saveGameState = useGameState((state) => state.setGameState)
  const [nightDecisions, setNightDecisions] = useState<NightDecisions>({
    mafiaVictim: 0,
    donCheck: 0,
    healed: 0,
    checked: 0,
    assassinVictim: undefined,
    yakuzaVictim: undefined,
  })

  const deadPlayers = gameState.deadPlayers

  function endOfNight() {
    const { gameMode, characters } = gameSettings
    const clanEnabled = characters.clan
    const isYakuzaMode = gameMode === 'yakuza' && clanEnabled

    const { mafia, don, detective, assassin, doctor, yakuza, shogun } =
      gameState
    const { mafiaVictim: mv, healed } = nightDecisions

    let mafiaIsDead =
      deadPlayers?.length && mafia.every((id) => deadPlayers.includes(id))

    if (!mafiaIsDead && mv === 0) {
      Alert.alert('Mafia must choose victim')
      return
    }

    const yakuzaIsAlive = yakuza && !deadPlayers?.includes(yakuza)
    const shogunIsAlive = shogun && !deadPlayers?.includes(shogun)
    const assassinIsAlive = assassin && !deadPlayers?.includes(assassin)

    if (isYakuzaMode && yakuzaIsAlive && nightDecisions.yakuzaVictim === 0) {
      Alert.alert('Yakuza must choose victim')
      return
    }

    if (
      !isYakuzaMode &&
      assassinIsAlive &&
      nightDecisions.assassinVictim === 0
    ) {
      Alert.alert('Assassin must choose victim')
      return
    }

    if (don && !deadPlayers?.includes(don) && nightDecisions.donCheck === 0) {
      Alert.alert('Don must check player')
      return
    }

    if (
      detective &&
      !deadPlayers?.includes(detective) &&
      nightDecisions.checked === 0
    ) {
      Alert.alert('Detective must check player')
      return
    }

    if (
      doctor &&
      !deadPlayers?.includes(doctor) &&
      nightDecisions.healed === 0
    ) {
      Alert.alert('Doctor must heal player')
      return
    }

    const mafiaVictim = mv === healed ? undefined : mv
    const rawSpecialVictim = isYakuzaMode
      ? nightDecisions.yakuzaVictim
      : nightDecisions.assassinVictim

    const specialVictim =
      rawSpecialVictim === healed || rawSpecialVictim === mv
        ? undefined
        : rawSpecialVictim

    const rawNewlyDead = [mafiaVictim, specialVictim]
    const newlyDead = rawNewlyDead.filter(
      (id): id is number => typeof id === 'number'
    )

    const updatedAlive = gameState.alivePlayers.filter(
      (p) => !newlyDead.includes(p)
    )

    const updatedDead =
      newlyDead.length === 0
        ? gameState.deadPlayers
        : [...(gameState.deadPlayers || []), ...newlyDead]

    const aliveMafia = mafia?.filter((p) => updatedAlive.includes(p)) || []

    const aliveAssassinOrYakuza = isYakuzaMode
      ? yakuza && updatedAlive.includes(yakuza)
      : assassin && updatedAlive.includes(assassin)

    const aliveCitizens = updatedAlive.filter(
      (p) => !aliveMafia.includes(p) && p !== aliveAssassinOrYakuza
    )

    const yakuzaTeamAliveCount = [yakuzaIsAlive, shogunIsAlive].filter(
      Boolean
    ).length

    let winner: 'Clan' | 'Assassin' | 'Mafia' | 'Citizens' | undefined

    if (
      isYakuzaMode &&
      yakuzaTeamAliveCount === 2 &&
      updatedAlive.length === 4
    ) {
      winner = 'Clan'
    } else if (
      isYakuzaMode &&
      yakuzaTeamAliveCount === 1 &&
      updatedAlive.length === 2
    ) {
      winner = 'Clan'
    } else if (!isYakuzaMode && updatedAlive.length === 2 && assassinIsAlive) {
      winner = 'Assassin'
    } else if (aliveMafia.length >= aliveCitizens.length) {
      winner = 'Mafia'
    } else if (
      aliveMafia.length === 0 &&
      !assassinIsAlive &&
      !yakuzaIsAlive &&
      !shogunIsAlive
    ) {
      winner = 'Citizens'
    }

    saveGameState({
      ...gameState,
      day: gameState.night,
      playerTalking: updatedAlive[gameState.night - 1],
      mafiaVictim,
      assassinVictim: !isYakuzaMode ? specialVictim : undefined,
      yakuzaVictim: isYakuzaMode ? specialVictim : undefined,
      healed: gameState.healed
        ? [...gameState.healed, nightDecisions.healed]
        : [nightDecisions.healed],
      checked: gameState.checked
        ? [...gameState.checked, nightDecisions.checked]
        : [nightDecisions.checked],
      checkedByDon: gameState.checkedByDon
        ? [...gameState.checkedByDon, nightDecisions.donCheck]
        : [nightDecisions.donCheck],
      alivePlayers: updatedAlive,
      deadPlayers: updatedDead,
      winner,
    })

    if (winner) return router.push(`/gameOver`)
    if (!mafiaVictim && !specialVictim) router.push('/day')
    else router.push('/lastWords')
  }

  const isFirstNight =
    gameState.night === 2 && gameState.shogun && gameState.yakuza

  if (!gameSettings.numberOfPlayers) return

  if (gameState.night === 1) return <ChoosingCharacters />
  else {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: '#161A1D' }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Title
          text={`Night #${gameState.night}`}
          bgColor='#A4161A'
          textColor='#161A1D'
          mt={15}
          size='md'
        />

        {!isFirstNight &&
          !gameState.mafia.every(
            (item) => !gameState.deadPlayers?.includes(item)
          ) && (
            <CollapsibleSection title='mafia'>
              {Array.from({ length: gameSettings.numberOfPlayers }).map(
                (_, i) => {
                  const playerNumber = i + 1
                  const isDead = gameState.deadPlayers?.includes(playerNumber)

                  return (
                    <Clickable
                      key={i}
                      max={4}
                      mb={i > 6 ? (i - 7) * 2 : i * 2}
                      size='sm'
                      staticValue={playerNumber}
                      color={
                        gameState.mafia.includes(playerNumber)
                          ? 'red'
                          : undefined
                      }
                      currentOption={nightDecisions.mafiaVictim}
                      blockedCauseDead={isDead}
                      setCurrentOption={(val: number) =>
                        setNightDecisions((prev) => ({
                          ...prev,
                          mafiaVictim: val,
                        }))
                      }
                    />
                  )
                }
              )}
            </CollapsibleSection>
          )}

        {gameState.don !== undefined &&
          !gameState.deadPlayers?.includes(gameState.don) && (
            <CollapsibleSection title='don'>
              {Array.from({ length: gameSettings.numberOfPlayers }).map(
                (_, i) => {
                  const playerNumber = i + 1
                  const wasChecked =
                    gameState.checkedByDon?.includes(playerNumber)
                  const isDetective = gameState.detective === playerNumber

                  return (
                    <Clickable
                      key={i}
                      max={4}
                      mb={i > 6 ? (i - 7) * 2 : i * 2}
                      size='sm'
                      staticValue={playerNumber}
                      color={gameState.don === playerNumber ? 'red' : undefined}
                      currentOption={nightDecisions.donCheck}
                      blockedCauseCheckedAsDetective={wasChecked && isDetective}
                      blockedCauseCheckedByDon={wasChecked && !isDetective}
                      backgroundColor={
                        nightDecisions.donCheck === playerNumber
                          ? gameState.detective === playerNumber
                            ? '#4efc03'
                            : 'black'
                          : undefined
                      }
                      setCurrentOption={(val: number) =>
                        setNightDecisions((prev) => ({
                          ...prev,
                          donCheck: val,
                        }))
                      }
                    />
                  )
                }
              )}
            </CollapsibleSection>
          )}

        {!isFirstNight &&
          gameSettings.characters.doctor &&
          gameState.doctor !== undefined &&
          !gameState.deadPlayers?.includes(gameState.doctor) && (
            <CollapsibleSection title='doctor'>
              {Array.from({ length: gameSettings.numberOfPlayers }).map(
                (_, i) => {
                  const playerNumber = i + 1
                  const isDead = gameState.deadPlayers?.includes(playerNumber)
                  const isAlreadyHealed =
                    gameState.healed?.includes(playerNumber)

                  return (
                    <Clickable
                      key={i}
                      max={4}
                      color={
                        gameState.doctor === playerNumber ? 'green' : undefined
                      }
                      mb={i > 6 ? (i - 7) * 2 : i * 2}
                      size='sm'
                      staticValue={playerNumber}
                      currentOption={nightDecisions.healed}
                      blockedCauseHealed={isAlreadyHealed}
                      blockedCauseDead={isDead}
                      setCurrentOption={(val: number) =>
                        setNightDecisions((prev) => ({
                          ...prev,
                          healed: val,
                        }))
                      }
                    />
                  )
                }
              )}
            </CollapsibleSection>
          )}

        {gameSettings.characters.detective &&
          gameState.detective !== undefined &&
          !gameState.deadPlayers?.includes(gameState.detective) && (
            <CollapsibleSection title='detective'>
              {Array.from({ length: gameSettings.numberOfPlayers }).map(
                (_, i) => {
                  const playerNumber = i + 1
                  const wasChecked = gameState.checked?.includes(playerNumber)
                  const isMafia = gameState.mafia?.includes(playerNumber)

                  return (
                    <Clickable
                      key={i}
                      max={4}
                      mb={i > 6 ? (i - 7) * 2 : i * 2}
                      size='sm'
                      staticValue={playerNumber}
                      currentOption={nightDecisions.checked}
                      blockedCauseCheckedAsMafia={wasChecked && isMafia}
                      blockedCauseCheckedAsCitizen={wasChecked && !isMafia}
                      backgroundColor={
                        nightDecisions.checked === playerNumber
                          ? gameState.mafia?.includes(playerNumber) ||
                            playerNumber === gameState.yakuza
                            ? 'black'
                            : 'red'
                          : undefined
                      }
                      setCurrentOption={(val: number) => {
                        const isMafia = gameState.mafia?.includes(val) ?? false
                        setNightDecisions((prev) => ({
                          ...prev,
                          checked: val,
                          checkedWasMafia: isMafia,
                        }))
                      }}
                    />
                  )
                }
              )}
            </CollapsibleSection>
          )}

        {gameSettings.characters.assassin &&
          gameState.assassin !== undefined &&
          !gameState.deadPlayers?.includes(gameState.assassin) && (
            <CollapsibleSection title='assassin'>
              {Array.from({ length: gameSettings.numberOfPlayers }).map(
                (_, i) => {
                  const playerNumber = i + 1
                  const isDead = gameState.deadPlayers?.includes(playerNumber)
                  const isEarlyNight = gameState.night <= 2

                  return (
                    <Clickable
                      key={i}
                      max={4}
                      mb={i > 6 ? (i - 7) * 2 : i * 2}
                      color={
                        gameState.assassin === playerNumber ? 'red' : undefined
                      }
                      size='sm'
                      staticValue={playerNumber}
                      currentOption={nightDecisions.assassinVictim}
                      blockedCauseDead={isDead || isEarlyNight}
                      setCurrentOption={(val: number) =>
                        setNightDecisions((prev) => {
                          if (prev.assassinVictim === val) {
                            return {
                              ...prev,
                              assassinVictim: undefined,
                            }
                          }
                          return {
                            ...prev,
                            assassinVictim: val,
                          }
                        })
                      }
                    />
                  )
                }
              )}
            </CollapsibleSection>
          )}

        {!isFirstNight &&
          gameSettings.characters.clan &&
          gameState.yakuza !== undefined &&
          !gameState.deadPlayers?.includes(gameState.yakuza) && (
            <CollapsibleSection title='yakuza'>
              {Array.from({ length: gameSettings.numberOfPlayers }).map(
                (_, i) => {
                  const playerNumber = i + 1
                  const isDead = gameState.deadPlayers?.includes(playerNumber)

                  return (
                    <Clickable
                      key={i}
                      max={4}
                      mb={i > 6 ? (i - 7) * 2 : i * 2}
                      color={
                        gameState.assassin === playerNumber ? 'red' : undefined
                      }
                      size='sm'
                      staticValue={playerNumber}
                      currentOption={nightDecisions.yakuzaVictim}
                      blockedCauseDead={isDead}
                      setCurrentOption={(val: number) =>
                        setNightDecisions((prev) => {
                          if (prev.yakuzaVictim === val) {
                            return {
                              ...prev,
                              yakuzaVictim: undefined,
                            }
                          }
                          return {
                            ...prev,
                            yakuzaVictim: val,
                          }
                        })
                      }
                    />
                  )
                }
              )}
            </CollapsibleSection>
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
            onClick={() => endOfNight()}
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
}
