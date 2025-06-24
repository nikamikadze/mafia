import { useGameState } from '@/store/gameState'
import React from 'react'
import { Dimensions, FlatList, StyleSheet, View } from 'react-native'
import Modal from 'react-native-modal'
import Clickable from './Clickable'

const { height } = Dimensions.get('window')

interface Props {
  visible: boolean
  onClose: () => void
}

export default function Candidate({ visible, onClose }: Props) {
  const gameState = useGameState((state) => state.gameState)
  const candidates = useGameState((state) => state.gameState.candidates)
  const setGameState = useGameState((state) => state.setGameState)

  const reorderObject = (obj, day) => {
    if (obj === undefined) return

    const filteredEntries = Object.entries(obj).filter(
      ([_, value]) => value !== 0
    )

    const filteredObj = Object.fromEntries(filteredEntries)

    const keys = Object.keys(filteredObj)
      .map(Number)
      .sort((a, b) => a - b)

    let startIndex = keys.findIndex((k) => k >= day)
    if (startIndex === -1) startIndex = 0

    const orderedKeys = [
      ...keys.slice(startIndex),
      ...keys.slice(0, startIndex),
    ]

    const arrayResult = orderedKeys.map((k) => [String(k), filteredObj[k]])
    return arrayResult.map(([_, value]) => value)
  }

  const renderPlayer = ({ item }: { item: number }) => {
    return (
      <View style={{ alignItems: 'center' }}>
        <Clickable
          title={`Player ${item}`}
          staticValue={candidates ? candidates[item] : 0}
          availableValues={[
            0,
            ...gameState.alivePlayers.filter(
              (player) =>
                !Object.values(gameState.candidates || {}).includes(player) ||
                player === (gameState.candidates?.[item] ?? null)
            ),
          ]}
          onChange={(val) =>
            setGameState({
              ...gameState,
              candidates: {
                ...candidates,
                [item]: val,
              },
            })
          }
        />
      </View>
    )
  }

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={() => {
        const candidatesInOrder = reorderObject(candidates, gameState.day)
        setGameState({ ...gameState, candidatesInOrder })
        onClose()
      }}
      style={styles.modal}
      backdropColor='black'
      backdropOpacity={0.3}
    >
      <View style={styles.container}>
        <FlatList
          data={gameState.alivePlayers}
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
    backgroundColor: '#a4161a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  list: {
    paddingTop: 20,
    paddingBottom: 30,
  },
})
