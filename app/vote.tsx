import Clickable from '@/components/Clickable'
import MainButton from '@/components/MainButton'
import Title from '@/components/Title'
import { useGameState } from '@/store/gameState'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import LastWords from './lastWords'

export default function Vote() {
  const router = useRouter()
  const gameState = useGameState((state) => state.gameState)
  const setGameState = useGameState((state) => state.setGameState)
  const [votes, setVotes] = useState<Record<number, number>>({})
  const [lastWordsVisible, setLastWordsVisible] = useState<number[]>([])
  const [finalDecisionVote, setFinalDecisionVote] = useState(false)

  function results() {
    let updatedVotes = { ...votes }
    const voteEntries = Object.entries(updatedVotes)
    if (voteEntries.length === 0) return null

    const totalVotes = voteEntries.reduce((sum, [_, count]) => sum + count, 0)
    const expectedVotes = gameState.alivePlayers.length

    if (totalVotes !== expectedVotes) {
      const lastVoted =
        gameState.candidatesInOrder?.[gameState.candidatesInOrder.length - 1]

      if (lastVoted !== undefined && (updatedVotes[lastVoted] || 0) === 0) {
        const missingVotes = expectedVotes - totalVotes
        updatedVotes[lastVoted] = missingVotes
      } else {
        alert(
          `Error: total votes (${totalVotes}) do not match number of alive players (${expectedVotes}).`
        )
        return
      }
    }

    const maxVotes = Math.max(...Object.values(updatedVotes))

    const topCandidates = Object.entries(updatedVotes)
      .filter(([_, count]) => count === maxVotes)
      .map(([id]) => Number(id))

    if (topCandidates.length === 1) {
      const winner = topCandidates[0]
      console.log(`Player ${winner} is executed.`)
      setGameState({
        ...gameState,
        day: gameState.night,
        night: gameState.night + 1,
        candidates: undefined,
        candidatesInOrder: undefined,
        deadPlayers: [...(gameState.deadPlayers || []), winner],
        alivePlayers: gameState.alivePlayers.filter((p) => p !== winner),
      })
      setLastWordsVisible([winner])
    } else {
      console.log('Tie between:', topCandidates)

      if (gameState.defenseRound === 2) {
        setFinalDecisionVote(true)
        setGameState({
          ...gameState,
          defenseRound: undefined,
        })
        return
      }
      setGameState({
        ...gameState,
        candidatesInOrder: topCandidates,
        defenseRound: 2,
      })
      setVotes({})
      router.push('/defense')
      return null
    }
  }

  function KillBoth() {
    const candidates = gameState.candidatesInOrder
    if (!candidates) return

    setGameState({
      ...gameState,
      night: gameState.night + 1,
      candidates: undefined,
      candidatesInOrder: undefined,
      defenseRound: undefined,
      deadPlayers: [...(gameState.deadPlayers || []), ...candidates],
      alivePlayers: gameState.alivePlayers.filter(
        (p) => !candidates.includes(p)
      ),
    })
    setLastWordsVisible(candidates)
  }

  function KeepBoth() {
    const candidates = gameState.candidatesInOrder
    if (!candidates) return

    setGameState({
      ...gameState,
      night: gameState.night + 1,
      candidates: undefined,
      candidatesInOrder: undefined,
      defenseRound: undefined,
    })
  }
  return (
    <>
      {lastWordsVisible.length > 0 ? (
        <LastWords deadByVotes={lastWordsVisible} />
      ) : (
        <View style={styles.container}>
          <Title text='Vote' />

          <View style={{ gap: 10 }}>
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontSize: 40,
                fontFamily: 'Jomhuria',
              }}
            >
              All remaining votes will go to bottom player
            </Text>
            <Text
              style={{
                color: '#a6a6a6',
                textAlign: 'center',
                fontSize: 32,
                fontFamily: 'Jomhuria',
              }}
            >
              Leave last players vote to 0 or input exact votes
            </Text>
          </View>
          <View
            style={{
              width: '100%',
              alignItems: 'center',
            }}
          >
            {finalDecisionVote ? (
              <View style={{ gap: 30, marginBottom: 50 }}>
                <MainButton
                  text='Execute both'
                  bgColor='#161A1D'
                  color='#CEB9B7'
                  size='md'
                  onClick={() => KillBoth()}
                />
                <MainButton
                  text='Keep both'
                  bgColor='#B1A7A6'
                  color='#A4161A'
                  size='md'
                  onClick={() => KeepBoth()}
                />
              </View>
            ) : (
              <>
                {gameState.candidatesInOrder &&
                  gameState.candidatesInOrder.map((cand, index) => (
                    <>
                      <Clickable
                        key={index}
                        title={`Player ${cand}`}
                        max={gameState.alivePlayers.length}
                        staticValue={votes[cand]}
                        onChange={(val) => {
                          setVotes((prevVotes) => {
                            const newVoteCount = (prevVotes[cand] || 0) + 1

                            return {
                              ...prevVotes,
                              [cand]:
                                newVoteCount > gameState.alivePlayers.length
                                  ? 0
                                  : newVoteCount,
                            }
                          })
                        }}
                      />
                    </>
                  ))}
              </>
            )}
          </View>

          {!finalDecisionVote && (
            <MainButton
              text='results'
              bgColor='#161A1D'
              color='#A4161A'
              size='md'
              onClick={() => results()}
            />
          )}
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B91C1C',
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
